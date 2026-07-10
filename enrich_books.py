import os
import re
import sys
import time
import queue
import threading
from concurrent.futures import ThreadPoolExecutor
import requests
import psycopg2

# Global blocks to handle rate-limiting and skip slow APIs dynamically
GOOGLE_BOOKS_BLOCKED = False
google_books_lock = threading.Lock()

def load_env(env_path):
    env_vars = {}
    if not os.path.exists(env_path):
        return env_vars
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                val = val.strip()
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                elif val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                env_vars[key.strip()] = val
    return env_vars

def parse_jdbc_url(jdbc_url):
    match = re.search(r"jdbc:postgresql://([^:/]+)(?::(\d+))?/([^?#\s]+)", jdbc_url)
    if match:
        host = match.group(1)
        port = match.group(2) or "5432"
        dbname = match.group(3)
        return host, port, dbname
    return None, None, None

def standardize_isbn(isbn):
    if not isbn:
        return None
    cleaned = "".join(c for c in isbn if c.isalnum())
    if len(cleaned) == 9:
        cleaned = "0" + cleaned
    return cleaned

def clean_title(title):
    if not title:
        return ""
    # Remove text in parentheses
    title = re.sub(r'\(.*?\)', '', title)
    title = re.sub(r'\[.*?\]', '', title)
    # Take part before colon
    if ':' in title:
        title = title.split(':', 1)[0]
    return title.strip()

def is_vietnamese(text):
    if not text:
        return False
    vn_chars = re.compile(r'[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]')
    return bool(vn_chars.search(text))

def is_valid_description(desc):
    if not desc:
        return False
    if len(desc) < 30:
        return False
    if is_vietnamese(desc):
        return False
    return True

def extract_page_count_from_pagination(pagination):
    if not pagination:
        return None
    if isinstance(pagination, int):
        return pagination
    if isinstance(pagination, str):
        # Match pattern of numbers followed by p., pages, or just numbers before comma
        # e.g., "401, 13p." -> 401
        # e.g., "xii, 345 p." -> 345
        # e.g., "345" -> 345
        parts = [p.strip() for p in pagination.split(',')]
        for part in parts:
            match = re.search(r'\b(\d+)\s*(p\.|pages|page|trang)?\b', part, re.IGNORECASE)
            if match:
                val = int(match.group(1))
                if 10 <= val <= 3000:  # Sensible range for pages
                    return val
    return None

def make_request_with_retry(url, headers=None, timeout=10, max_retries=2):
    global GOOGLE_BOOKS_BLOCKED
    
    # If Google Books API is blocked globally, skip this request
    if "googleapis.com" in url and GOOGLE_BOOKS_BLOCKED:
        return None
        
    delay = 1.0
    for attempt in range(max_retries):
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
            if r.status_code == 200:
                return r
            elif r.status_code == 429:
                if "googleapis.com" in url:
                    with google_books_lock:
                        if not GOOGLE_BOOKS_BLOCKED:
                            print("\n[WARNING] Google Books API returned 429 (Rate Limit). Disabling Google Books queries for this run to avoid delays.", flush=True)
                            GOOGLE_BOOKS_BLOCKED = True
                    return None
                
                print(f"\n[Rate Limit 429] Hitting rate limit on {url[:60]}... Sleeping {delay:.1f}s (Attempt {attempt+1}/{max_retries})", flush=True)
                time.sleep(delay)
                delay *= 2  # Exponential backoff
            else:
                return r
        except Exception as e:
            # Short sleep and retry on connection errors
            time.sleep(0.5)
    return None

def fetch_from_open_library_by_isbn(isbn):
    headers = {
        'User-Agent': 'BookstoreEnrichmentAgent/1.0 (contact: support@bookstore.com)'
    }
    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=details"
    r = make_request_with_retry(url, headers=headers)
    if r and r.status_code == 200:
        try:
            data = r.json()
            key = f"ISBN:{isbn}"
            if key in data:
                book_data = data[key]
                details = book_data.get('details', {})
                page_count = details.get('number_of_pages')
                if not page_count:
                    page_count = extract_page_count_from_pagination(details.get('pagination'))
                
                description = None
                desc_obj = details.get('description')
                if desc_obj:
                    if isinstance(desc_obj, str):
                        description = desc_obj
                    elif isinstance(desc_obj, dict) and 'value' in desc_obj:
                        description = desc_obj['value']
                
                if not description and 'works' in details:
                    works = details['works']
                    if works and len(works) > 0:
                        work_key = works[0].get('key')
                        if work_key:
                            work_desc = fetch_open_library_work_description(work_key)
                            if work_desc:
                                description = work_desc
                
                return {
                    'page_count': page_count,
                    'description': description
                }
        except Exception:
            pass
    return None

def fetch_open_library_work_description(work_key):
    headers = {
        'User-Agent': 'BookstoreEnrichmentAgent/1.0 (contact: support@bookstore.com)'
    }
    url = f"https://openlibrary.org{work_key}.json"
    r = make_request_with_retry(url, headers=headers)
    if r and r.status_code == 200:
        try:
            data = r.json()
            desc = data.get('description')
            if desc:
                if isinstance(desc, str):
                    return desc
                elif isinstance(desc, dict) and 'value' in desc:
                    return desc['value']
        except Exception:
            pass
    return None

def fetch_from_open_library_by_search(title, author):
    headers = {
        'User-Agent': 'BookstoreEnrichmentAgent/1.0 (contact: support@bookstore.com)'
    }
    cleaned = clean_title(title)
    url = f"https://openlibrary.org/search.json?title={requests.utils.quote(cleaned)}&author={requests.utils.quote(author)}&fields=title,author_name,number_of_pages,number_of_pages_median,isbn,key,edition_key"
    r = make_request_with_retry(url, headers=headers)
    if r and r.status_code == 200:
        try:
            data = r.json()
            docs = data.get('docs', [])
            if docs:
                doc = docs[0]
                page_count = doc.get('number_of_pages_median') or doc.get('number_of_pages')
                work_key = doc.get('key')
                description = None
                
                isbns = doc.get('isbn', [])
                if isbns:
                    isbn_details = fetch_from_open_library_by_isbn(isbns[0])
                    if isbn_details:
                        # Merge page count from search if isbn details doesn't have it
                        if not isbn_details.get('page_count') and page_count:
                            isbn_details['page_count'] = page_count
                        return isbn_details
                        
                if work_key:
                    description = fetch_open_library_work_description(work_key)
                return {
                    'page_count': page_count,
                    'description': description
                }
        except Exception:
            pass
    return None

def fetch_from_open_library_by_search_general(title, author):
    headers = {
        'User-Agent': 'BookstoreEnrichmentAgent/1.0 (contact: support@bookstore.com)'
    }
    query = f"{title} {author}"
    url = f"https://openlibrary.org/search.json?q={requests.utils.quote(query)}&fields=title,author_name,number_of_pages,number_of_pages_median,isbn,key,edition_key"
    r = make_request_with_retry(url, headers=headers)
    if r and r.status_code == 200:
        try:
            data = r.json()
            docs = data.get('docs', [])
            if docs:
                doc = docs[0]
                page_count = doc.get('number_of_pages_median') or doc.get('number_of_pages')
                work_key = doc.get('key')
                description = None
                
                isbns = doc.get('isbn', [])
                if isbns:
                    isbn_details = fetch_from_open_library_by_isbn(isbns[0])
                    if isbn_details:
                        if not isbn_details.get('page_count') and page_count:
                            isbn_details['page_count'] = page_count
                        return isbn_details
                        
                if work_key:
                    description = fetch_open_library_work_description(work_key)
                return {
                    'page_count': page_count,
                    'description': description
                }
        except Exception:
            pass
    return None

def fetch_from_google_books(isbn=None, title=None, author=None, api_key=None):
    if isbn:
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}&langRestrict=en"
    elif title and author:
        cleaned = clean_title(title)
        url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{requests.utils.quote(cleaned)}+inauthor:{requests.utils.quote(author)}&langRestrict=en"
    else:
        return None
        
    if api_key:
        url += f"&key={api_key}"
        
    r = make_request_with_retry(url)
    if r and r.status_code == 200:
        try:
            data = r.json()
            items = data.get('items', [])
            if items:
                volume_info = items[0].get('volumeInfo', {})
                page_count = volume_info.get('pageCount')
                description = volume_info.get('description')
                return {
                    'page_count': page_count,
                    'description': description
                }
        except Exception:
            pass
    return None

def fetch_from_google_books_general(title, author, api_key=None):
    cleaned_title = clean_title(title)
    query = f"{cleaned_title} {author}"
    url = f"https://www.googleapis.com/books/v1/volumes?q={requests.utils.quote(query)}&langRestrict=en"
    if api_key:
        url += f"&key={api_key}"
    r = make_request_with_retry(url)
    if r and r.status_code == 200:
        try:
            data = r.json()
            items = data.get('items', [])
            if items:
                for item in items:
                    volume_info = item.get('volumeInfo', {})
                    page_count = volume_info.get('pageCount')
                    description = volume_info.get('description')
                    if page_count or description:
                        return {
                            'page_count': page_count,
                            'description': description
                        }
        except Exception:
            pass
    return None

def fetch_from_wikipedia(title, author):
    headers = {
        'User-Agent': 'BookstoreEnrichmentAgent/1.0 (contact: support@bookstore.com)'
    }
    cleaned = clean_title(title)
    search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={requests.utils.quote(cleaned)}&limit=8&namespace=0&format=json"
    r = make_request_with_retry(search_url, headers=headers)
    if r and r.status_code == 200:
        try:
            results = r.json()
            titles = results[1]
            if not titles:
                return None
            
            target_title = None
            for t in titles:
                if "novel" in t.lower() or "book" in t.lower() or "novella" in t.lower():
                    target_title = t
                    break
            
            if not target_title and titles:
                for t in titles:
                    if not any(x in t.lower() for x in ["film", "album", "band", "song", "tv series"]):
                        target_title = t
                        break
                if not target_title:
                    target_title = titles[0]
                    
            if target_title:
                summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(target_title)}"
                r_sum = make_request_with_retry(summary_url, headers=headers)
                if r_sum and r_sum.status_code == 200:
                    sum_data = r_sum.json()
                    extract = sum_data.get("extract")
                    if extract and len(extract) > 30:
                        return {
                            'description': extract,
                            'page_count': None
                        }
        except Exception:
            pass
    return None

def main():
    print("=== Bookstore Deep Metadata Enrichment (English Only & Fallbacks) ===", flush=True)
    
    # Load environment variables
    env_path = os.path.join("bookstore_backend", ".env")
    env = load_env(env_path)
    
    db_url = env.get("DB_URL")
    db_user = env.get("DB_USERNAME")
    db_password = env.get("DB_PASSWORD")
    google_api_key = env.get("GOOGLE_BOOKS_API_KEY")
    
    if google_api_key:
        print("Using Google Books API Key provided in .env!", flush=True)
    else:
        print("Note: GOOGLE_BOOKS_API_KEY not found in bookstore_backend/.env.", flush=True)
        print("Without an API key, Google Books requests may hit rate-limits quickly.", flush=True)
        print("Register a free Google Books API key in Google Cloud Console if needed.\n", flush=True)
        
    if not db_url or not db_user or not db_password:
        print("Error: Missing DB credentials in bookstore_backend/.env", flush=True)
        sys.exit(1)
        
    host, port, dbname = parse_jdbc_url(db_url)
    if not host or not dbname:
        print(f"Error parsing DB URL: {db_url}", flush=True)
        sys.exit(1)
        
    print(f"Connecting to database {dbname} on {host}:{port}...", flush=True)
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=dbname,
            user=db_user,
            password=db_password,
            sslmode="require"
        )
        print("Connected successfully!", flush=True)
    except Exception as e:
        print(f"Database connection failed: {e}", flush=True)
        sys.exit(1)
        
    # Get books that still need enrichment
    cursor = conn.cursor()
    cursor.execute("""
        SELECT book_id, isbn, name, author, description, page_count 
        FROM book
    """)
    all_books = cursor.fetchall()
    cursor.close()
    
    books = []
    for row in all_books:
        book_id, isbn, name, author, description, page_count = row
        # Needs enrichment if:
        # 1. No description or empty description
        # 2. No page count
        # 3. Description is in Vietnamese
        if not description or not page_count or is_vietnamese(description):
            books.append(row)
            
    total_books = len(books)
    print(f"Found {total_books} books requiring deep English enrichment / page count.\n", flush=True)
    if total_books == 0:
        print("All books are already enriched with English descriptions and page counts! Nothing to do.", flush=True)
        conn.close()
        return

    # Queue for worker results
    result_queue = queue.Queue()
    scraped_count = 0
    success_count = 0
    
    def worker(book):
        book_id, isbn_raw, name, author, existing_desc, existing_pages = book
        isbn = standardize_isbn(isbn_raw)
        
        # Start result dict. If existing desc is in English (not Vietnamese), keep it.
        result = {
            'page_count': existing_pages,
            'description': existing_desc if (existing_desc and not is_vietnamese(existing_desc)) else None
        }
        
        # Helper to merge findings
        def merge_results(new_data):
            if not new_data:
                return False
            updated = False
            if not result['description'] and is_valid_description(new_data.get('description')):
                result['description'] = new_data['description']
                updated = True
            if not result['page_count'] and new_data.get('page_count'):
                result['page_count'] = new_data['page_count']
                updated = True
            return updated
            
        # Define titles and authors to try
        titles_to_try = [name]
        cleaned_extra = re.sub(r'\b(boxset|boxed set|collection|trilogy|set|complete|#\d+(-\d+)?)\b', '', name, flags=re.IGNORECASE).strip()
        if cleaned_extra and cleaned_extra != name:
            titles_to_try.append(cleaned_extra)
            
        authors_to_try = [author]
        primary_author = author.split(',')[0].strip() if author else None
        if primary_author and primary_author != author:
            authors_to_try.append(primary_author)
            
        # STEP 1: Search Google Books by ISBN (English restricted)
        if isbn:
            merge_results(fetch_from_google_books(isbn=isbn, api_key=google_api_key))
            
        # STEP 2: Try Open Library by ISBN (if still incomplete)
        if isbn and (not result['description'] or not result['page_count']):
            merge_results(fetch_from_open_library_by_isbn(isbn))
            
        # STEP 3 to 7: Fallback search loops over title and author variations
        for t in titles_to_try:
            for a in authors_to_try:
                if not result['description'] or not result['page_count']:
                    merge_results(fetch_from_google_books(title=t, author=a, api_key=google_api_key))
                if not result['description'] or not result['page_count']:
                    merge_results(fetch_from_google_books_general(t, a, api_key=google_api_key))
                if not result['description'] or not result['page_count']:
                    merge_results(fetch_from_open_library_by_search(t, a))
                if not result['description'] or not result['page_count']:
                    merge_results(fetch_from_open_library_by_search_general(t, a))
                if not result['description']:
                    merge_results(fetch_from_wikipedia(t, a))
                    
        result_queue.put((book_id, isbn_raw, name, existing_desc, existing_pages, result))
        
    # Start thread pool
    num_threads = 5  # Stable running using fast Google API disabling
    print(f"Starting deep scraping with {num_threads} worker threads...", flush=True)
    
    start_time = time.time()
    
    executor = ThreadPoolExecutor(max_workers=num_threads)
    for book in books:
        executor.submit(worker, book)
        
    db_cursor = conn.cursor()
    
    try:
        while scraped_count < total_books:
            try:
                book_id, isbn_raw, name, existing_desc, existing_pages, result = result_queue.get(timeout=1)
                scraped_count += 1
                
                updated_desc = False
                updated_pages = False
                if result:
                    desc = result.get('description')
                    pages = result.get('page_count')
                    
                    if desc and desc != existing_desc:
                        db_cursor.execute(
                            "UPDATE book SET description = %s WHERE book_id = %s",
                            (desc, book_id)
                        )
                        updated_desc = True
                    if pages and pages != existing_pages:
                        db_cursor.execute(
                            "UPDATE book SET page_count = %s WHERE book_id = %s",
                            (pages, book_id)
                        )
                        updated_pages = True
                    
                    if updated_desc or updated_pages:
                        conn.commit()
                        success_count += 1
                        
                        detail_msg = []
                        if updated_desc:
                            detail_msg.append("description")
                        if updated_pages:
                            detail_msg.append(f"pages={pages}")
                        print(f"[SUCCESS] {scraped_count}/{total_books} - Enriched '{name}' ({', '.join(detail_msg)})", flush=True)
                
                # Print progress update on EVERY book to prevent buffer suppression
                elapsed = time.time() - start_time
                percent = (scraped_count / total_books) * 100
                speed = scraped_count / elapsed if elapsed > 0 else 0
                eta = (total_books - scraped_count) / speed if speed > 0 else 0
                print(
                    f"Progress: {scraped_count}/{total_books} ({percent:.1f}%) | "
                    f"Success: {success_count} | Elapsed: {elapsed:.1f}s | "
                    f"Speed: {speed:.2f} b/s | ETA: {eta:.1f}s",
                    flush=True
                )
                
            except queue.Empty:
                continue
    except KeyboardInterrupt:
        print("\nProcess interrupted by user. Saving progress and exiting...", flush=True)
    finally:
        db_cursor.close()
        conn.close()
        executor.shutdown(wait=False)
        
    elapsed = time.time() - start_time
    print(f"\nDone! Successfully enriched {success_count} out of {total_books} books in {elapsed:.1f} seconds.", flush=True)

if __name__ == "__main__":
    main()

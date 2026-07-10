import requests
import json

def test_python_api():
    print("=== Testing Python FastAPI Recommendation API ===")
    
    # 1. Recommend for User (User 1)
    url_rec = "http://localhost:8000/recommend?user_id=1&limit=5"
    try:
        r = requests.get(url_rec)
        print(f"GET {url_rec} - Status: {r.status_code}")
        if r.status_code == 200:
            books = r.json()
            print(f"Returned {len(books)} books. First book: {books[0]['name']} (Author: {books[0]['author']})")
        else:
            print(r.text)
    except Exception as e:
        print(f"Error connecting to Python service: {e}")

    # 2. Similar Books
    url_sim = "http://localhost:8000/similar?item_id=1&limit=5"
    try:
        r = requests.get(url_sim)
        print(f"GET {url_sim} - Status: {r.status_code}")
        if r.status_code == 200:
            books = r.json()
            print(f"Returned {len(books)} similar books. First book: {books[0]['name']} (Author: {books[0]['author']})")
        else:
            print(r.text)
    except Exception as e:
        print(f"Error connecting to Python service: {e}")

def test_java_api():
    print("\n=== Testing Java Spring Boot Recommendation API ===")
    
    # 1. Public Similar Books Endpoint (wraps in PageResponse)
    url_sim = "http://localhost:8080/api/public/recommendations/similar/1?page=0&size=5"
    try:
        r = requests.get(url_sim)
        print(f"GET {url_sim} - Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            # The structure is ApiResponse -> PageResponse -> content
            page_data = data.get("data", {})
            books = page_data.get("content", [])
            print(f"Returned {len(books)} similar books from Java. First book: {books[0]['name']} (Author: {books[0]['author']})")
            print(f"Page metadata - page: {page_data.get('page')}, size: {page_data.get('size')}, totalElements: {page_data.get('totalElements')}")
        else:
            print(r.text)
    except Exception as e:
        print(f"Error connecting to Java service: {e}")

if __name__ == "__main__":
    test_python_api()
    test_java_api()

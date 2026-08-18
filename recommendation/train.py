import os
import sys
import pickle
import psycopg2
import numpy as np
import pandas as pd
from urllib.parse import urlparse
from dotenv import dotenv_values
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

def load_env(env_path):
    if os.path.exists(env_path):
        return dotenv_values(env_path)
    return {}

def parse_jdbc_url(jdbc_url):
    cleaned = jdbc_url.replace("jdbc:", "")
    parsed = urlparse(cleaned)
    host = parsed.hostname
    port = parsed.port or 5432
    dbname = parsed.path.lstrip("/")
    return host, port, dbname

def load_data():
    """Load users, books, ratings, book_genres from Supabase Postgres"""
    print("Loading data from database...")
    env_path = os.path.join("bookstore_backend", ".env")
    env = load_env(env_path)
    
    db_url = env.get("DB_URL")
    db_user = env.get("DB_USERNAME")
    db_password = env.get("DB_PASSWORD")
    
    if not db_url or not db_user or not db_password:
        raise ValueError("Missing database connection configurations in .env")
        
    host, port, dbname = parse_jdbc_url(db_url)
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=dbname,
        user=db_user,
        password=db_password,
        sslmode="require"
    )
    
    cursor = conn.cursor()
    
    # 1. Load users
    cursor.execute("SELECT user_id, name, gender, career FROM \"user\" WHERE is_deleted = false")
    users = cursor.fetchall()
    
    # 2. Load books
    cursor.execute("""
        SELECT book_id, name, author, description, publish_year, buy_count, avg_rating, cnt_rating, page_count, is_vip 
        FROM book 
        WHERE is_deleted = false
    """)
    books = cursor.fetchall()
    
    # 3. Load ratings
    cursor.execute("SELECT user_id, book_id, rate_value FROM rating")
    ratings = cursor.fetchall()
    
    # 4. Load book genres
    cursor.execute("""
        SELECT bg.book_id, g.name, g.genre_id 
        FROM book_genre bg 
        JOIN genre g ON bg.genre_id = g.genre_id
    """)
    book_genres = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    print(f"Loaded {len(users)} users, {len(books)} books, {len(ratings)} ratings, {len(book_genres)} book-genre mappings.")
    return users, books, ratings, book_genres

def preprocess_items(books, book_genres):
    """Preprocess items, group genres by book_id, build cleaned lists"""
    print("Preprocessing items...")
    
    # Group genres by book_id
    book_genres_dict = {}
    book_genre_ids_dict = {}
    for item in book_genres:
        book_id = item[0]
        genre_name = item[1]
        genre_id = item[2] if len(item) > 2 else None
        if book_id not in book_genres_dict:
            book_genres_dict[book_id] = set()
            book_genre_ids_dict[book_id] = set()
        book_genres_dict[book_id].add(genre_name)
        if genre_id is not None:
            book_genre_ids_dict[book_id].add(genre_id)
        
    # Build maps and clean properties
    book_ids = []
    titles = []
    descriptions = []
    authors = []
    years = []
    popular_scores = []
    
    for b in books:
        book_id, name, author, desc, year, buy_count, avg_rating, cnt_rating, page_count, is_vip = b
        book_ids.append(book_id)
        titles.append(name or "")
        descriptions.append(desc or "")
        
        # Clean author (lowercase and strip)
        cleaned_author = (author or "").strip().lower()
        authors.append(cleaned_author)
        
        # Default publish year
        years.append(year if year is not None else 2000)
        
        # Popularity score based on buy count and average rating
        buy_c = buy_count if buy_count is not None else 0
        avg_r = avg_rating if avg_rating is not None else 0.0
        score = buy_c * 2.0 + avg_r * 5.0
        popular_scores.append((book_id, score))
        
    # Sort popular books
    popular_scores.sort(key=lambda x: x[1], reverse=True)
    popular_books = [x[0] for x in popular_scores]
    
    return book_ids, titles, descriptions, authors, years, book_genres_dict, book_genre_ids_dict, popular_books

def build_content_model(book_ids, titles, descriptions, authors, years, book_genres_dict):
    """Build Content-Based similarity matrix"""
    print("Building Content-Based similarity model...")
    num_books = len(book_ids)
    
    # 1. Jaccard Genre similarity
    print("Calculating Jaccard genre similarity...")
    genre_similarity = np.zeros((num_books, num_books))
    for i in range(num_books):
        for j in range(i, num_books):
            set_i = book_genres_dict.get(book_ids[i], set())
            set_j = book_genres_dict.get(book_ids[j], set())
            if not set_i and not set_j:
                sim = 0.0
            else:
                sim = len(set_i.intersection(set_j)) / len(set_i.union(set_j))
            genre_similarity[i, j] = sim
            genre_similarity[j, i] = sim
            
    # 2. Description similarity using sentence-transformers
    print("Calculating description embedding similarity...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Fallback to title + author if description is empty
    texts_to_embed = []
    for i in range(num_books):
        desc = descriptions[i]
        if not desc or len(desc.strip()) < 10:
            desc = f"{titles[i]} by {authors[i]}"
        texts_to_embed.append(desc)
        
    embeddings = model.encode(texts_to_embed, show_progress_bar=True)
    desc_similarity = cosine_similarity(embeddings)
    
    # 3. Creator/Author similarity (1.0 if match, else 0.0)
    print("Calculating creator similarity...")
    author_similarity = np.zeros((num_books, num_books))
    for i in range(num_books):
        for j in range(i, num_books):
            auth_i = authors[i]
            auth_j = authors[j]
            if auth_i and auth_j and auth_i == auth_j:
                sim = 1.0
            else:
                sim = 0.0
            author_similarity[i, j] = sim
            author_similarity[j, i] = sim
            
    # 4. Date similarity
    print("Calculating date similarity...")
    date_similarity = np.zeros((num_books, num_books))
    for i in range(num_books):
        for j in range(i, num_books):
            yr_i = years[i]
            yr_j = years[j]
            sim = 1.0 / (1.0 + abs(yr_i - yr_j) / 10.0)
            date_similarity[i, j] = sim
            date_similarity[j, i] = sim
            
    # Combine content similarities:
    # 40% genre + 30% description + 20% creator + 10% date
    content_similarity = (
        0.4 * genre_similarity +
        0.3 * desc_similarity +
        0.2 * author_similarity +
        0.1 * date_similarity
    )
    
    print("Content-Based similarity matrix built.")
    return content_similarity

def build_collaborative_model(book_ids, users, ratings):
    """Build Collaborative Filtering model using User-Item matrix"""
    print("Building Collaborative Filtering model...")
    num_books = len(book_ids)
    num_users = len(users)
    
    book_to_idx = {bid: idx for idx, bid in enumerate(book_ids)}
    user_ids = [u[0] for u in users]
    user_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
    
    R = np.zeros((num_users, num_books))
    for uid, bid, val in ratings:
        if uid in user_to_idx and bid in book_to_idx:
            R[user_to_idx[uid], book_to_idx[bid]] = val
            
    # Normalize user ratings (mean-centering)
    R_norm = np.zeros_like(R)
    user_means = np.zeros(num_users)
    for u in range(num_users):
        rated_indices = np.where(R[u] > 0)[0]
        if len(rated_indices) > 0:
            mean_val = np.mean(R[u, rated_indices])
            user_means[u] = mean_val
            R_norm[u, rated_indices] = R[u, rated_indices] - mean_val
        else:
            user_means[u] = 3.0 # Default fallback
            
    # Item-item Collaborative Filtering similarity
    print("Calculating collaborative similarity matrix...")
    cf_similarity = cosine_similarity(R_norm.T)
    cf_similarity = np.nan_to_num(cf_similarity, nan=0.0)
    
    print("Collaborative Filtering model built.")
    return R, cf_similarity, user_means, user_ids, user_to_idx, book_to_idx

def train_model():
    """Main training pipeline"""
    users, books, ratings, book_genres = load_data()
    
    book_ids, titles, descriptions, authors, years, book_genres_dict, book_genre_ids_dict, popular_books = preprocess_items(books, book_genres)
    
    content_similarity = build_content_model(book_ids, titles, descriptions, authors, years, book_genres_dict)
    
    R, cf_similarity, user_means, user_ids, user_to_idx, book_to_idx = build_collaborative_model(book_ids, users, ratings)
    
    model_data = {
        "book_ids": book_ids,
        "user_ids": user_ids,
        "book_to_idx": book_to_idx,
        "user_to_idx": user_to_idx,
        "R": R,
        "cf_similarity": cf_similarity,
        "content_similarity": content_similarity,
        "user_means": user_means,
        "popular_books": popular_books,
        "book_genres_dict": book_genres_dict,
        "book_genre_ids_dict": book_genre_ids_dict
    }
    
    output_path = os.path.join("recommendation", "recommendation_model.pkl")
    print(f"Saving model to {output_path}...")
    with open(output_path, "wb") as f:
        pickle.dump(model_data, f)
    print("Model training and saving completed successfully!")

if __name__ == "__main__":
    train_model()

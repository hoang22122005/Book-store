import os
import pickle
import numpy as np
import psycopg2
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from recommendation.train import train_model, load_env, parse_jdbc_url

app = FastAPI(title="Bookstore Recommendation Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join("recommendation", "recommendation_model.pkl")
model_data = None

def load_model():
    global model_data
    if os.path.exists(MODEL_PATH):
        try:
            print(f"Loading recommendation model from {MODEL_PATH}...")
            with open(MODEL_PATH, "rb") as f:
                model_data = pickle.load(f)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            model_data = None
    else:
        print(f"Model file {MODEL_PATH} not found. Please run train.py first.")
        model_data = None

@app.on_event("startup")
def startup_event():
    load_model()

class TrainResponse(BaseModel):
    status: str
    message: str

def run_training_in_background():
    try:
        train_model()
        load_model()
        print("Background training completed successfully.")
    except Exception as e:
        print(f"Background training failed: {e}")

@app.post("/train", response_model=TrainResponse)
def trigger_training(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_training_in_background)
    return TrainResponse(status="success", message="Model training triggered in background.")

def get_db_connection():
    env_path = os.path.join("bookstore_backend", ".env")
    env = load_env(env_path)
    db_url = env.get("DB_URL")
    db_user = env.get("DB_USERNAME")
    db_password = env.get("DB_PASSWORD")
    host, port, dbname = parse_jdbc_url(db_url)
    return psycopg2.connect(
        host=host,
        port=port,
        database=dbname,
        user=db_user,
        password=db_password,
        sslmode="require"
    )

def get_detailed_books(book_ids):
    if not book_ids:
        return []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT book_id, name, author, description, quantity_in_stock, publisher, publish_year, 
                   price, created_at, url_image, avg_rating, cnt_rating, buy_count, isbn, page_count, is_vip
            FROM book
            WHERE book_id IN %s AND is_deleted = false
        """
        cursor.execute(query, (tuple(book_ids),))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        books_dict = {}
        for r in rows:
            price_val = float(r[7]) if r[7] is not None else 0.0
            created_at_str = r[8].isoformat() if r[8] is not None else None
            
            books_dict[r[0]] = {
                "bookId": r[0],
                "name": r[1],
                "author": r[2],
                "description": r[3],
                "quantityInStock": r[4] if r[4] is not None else 0,
                "publisher": r[5],
                "publishYear": r[6],
                "price": price_val,
                "createdAt": created_at_str,
                "urlImg": r[9],
                "avgRating": float(r[10]) if r[10] is not None else 0.0,
                "cntRating": r[11] if r[11] is not None else 0,
                "buyCount": r[12] if r[12] is not None else 0,
                "isbn": r[13],
                "pageCount": r[14],
                "isVip": bool(r[15])
            }
            
        result = []
        for bid in book_ids:
            if bid in books_dict:
                result.append(books_dict[bid])
        return result
    except Exception as e:
        print(f"Error fetching book details from database: {e}")
        return []

def get_user_idx(user_id: int):
    if model_data is None or "user_to_idx" not in model_data:
        return None
    return model_data["user_to_idx"].get(user_id)

def get_book_idx(book_id: int):
    if model_data is None or "book_to_idx" not in model_data:
        return None
    return model_data["book_to_idx"].get(book_id)

def get_cf_score(user_idx: int, book_idx: int) -> float:
    R = model_data["R"]
    cf_similarity = model_data["cf_similarity"]
    user_means = model_data["user_means"]
    
    rated_indices = np.where(R[user_idx] > 0)[0]
    if len(rated_indices) == 0:
        return 0.0
        
    sims = cf_similarity[book_idx, rated_indices]
    ratings = R[user_idx, rated_indices]
    
    pos_idx = np.where(sims > 0)[0]
    if len(pos_idx) == 0:
        return float(user_means[user_idx])
        
    weighted_sum = np.sum(sims[pos_idx] * ratings[pos_idx])
    sum_sims = np.sum(sims[pos_idx])
    return float(weighted_sum / sum_sims)

def get_content_score(user_idx: int, book_idx: int) -> float:
    R = model_data["R"]
    content_similarity = model_data["content_similarity"]
    user_means = model_data["user_means"]
    
    rated_indices = np.where(R[user_idx] > 0)[0]
    if len(rated_indices) == 0:
        return 0.0
        
    sims = content_similarity[book_idx, rated_indices]
    ratings = R[user_idx, rated_indices]
    
    pos_idx = np.where(sims > 0)[0]
    if len(pos_idx) == 0:
        return float(user_means[user_idx])
        
    weighted_sum = np.sum(sims[pos_idx] * ratings[pos_idx])
    sum_sims = np.sum(sims[pos_idx])
    return float(weighted_sum / sum_sims)

def predict_score(user_idx: int, book_idx: int) -> float:
    cf_val = get_cf_score(user_idx, book_idx)
    content_val = get_content_score(user_idx, book_idx)
    return 0.7 * cf_val + 0.3 * content_val

@app.get("/recommend")
def recommend(user_id: int = Query(..., description="ID of the user to get recommendations for"),
              limit: int = Query(10, description="Number of recommendations to return")):
    if model_data is None:
        raise HTTPException(status_code=503, detail="Model not loaded or trained yet.")
        
    book_ids = model_data["book_ids"]
    user_idx = get_user_idx(user_id)
    
    # Cold Start / Fallback if user is new or has less than 10 ratings
    R = model_data["R"]
    num_ratings = np.sum(R[user_idx] > 0) if user_idx is not None else 0
    if user_idx is None or num_ratings < 10:
        print(f"Cold start/fallback triggered for user_id={user_id} (ratings={num_ratings} < 10)")
        rec_ids = model_data["popular_books"][:limit]
        return get_detailed_books(rec_ids)
        
    # Get all items user hasn't rated yet
    rated_indices = set(np.where(R[user_idx] > 0)[0])
    
    scores = []
    for idx, bid in enumerate(book_ids):
        if idx in rated_indices:
            continue
        score = predict_score(user_idx, idx)
        scores.append((bid, score))
        
    # Sort by predicted score descending
    scores.sort(key=lambda x: x[1], reverse=True)
    top_scores = scores[:limit]
    rec_ids = [bid for bid, _ in top_scores]
    return get_detailed_books(rec_ids)

@app.get("/similar")
def similar(item_id: int = Query(..., description="ID of the book to find similar items for"),
            limit: int = Query(10, description="Number of similar books to return")):
    if model_data is None:
        raise HTTPException(status_code=503, detail="Model not loaded or trained yet.")
        
    book_ids = model_data["book_ids"]
    book_idx = get_book_idx(item_id)
    
    if book_idx is None:
        raise HTTPException(status_code=404, detail=f"Book with id {item_id} not found in model.")
        
    # Hybrid similarity between items
    cf_similarity = model_data["cf_similarity"]
    content_similarity = model_data["content_similarity"]
    
    # Hybrid item-to-item similarity
    hybrid_similarity = 0.7 * cf_similarity[book_idx] + 0.3 * content_similarity[book_idx]
    
    similarities = []
    for idx, bid in enumerate(book_ids):
        if idx == book_idx:
            continue
        sim_val = float(hybrid_similarity[idx])
        similarities.append((bid, sim_val))
        
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_sims = similarities[:limit]
    rec_ids = [bid for bid, _ in top_sims]
    return get_detailed_books(rec_ids)

import os
import sys
import psycopg2
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import mean_squared_error, mean_absolute_error
from recommendation.train import load_data, preprocess_items, build_content_model

def evaluate_model():
    print("Starting evaluation...")
    users, books, ratings, book_genres = load_data()
    
    # Preprocess items and get content model
    book_ids, titles, descriptions, authors, years, book_genres_dict, _ = preprocess_items(books, book_genres)
    content_similarity = build_content_model(book_ids, titles, descriptions, authors, years, book_genres_dict)
    
    num_books = len(book_ids)
    num_users = len(users)
    
    book_to_idx = {bid: idx for idx, bid in enumerate(book_ids)}
    user_ids = [u[0] for u in users]
    user_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
    
    # Convert ratings list to a DataFrame
    df_ratings = pd.DataFrame(ratings, columns=["user_id", "book_id", "rate_value"])
    # Filter to only include users and books that are currently valid
    df_ratings = df_ratings[df_ratings["user_id"].isin(user_to_idx) & df_ratings["book_id"].isin(book_to_idx)].copy()
    
    # Split into 80% train, 20% test
    print("Splitting interaction data into 80% train and 20% test...")
    np.random.seed(42)
    mask = np.random.rand(len(df_ratings)) < 0.8
    train_df = df_ratings[mask]
    test_df = df_ratings[~mask]
    
    print(f"Train ratings: {len(train_df)}, Test ratings: {len(test_df)}")
    
    # Build User-Item matrix for train set
    R_train = np.zeros((num_users, num_books))
    for _, row in train_df.iterrows():
        uid, bid, val = int(row["user_id"]), int(row["book_id"]), float(row["rate_value"])
        R_train[user_to_idx[uid], book_to_idx[bid]] = val
        
    # Normalize user ratings (mean-centering) on train set
    R_norm_train = np.zeros_like(R_train)
    user_means_train = np.zeros(num_users)
    for u in range(num_users):
        rated_indices = np.where(R_train[u] > 0)[0]
        if len(rated_indices) > 0:
            mean_val = np.mean(R_train[u, rated_indices])
            user_means_train[u] = mean_val
            R_norm_train[u, rated_indices] = R_train[u, rated_indices] - mean_val
        else:
            user_means_train[u] = 3.0 # Default fallback
            
    # Compute CF similarity
    cf_similarity_train = cosine_similarity(R_norm_train.T)
    cf_similarity_train = np.nan_to_num(cf_similarity_train, nan=0.0)
    
    # Helper to calculate prediction
    def predict_hybrid_rating(u_idx, b_idx):
        rated_indices = np.where(R_train[u_idx] > 0)[0]
        if len(rated_indices) == 0:
            return 3.0 # Default fallback
            
        # 1. CF prediction
        sims_cf = cf_similarity_train[b_idx, rated_indices]
        ratings_train = R_train[u_idx, rated_indices]
        
        pos_idx_cf = np.where(sims_cf > 0)[0]
        if len(pos_idx_cf) == 0:
            cf_pred = user_means_train[u_idx]
        else:
            cf_pred = np.sum(sims_cf[pos_idx_cf] * ratings_train[pos_idx_cf]) / np.sum(sims_cf[pos_idx_cf])
            
        # 2. Content prediction
        sims_content = content_similarity[b_idx, rated_indices]
        pos_idx_content = np.where(sims_content > 0)[0]
        if len(pos_idx_content) == 0:
            content_pred = user_means_train[u_idx]
        else:
            content_pred = np.sum(sims_content[pos_idx_content] * ratings_train[pos_idx_content]) / np.sum(sims_content[pos_idx_content])
            
        # Hybrid prediction
        return 0.7 * cf_pred + 0.3 * content_pred

    print("Evaluating predictions on test set...")
    y_true = []
    y_pred = []
    
    # Evaluate a sample of test records to save time, or all if quick
    # Since 20,000 ratings is small, we can evaluate all of them
    for _, row in test_df.iterrows():
        uid, bid, val = int(row["user_id"]), int(row["book_id"]), float(row["rate_value"])
        u_idx = user_to_idx[uid]
        b_idx = book_to_idx[bid]
        
        pred = predict_hybrid_rating(u_idx, b_idx)
        y_true.append(val)
        y_pred.append(pred)
        
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    
    print("\n--- Evaluation Metrics ---")
    print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    print(f"Mean Absolute Error (MAE):     {mae:.4f}")
    print("--------------------------\n")
    
if __name__ == "__main__":
    evaluate_model()

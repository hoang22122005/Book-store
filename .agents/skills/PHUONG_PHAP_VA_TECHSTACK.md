# Simple Recommendation System Blueprint

Tai lieu nay dung de mo ta ngan gon cach xay dung mot he thong de xuat. AI co the doc file nay va code lai cho cac mien nhu phim, sach, video, khoa hoc, san pham.

## 1. Muc tieu

Xay dung service de xuat item phu hop cho tung user.

Vi du item co the la:

- Phim
- Sach
- Video
- Khoa hoc
- San pham
- Bai viet

He thong can lam duoc 2 viec chinh:

- Goi y danh sach item cho user: `recommend_for_user(user_id)`
- Goi y cac item tuong tu voi mot item: `recommend_similar_items(item_id)`

## 2. Du lieu can co

Can toi thieu 3 nhom du lieu.

### 2.1 Users

Thong tin user.

Cot toi thieu:

```text
user_id
```

Co the them:

```text
age
gender
location
interests
```

### 2.2 Items

Thong tin doi tuong can de xuat.

Neu la phim:

```text
movie_id, title, description, director, release_date, genres
```

Neu la sach:

```text
book_id, title, description, author, published_date, categories
```

Neu la video:

```text
video_id, title, description, creator, published_date, tags
```

Nen quy ve dang chung:

```text
item_id
title
description
creator
published_date
categories
```

### 2.3 User interactions

Du lieu user da tuong tac voi item.

Vi du:

```text
user_id
item_id
rating
view_count
watch_time
liked
clicked
created_at
```

Neu co rating 1-5 thi dung truc tiep.

Neu khong co rating, co the tu tao diem tuong tac:

```text
score = 1.0 * clicked
      + 2.0 * liked
      + 3.0 * completed
      + normalized_watch_time
```

## 3. Cach tiep can don gian

Dung Hybrid Recommendation, ket hop 2 cach:

```text
Final Score = 70% Collaborative Filtering + 30% Content-Based Filtering
```

Y nghia:

- Collaborative Filtering: user co hanh vi giong nhau thi co the thich item giong nhau.
- Content-Based Filtering: item co noi dung giong nhung item user da thich thi nen duoc goi y.

## 4. Collaborative Filtering

Dung khi co du lieu user da rating hoac tuong tac.

Cach lam:

1. Tao ma tran user-item.
2. Moi dong la user.
3. Moi cot la item.
4. Gia tri la rating hoac interaction score.
5. Chuan hoa diem theo tung user.
6. Tinh do tuong tu giua cac item bang cosine similarity.
7. Khi can goi y, lay cac item user da thich va tim item tuong tu.

Cong thuc don gian:

```text
cf_score(item) = trung binh co trong so cua cac item user da thich
```

Trong so la do tuong tu giua item dang xet va item user da thich.

## 5. Content-Based Filtering

Dung thong tin cua item de goi y.

Moi item nen co:

```text
title
description
creator
published_date
categories/tags
```

Tinh diem content bang cac thanh phan:

```text
content_score =
    0.4 * category_similarity
  + 0.3 * description_similarity
  + 0.2 * creator_similarity
  + 0.1 * date_similarity
```

Co the doi trong so tuy du an.

### Category similarity

Dung Jaccard similarity:

```text
category_similarity = so category trung nhau / tong so category khac nhau
```

Vi du:

```text
Item A: ["AI", "Python", "Backend"]
Item B: ["AI", "Python", "Data"]
Similarity = 2 / 4 = 0.5
```

### Description similarity

Dung AI embedding de bien `description` thanh vector.

Model goi y:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Sau do tinh cosine similarity:

```text
description_similarity = cosine(embedding_item_a, embedding_item_b)
```

### Creator similarity

Neu cung tac gia, cung kenh, cung dao dien, cung giang vien:

```text
creator_similarity = 1
```

Neu khac:

```text
creator_similarity = 0
```

### Date similarity

Item gan thoi gian nhau thi diem cao hon.

```text
date_similarity = 1 / (1 + abs(year_a - year_b) / 10)
```

## 6. Cong thuc Hybrid

Sau khi co `cf_score` va `content_score`:

```text
final_score = 0.7 * cf_score + 0.3 * content_score
```

Neu user moi chua co du lieu:

```text
final_score = content_score hoac popular_score
```

Neu item moi chua co rating:

```text
final_score = content_score
```

## 7. Pipeline train model

Can co file `train.py`.

Nhiem vu:

1. Load users, items, interactions tu database.
2. Lam sach du lieu item.
3. Tao category set cho moi item.
4. Tao text embedding tu description.
5. Tao user-item matrix.
6. Tinh item-item similarity cho Collaborative Filtering.
7. Luu tat ca vao file model.

File model nen gom:

```python
{
    "item_ids": [...],
    "item_index": {...},
    "embeddings": ...,
    "categories": [...],
    "creators": [...],
    "years": [...],
    "cf_similarity": ...,
    "user_item_matrix": ...,
    "user_mean": ...,
    "user_std": ...
}
```

Luu file:

```text
recommendation_model.pkl
```

## 8. Runtime API

Can co file `app.py`.

Khi service start:

1. Load `recommendation_model.pkl`.
2. Load fallback popular items.
3. Cho phep backend goi API lay de xuat.

### API goi y cho user

```http
GET /recommend?user_id=1&limit=10
```

Response:

```json
{
  "user_id": 1,
  "recommendations": [
    {
      "item_id": 101,
      "score": 4.82
    }
  ]
}
```

### API goi y item tuong tu

```http
GET /similar?item_id=101&limit=10
```

Response:

```json
{
  "item_id": 101,
  "recommendations": [
    {
      "item_id": 202,
      "similarity": 0.91
    }
  ]
}
```

## 9. Cold Start

### User moi

Neu user chua co rating hoac interaction:

Tra ve:

- Item pho bien nhat
- Item moi nhat
- Item co rating cao
- Item theo category user chon luc dang ky

### Item moi

Neu item moi chua co ai tuong tac:

Dung Content-Based:

- description
- category
- creator
- published_date

## 10. Danh gia

Neu co rating that, dung:

```text
MAE
RMSE
```

Neu la click/video/feed, dung:

```text
Precision@K
Recall@K
HitRate@K
NDCG@K
```

Don gian nhat:

1. Chia interaction cua moi user thanh train/test.
2. Train bang train set.
3. Du doan item trong test set.
4. Do xem item user that su thich co nam trong Top-K khong.

## 11. Tech Stack de code nhanh

Backend AI service:

```text
Python
Flask hoac FastAPI
pandas
numpy
scikit-learn
sentence-transformers
sqlalchemy
psycopg2-binary
pickle/joblib
```

Database:

```text
PostgreSQL
```

Deploy:

```text
Docker
Gunicorn hoac Uvicorn
```

## 12. Cau truc source goi y

```text
recommendation-service/
  app.py
  train.py
  evaluate.py
  requirements.txt
  Dockerfile
  recommendation_model.pkl
```

## 13. Yeu cau code

Khi AI code he thong nay, can tao cac ham chinh:

```python
load_data()
preprocess_items()
build_content_model()
build_collaborative_model()
train_model()
load_model()
get_content_score(user_id, item_id)
get_cf_score(user_id, item_id)
predict_score(user_id, item_id)
recommend_for_user(user_id, limit=10)
recommend_similar_items(item_id, limit=10)
```

## 14. Quy tac ap dung cho moi domain

Neu la phim:

```text
item = movie
creator = director
categories = genres
interaction = rating/watch history
```

Neu la sach:

```text
item = book
creator = author
categories = categories/tags
interaction = rating/read/favorite
```

Neu la video:

```text
item = video
creator = channel/creator
categories = tags/topics
interaction = click/watch_time/like/complete
```

Neu la khoa hoc:

```text
item = course
creator = teacher
categories = topics/skills
interaction = enroll/progress/rating/complete
```

## 15. Tom tat ngan gon cho AI

Hay xay dung mot Hybrid Recommendation Service.

Input:

```text
users
items
interactions
```

Item co:

```text
item_id, title, description, creator, published_date, categories
```

Interaction co:

```text
user_id, item_id, rating hoac interaction_score
```

Model:

```text
70% Item-Based Collaborative Filtering
30% Content-Based Filtering
```

Content-Based gom:

```text
40% category similarity
30% description embedding similarity
20% creator match
10% date similarity
```

API can co:

```text
GET /recommend?user_id=...&limit=...
GET /similar?item_id=...&limit=...
```

Neu user moi thi tra item pho bien.
Neu item moi thi dung Content-Based.
Luu model vao file `.pkl`.
Dung Python + Flask/FastAPI + pandas + numpy + scikit-learn + sentence-transformers.

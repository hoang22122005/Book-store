# Bookstore PostgreSQL ERD

Nguồn: schema `public` được đọc trực tiếp từ PostgreSQL.

```mermaid
erDiagram
    USER {
        integer user_id PK
        varchar name
        varchar email UK
        varchar role
        timestamp created_at
        date dob
        boolean is_deleted
        varchar address
        varchar phone
        varchar gender
        varchar career
        varchar password_hash
        varchar url_avt
        boolean is_vip
        timestamp vip_expiration
    }

    BOOK {
        integer book_id PK
        varchar name
        varchar isbn UK
        varchar author
        text description
        integer quantity_in_stock
        varchar publisher
        integer publish_year
        numeric price
        timestamp created_at
        timestamp deleted_at
        boolean is_deleted
        varchar url_image
        real avg_rating
        integer buy_count
        integer cnt_rating
        varchar public_id
        integer page_count
        boolean is_vip
    }

    GENRE {
        integer genre_id PK
        varchar name UK
    }

    BOOK_GENRE {
        integer book_genre_id PK
        integer book_id FK
        integer genre_id FK
    }

    VOUCHER {
        integer voucher_id PK
        real discount_percent
        varchar code UK
        timestamp expired_at
        varchar scope
    }

    BILL {
        integer bill_id PK
        integer user_id FK
        integer voucher_id FK
        numeric total_amount
        timestamp created_at
        varchar status
    }

    BILL_DETAIL {
        integer bill_detail_id PK
        integer bill_id FK
        integer book_id FK
        integer quantity
        numeric price_at_purchase
    }

    COMMENT {
        integer comment_id PK
        integer book_id FK
        integer user_id FK
        varchar content
        timestamp created_at
    }

    RATING {
        integer rating_id PK
        integer book_id FK
        integer user_id FK
        integer rate_value
    }

    CART {
        integer cart_id PK
        integer user_id FK,UK
        numeric total_amount
        timestamp created_at
    }

    CART_DETAIL {
        integer cart_id PK,FK
        integer book_id PK,FK
        integer quantity
        timestamp created_at
    }

    CHAT_ROOM {
        integer chat_room_id PK
        integer buyer_id FK,UK
        varchar status
        timestamp created_at
    }

    CHAT_MESSAGE {
        integer message_id PK
        integer chat_room_id FK
        integer sender_id FK
        varchar content
        boolean is_read
        timestamp created_at
    }

    REFRESH_TOKENS {
        bigint id PK
        timestamp created_at
        timestamp expires_at
        boolean revoked
        timestamp revoked_at
        varchar token UK
        integer user_id FK
    }

    PASSWORD_RESET_TOKENS {
        bigint id PK
        timestamp created_at
        timestamp expires_at
        varchar token_hash UK
        boolean used
        timestamp used_at
        integer user_id FK
    }

    USER_VOUCHER {
        integer id PK
        integer user_id FK
        integer voucher_id FK
        boolean is_used
        timestamp used_at
    }

    USER o|--o{ BILL : places
    VOUCHER o|--o{ BILL : applies_to
    BILL o|--o{ BILL_DETAIL : contains
    BOOK o|--o{ BILL_DETAIL : purchased_as

    BOOK ||--o{ BOOK_GENRE : classified_by
    GENRE ||--o{ BOOK_GENRE : contains

    USER o|--o{ COMMENT : writes
    BOOK o|--o{ COMMENT : receives
    USER o|--o{ RATING : gives
    BOOK o|--o{ RATING : receives

    USER o|--o| CART : owns
    CART ||--o{ CART_DETAIL : contains
    BOOK ||--o{ CART_DETAIL : added_as

    USER ||--o| CHAT_ROOM : opens
    CHAT_ROOM ||--o{ CHAT_MESSAGE : contains
    USER ||--o{ CHAT_MESSAGE : sends

    USER ||--o{ REFRESH_TOKENS : owns
    USER ||--o{ PASSWORD_RESET_TOKENS : requests
    USER o|--o{ USER_VOUCHER : receives
    VOUCHER o|--o{ USER_VOUCHER : assigned_as
```

## Phạm vi

- 16 bảng trong schema `public`.
- Sơ đồ thể hiện primary key, foreign key, unique key và kiểu dữ liệu PostgreSQL.
- Nullability được dùng để xác định phía quan hệ là bắt buộc hay tùy chọn.
- File PlantUML đầy đủ: [`database-uml.puml`](database-uml.puml).

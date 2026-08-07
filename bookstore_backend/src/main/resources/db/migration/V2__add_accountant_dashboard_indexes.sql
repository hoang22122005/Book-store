create index if not exists bill_status_created_at_dashboard_idx
    on bill (status, created_at)
    include (bill_id, user_id, total_amount);

create index if not exists bill_user_id_bill_id_idx
    on bill (user_id, bill_id desc);

create index if not exists bill_detail_bill_id_dashboard_idx
    on bill_detail (bill_id)
    include (quantity, price_at_purchase);

create index if not exists payment_bill_status_id_dashboard_idx
    on payment (bill_id, status, payment_id desc)
    include (payment_method);

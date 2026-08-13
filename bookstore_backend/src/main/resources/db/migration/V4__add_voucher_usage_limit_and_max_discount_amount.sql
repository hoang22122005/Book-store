alter table voucher
    add column usage_limit integer,
    add column usage_count integer not null default 0,
    add column max_discount_amount numeric(19, 2);

alter table voucher
    add constraint voucher_usage_limit_check
        check (usage_limit is null or usage_limit > 0),
    add constraint voucher_usage_count_check
        check (usage_count >= 0),
    add constraint voucher_usage_within_limit_check
        check (usage_limit is null or usage_count <= usage_limit),
    add constraint voucher_max_discount_amount_check
        check (max_discount_amount is null or max_discount_amount > 0);

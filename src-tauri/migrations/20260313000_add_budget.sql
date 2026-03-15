-- 予算マスタ追加
CREATE TABLE budget (
    id SERIAL PRIMARY KEY,
    start_date_of_application INTEGER,
    gross_profit_budget NUMERIC(15, 0),
    new_gross_profit_budget NUMERIC(15, 0),
    max_load_score NUMERIC(15, 0)
);
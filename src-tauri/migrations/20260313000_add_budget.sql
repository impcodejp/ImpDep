-- 予算マスタ追加
CREATE TABLE budget (
    id SERIAL PRIMARY KEY,
    start_date_of_application INTEGER,
    gross_profit_budget NUMERIC(15, 0) NOT NULL,
    new_gross_profit_buget NUMERIC(15, 0)NOT NULL,
    max_lode_score INTEGER NOT NULL
);
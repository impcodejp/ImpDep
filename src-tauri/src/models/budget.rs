use sqlx::types::BigDecimal;
use serde::Deserialize;

#[derive(serde::Deserialize)]
pub struct BudgetInput {
    pub start_date_of_application: i32,
    pub gross_profit_budget: Option<BigDecimal>,     // 💡 Option に変更
    pub new_gross_profit_budget: Option<BigDecimal>, // 💡 Option に変更
    pub max_load_score: Option<BigDecimal>,          // 💡 Option に変更
}
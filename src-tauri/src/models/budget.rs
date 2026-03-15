use sqlx::types::BigDecimal;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct BudgetInput {
    pub start_date_of_application: i32,
    pub gross_profit_budget: BigDecimal,
    pub new_gross_profit_budget: BigDecimal,
    pub max_load_score: BigDecimal,
}
use sqlx::types::BigDecimal;

#[derive(serde::Deserialize)]
pub struct BudgetInput {
    pub start_date_of_application: i32,
    pub gross_profit_budget: Option<BigDecimal>,     // 💡 Option に変更
    pub new_gross_profit_budget: Option<BigDecimal>, // 💡 Option に変更
    pub max_load_score: Option<BigDecimal>,          // 💡 Option に変更
}

pub struct GetBudget {
    pub max_load_score: Option<BigDecimal>,
    pub gross_profit_budget: Option<BigDecimal>,
    pub new_gross_profit_budget: Option<BigDecimal>,
}
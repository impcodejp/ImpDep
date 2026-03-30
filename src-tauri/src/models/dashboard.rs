// src/models/dashboard.rs
use serde::Serialize;
use sqlx::types::BigDecimal;

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DashboardBudget {
    pub load_point: BigDecimal,
    pub profit_sum: BigDecimal,
    pub profit_budget: BigDecimal,
    pub profit_point: BigDecimal,
    pub profit_sum_thismonth: BigDecimal,
    pub profit_point_thismonth: BigDecimal,
    pub new_profit_sum: BigDecimal,
    pub new_profit_budget: BigDecimal,
    pub new_profit_point: BigDecimal,
    pub new_profit_sum_thismonth: BigDecimal,
    pub new_profit_point_thismonth: BigDecimal,
}


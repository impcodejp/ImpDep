// src/models/dashboard.rs
use serde::Serialize;
use sqlx::types::BigDecimal;
use crate::models::project::ProjectWithClient;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardSummary {
    pub monthly_sales_plan: BigDecimal,
    pub monthly_sales_actual: BigDecimal,
    pub monthly_profit_plan: BigDecimal,
    pub monthly_profit_actual: BigDecimal,
    pub upcoming_projects: Vec<ProjectWithClient>,
    pub load_value_sum: BigDecimal,
}

#[derive(Serialize)]
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
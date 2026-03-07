// src/models/dashboard.rs
use serde::Serialize;
use sqlx::types::BigDecimal;
use crate::models::project::ProjectWithClient;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")] // 💡 これが重要！Rustの蛇身(sales_plan)をJSの駱駝(salesPlan)に変換します
pub struct DashboardSummary {
    pub monthly_sales_plan: BigDecimal,
    pub monthly_sales_actual: BigDecimal,
    pub monthly_profit_plan: BigDecimal,
    pub monthly_profit_actual: BigDecimal,
    pub upcoming_projects: Vec<ProjectWithClient>,
}
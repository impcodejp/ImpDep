// src-tauri/src/models/report.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::types::BigDecimal;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct MonthlyLoadSummary {
    pub year_month: String,
    pub project_count: i64, // 💡 追加：稼働案件数
    pub total_load: BigDecimal,
}
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{NaiveDate, DateTime, Utc};
use sqlx::types::BigDecimal; // 💡 これを構造体でも使います


// プロジェクト構造体
#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: i32,
    pub project_name: String,
    pub client_id: i32,
    pub sales_amount: BigDecimal,
    pub gross_profit_amount: BigDecimal,
    pub original_scheduled_date: NaiveDate,
    pub current_scheduled_date: NaiveDate,
    pub completed_date: Option<NaiveDate>,
    pub status: String,
    pub burden_ratio: BigDecimal,
    pub load_value: i32, // 💡 ここを i32 に（DBがIntegerなら）
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub assigned_date: NaiveDate,
    pub root_type: String,
}

// Client名を結合したプロジェクト構造体
#[derive(Debug, Serialize, Deserialize, FromRow)] // 💡 ここに FromRow があれば query_as! で使えます
#[serde(rename_all = "camelCase")]
pub struct ProjectWithClient {
    pub id: i32,
    pub project_name: String,
    pub client_name: String, 
    pub sales_amount: BigDecimal,
    pub gross_profit_amount: BigDecimal,
    pub current_scheduled_date: NaiveDate,
    pub status: String,
    pub burden_ratio: BigDecimal,
    pub load_value: i32,
    pub root_type:Option<String>,
}

// Client名を結合したプロジェクト構造体（計上予定日も）
#[derive(Debug, Serialize, Deserialize, FromRow)] // 💡 ここに FromRow があれば query_as! で使えます
#[serde(rename_all = "camelCase")]
pub struct ProjectWithClientWithDate {
    pub id: i32,
    pub project_name: String,
    pub client_name: String, 
    pub sales_amount: BigDecimal,
    pub gross_profit_amount: BigDecimal,
    pub current_scheduled_date: NaiveDate,
    pub original_scheduled_date: NaiveDate,
    pub status: String,
    pub root_type: Option<String>,
    pub burden_ratio: BigDecimal,
    pub load_value: i32,
    pub assigned_date: Option<NaiveDate>,
    pub completed_date: Option<NaiveDate>, // 💡 ここも i32 に
}

// プロジェクト更新用構造体
// 💡 追加：計上予定変更履歴用
#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDateHistory {
    pub id: i32,
    pub project_id: i32,
    pub old_date: Option<NaiveDate>, // 初回変更時はNULLの可能性があるのでOption
    pub new_date: Option<NaiveDate>, // 変更なしでテキストだけ変更するケースもあるのでOption
    pub change_reason: Option<String>, // 理由も空かもしれないのでOption
    pub changed_at: DateTime<Utc>,
}

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
pub struct ActualProfit {
    pub actual_profit_sum: BigDecimal,
    pub new_actual_profit_sum: BigDecimal,
}
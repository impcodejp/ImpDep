use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{NaiveDate, DateTime, Utc};
use sqlx::types::BigDecimal; // 💡 これを構造体でも使います


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
}

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
    pub load_value: i32, // 💡 ここも i32 に
}

#[derive(Debug, Serialize, Deserialize, FromRow)] // 💡 ここに FromRow があれば query_as! で使えます
#[serde(rename_all = "camelCase")]
pub struct ProjectWithClient2 {
    pub id: i32,
    pub project_name: String,
    pub client_name: String, 
    pub sales_amount: BigDecimal,
    pub gross_profit_amount: BigDecimal,
    pub current_scheduled_date: NaiveDate,
    pub original_scheduled_date: NaiveDate,
    pub status: String,
    pub burden_ratio: BigDecimal,
    pub load_value: i32,
    pub assigned_date: Option<NaiveDate>,
    pub completed_date: Option<NaiveDate>, // 💡 ここも i32 に
}


// 💡 追加：計上予定変更履歴用
#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDateHistory {
    pub id: i32,
    pub project_id: i32,
    pub old_date: Option<NaiveDate>, // 初回変更時はNULLの可能性があるのでOption
    pub new_date: NaiveDate,
    pub change_reason: Option<String>, // 理由も空かもしれないのでOption
    pub changed_at: DateTime<Utc>,
}
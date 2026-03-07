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
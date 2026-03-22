use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::types::Json; // 💡 追加：PostgreSQLのJSONBを扱うための専用型
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct SoftwareInfo {
    pub id: i32,
    pub client_id: i32,
    pub use_zaimu: bool,
    pub use_saimu: bool,
    pub use_saiken: bool,
    pub use_sisan: bool,
    pub use_kyuyo: bool,
    pub use_jinji: bool,
    pub use_hanbai: bool,
    pub use_other: Option<String>,
    pub details: Option<Json<Value>>, 
}

// フロントエンドから受け取る用の構造体（こちらはそのままでOK）
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertSoftwareInfo {
    pub client_id: i32,
    pub use_zaimu: bool,
    pub use_saimu: bool,
    pub use_saiken: bool,
    pub use_sisan: bool,
    pub use_kyuyo: bool,
    pub use_jinji: bool,
    pub use_hanbai: bool,
    pub use_other: Option<String>,
    pub details: Value, 
}
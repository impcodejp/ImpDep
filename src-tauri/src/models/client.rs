use serde::{Deserialize, Serialize};

// 既存の新規登録用
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateClientInput {
    pub client_code: String,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
}

// 💡 更新時にReactから受け取る用（idが追加されています）
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateClientInput {
    pub id: i32,
    pub client_code: String,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
}

// 💡 取得時にReactへ返す用（Serialize を使います）
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientResponse {
    pub id: i32,
    pub client_code: String,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
}
use serde::{Deserialize, Serialize};

// 新規登録用
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateClientInput {
    pub client_code: i32,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
    pub my_user: bool,
    pub other_system: Option<String>, // 💡 追加：null許容の文字列
}

// 更新時にReactから受け取る用
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateClientInput {
    pub id: i32,
    pub client_code: i32,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
    pub my_user: bool,
    pub other_system: Option<String>, // 💡 追加
}

// 取得時にReactへ返す用
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClientResponse {
    pub id: i32,
    pub client_code: i32,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
    pub my_user: bool,
    pub other_system: Option<String>, // 💡 追加
}
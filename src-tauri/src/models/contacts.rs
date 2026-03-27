use serde::{Deserialize, Serialize};

// 汎用モデル
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ContactInfo {
    pub id: i64,
    pub client_id: i32,
    pub name: String,
    pub tel_number: Option<String>,
    pub e_mail: Option<String>,
    pub bmn_name: Option<String>,
    pub del_kbn: Option<bool>,
}


#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddAndUpdateContactInfo {
    pub id: Option<i64>,
    pub client_id: i32,
    pub name: String,
    pub tel_number: Option<String>,
    pub e_mail: Option<String>,
    pub bmn_name: Option<String>,
}
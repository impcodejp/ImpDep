use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{NaiveDate, NaiveDateTime};

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct GetHardInfo {
    pub id: i32,
    pub client_id: i32,
    pub hard_kbn: i32,
    pub host_name: Option<String>,
    pub ip: Option<String>,
    pub introduction_date: Option<NaiveDate>,
    pub other_text: Option<String>,
    pub status: i32,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct HardUserInfo {
    pub id: i32,
    pub hard_id: i32,
    pub uuid: Option<String>,
    pub pass: Option<String>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InsertHardInfo {
    pub id: Option<i32>,
    pub client_id: i32,
    pub hard_kbn: i32,
    pub host_name: Option<String>,
    pub ip: Option<String>,
    pub introduction_date: Option<String>, // 空文字が来ても良いようにStringで受け取る
    pub other_text: Option<String>,
    pub status: i32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InsertHardUserInfo {
    pub uuid: Option<String>,
    pub pass: Option<String>,
}
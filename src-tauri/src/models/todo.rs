use serde::{ Deserialize, Serialize };
use chrono::NaiveDate;


#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetTodo {
    pub id: i32,
    pub title: String,
    pub end_date: NaiveDate,
    pub end_flag: Option<bool>,
    pub weight_label: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddTodo {
    pub title: String,
    pub end_date: String,
    pub weight_label: String,
    pub end_flag: bool,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndTodo {
    pub id:i32
}
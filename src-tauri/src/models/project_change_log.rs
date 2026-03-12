use serde::{Deserialize};
use chrono::NaiveDate;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectChangeLogInput {
    pub project_id: i32,
    pub old_scheduled_date: NaiveDate,
    pub new_scheduled_date: NaiveDate,
    pub change_reason: String,
}
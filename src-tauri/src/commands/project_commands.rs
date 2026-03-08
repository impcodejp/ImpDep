// src/commands/project_commands.rs
use tauri::State;
use crate::AppState;
use crate::repositories::project_repository;
use crate::models::project::{ ProjectWithClient, ProjectDateHistory, ProjectWithClient2};
use sqlx::types::BigDecimal;
use std::str::FromStr;
use chrono::NaiveDate;

#[tauri::command]
pub async fn create_project(
    state: tauri::State<'_, AppState>,
    project_name: String,
    client_id: i32,
    sales: f64,
    gross_profit: f64,
    scheduled_date: String,
    burden_ratio: f64,
    load_value: f64,
    assigned_date: String, // 💡 フロントから受け取る引数を追加
) -> Result<(), String> {
    
    project_repository::create_project(
        &state.db,
        &project_name,
        client_id,
        sales,
        gross_profit,
        &scheduled_date,
        burden_ratio / 100.0,
        load_value,
        &assigned_date, // 💡 これを最後に追加！
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_projects(
    state: State<'_, AppState>,
) -> Result<Vec<ProjectWithClient>, String> {
    // リポジトリの関数を呼び出してデータを取得
    project_repository::get_all_projects(&state.db)
        .await
        .map_err(|e| format!("案件一覧の取得に失敗しました: {}", e))
}

#[tauri::command]
pub async fn get_project_detail(
    state: tauri::State<'_, AppState>,
    id: i32
) -> Result<ProjectWithClient2, String> {
    crate::repositories::project_repository::get_project_by_id(&state.db, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project_history_list(
    state: tauri::State<'_, AppState>,
    id: i32
) -> Result<Vec<ProjectDateHistory>, String> {
    crate::repositories::project_repository::get_project_history(&state.db, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_project_details(
    state: tauri::State<'_, AppState>,
    id: i32,
    project_name: String,
    sales_amount: f64,
    gross_profit_amount: f64,
    status: String,
    burden_ratio: f64,
    load_value: f64,
    assigned_date: Option<String>,
    completed_date: Option<String>, // 💡 フロントから Option<string | null> で届く
) -> Result<(), String> {
    // 1. 数値を BigDecimal に変換
    let sales_bd = BigDecimal::from_str(&sales_amount.to_string()).unwrap_or_default();
    let profit_bd = BigDecimal::from_str(&gross_profit_amount.to_string()).unwrap_or_default();
    let ratio_bd = BigDecimal::from_str(&burden_ratio.to_string()).unwrap_or_default();
    let load_bd = BigDecimal::from_str(&load_value.to_string()).unwrap_or_default();

    // 2. 日付文字列を Option<NaiveDate> に変換
    let assigned = assigned_date
        .and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
    
    let completed = completed_date
        .and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());

    // 3. リポジトリの呼び出し
    project_repository::update_project_details(
        &state.db,
        id,
        project_name,
        sales_bd,
        profit_bd,
        status,
        ratio_bd,
        load_bd,
        assigned,
        completed,
    )
    .await
    .map_err(|e| e.to_string())
}
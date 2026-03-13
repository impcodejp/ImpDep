// src-tauri/src/commands/project_commands.rs
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
    sales: String,           // 💡 f64 -> String に変更
    gross_profit: String,    // 💡 f64 -> String に変更
    scheduled_date: String,
    burden_ratio: f64,
    load_value: f64,
    assigned_date: String,
    root_type: String,
) -> Result<(), String> {
    
    // 💡 サーバー側で String から BigDecimal に安全に変換（エラー時はフロントに返す）
    let sales_bd = BigDecimal::from_str(&sales)
        .map_err(|_| "売上金額の形式が正しくありません")?;
    let profit_bd = BigDecimal::from_str(&gross_profit)
        .map_err(|_| "粗利金額の形式が正しくありません")?;

    project_repository::create_project(
        &state.db,
        &project_name,
        client_id,
        sales_bd,   // 💡 変換済みの BigDecimal を渡す
        profit_bd,  // 💡 変換済みの BigDecimal を渡す
        &scheduled_date,
        burden_ratio / 100.0,
        load_value,
        &assigned_date,
        &root_type,
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
pub async fn update_project_details(
    state: tauri::State<'_, AppState>,
    id: i32,
    project_name: String,
    sales_amount: String,        // 💡 f64 -> String に変更
    gross_profit_amount: String, // 💡 f64 -> String に変更
    status: String,
    root_type: Option<String>,
    burden_ratio: f64,
    load_value: f64,
    assigned_date: Option<String>,
    completed_date: Option<String>,
) -> Result<(), String> {
    // 1. 金額（String）を BigDecimal に変換
    let sales_bd = BigDecimal::from_str(&sales_amount)
        .map_err(|_| "売上金額の形式が正しくありません")?;
    let profit_bd = BigDecimal::from_str(&gross_profit_amount)
        .map_err(|_| "粗利金額の形式が正しくありません")?;
        
    // その他の数値変換（一旦そのまま）
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
        sales_bd,     // 💡 変換済みの値を渡す
        profit_bd,    // 💡 変換済みの値を渡す
        status,
        root_type,
        ratio_bd,
        load_bd,
        assigned,
        completed,
    )
    .await
    .map_err(|e| e.to_string())
}

// 💡 復活させました！
#[tauri::command]
pub async fn get_project_history_list(
    state: tauri::State<'_, AppState>,
    id: i32
) -> Result<Vec<ProjectDateHistory>, String> {
    crate::repositories::project_repository::get_project_history(&state.db, id)
        .await
        .map_err(|e| e.to_string())
}

// 💡 復活させました！
#[tauri::command]
pub async fn delete_project(
    state: State<'_, AppState>,
    id: i32,
) -> Result<(), String> {
    println!("DEBUG: Deleting project ID: {}", id);

    let pool = &state.db;

    project_repository::delete_project(pool, id)
        .await
        .map_err(|e| {
            let err_msg = format!("削除に失敗しました: {:?}", e);
            println!("{}", err_msg);
            err_msg
        })?;

    println!("SUCCESS: Project {} deleted.", id);
    Ok(())
}
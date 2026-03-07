// src/commands/project_commands.rs
use tauri::State;
use crate::AppState;
use crate::repositories::project_repository;
use crate::models::project::{ ProjectWithClient};

#[tauri::command]
pub async fn create_project(
    state: State<'_, AppState>,
    project_name: String,
    client_id: i32,
    sales: f64,
    gross_profit: f64,
    scheduled_date: String,
    burden_ratio: f64,
    load_value: f64,
) -> Result<(), String> {
    project_repository::create_project(
        &state.db,
        &project_name,
        client_id,
        sales,
        gross_profit,
        &scheduled_date,
        burden_ratio / 100.0, // パーセントを小数に変換
        load_value,
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

// src-tauri/src/commands/report_commands.rs
use crate::AppState;
use crate::models::report::MonthlyLoadSummary; // 💡 新しいモデルをインポート
use crate::repositories::report_repository;    // 💡 新しいリポジトリをインポート

#[tauri::command]
pub async fn get_monthly_load_transition(
    state: tauri::State<'_, AppState>,
    start_month: String,
    end_month: String,
) -> Result<Vec<MonthlyLoadSummary>, String> {
    
    report_repository::get_monthly_load_transition(
        &state.db, 
        &start_month, 
        &end_month
    )
    .await
    .map_err(|e| e.to_string())
}
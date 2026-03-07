// src/commands/dashboard_commands.rs

use tauri::State;
use crate::AppState;
use crate::models::dashboard::DashboardSummary;
use crate::repositories::project_repository; // Repository を呼ぶ

#[tauri::command]
pub async fn get_dashboard_summary(
    state: State<'_, AppState>,
) -> Result<DashboardSummary, String> {
    // Repository の関数を呼ぶだけ！
    project_repository::get_dashboard_summary(&state.db)
        .await
        .map_err(|e| format!("ダッシュボードデータの取得に失敗しました: {}", e))
}
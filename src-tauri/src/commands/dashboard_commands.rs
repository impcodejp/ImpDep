// src-tauri/src/commands/dashboard_commands.rs

use tauri::State;
use crate::AppState;
use crate::models::dashboard::{ DashboardBudget };
use crate::models::project::{ DashboardSummary };
use crate::repositories::project_repository;
use crate::service::dashboard_service;

#[tauri::command]
pub async fn get_dashboard_summary(
    state: State<'_, AppState>,
    target_month: String, // 💡 追加：フロントから年月を受け取る
) -> Result<DashboardSummary, String> {
    // リポジトリに年月を渡して集計させる
    project_repository::get_dashboard_summary(&state.db, &target_month)
        .await
        .map_err(|e| format!("{}月のデータ取得に失敗しました: {}", target_month, e))
}

#[tauri::command]
pub async fn get_fiscal_summary(
    state: State<'_, AppState>,
    input_date: String
) -> Result<DashboardBudget, String> {
    dashboard_service::get_dashboard_data_service(&state.db, &input_date)
        .await
        .map_err(|e| format!("新版の集計に失敗: {}", e))
}
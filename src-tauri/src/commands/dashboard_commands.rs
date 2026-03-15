// src-tauri/src/commands/dashboard_commands.rs

use tauri::State;
use crate::AppState;
use crate::models::dashboard::{ DashboardSummary, DashboardBudget };
use crate::repositories::project_repository;
use crate::service::dashboard_service::calculate_summary_period;
use crate::repositories::dashboard_repository;

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
    state: State<'_, AppState>, // PgPool単体ではなくAppStateに合わせる
    input_date: String
) -> Result<DashboardBudget, String> {
    // 1. 期間算出
    let (start, end) = calculate_summary_period(&input_date)?;

    // 2. リポジトリ呼び出し（既存のスタイルに合わせて実装）
    dashboard_repository::get_summary_by_period(&state.db, start, end, input_date)
        .await
        .map_err(|e| format!("期間集計に失敗しました: {}", e))
}
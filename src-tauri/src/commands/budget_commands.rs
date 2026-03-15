use tauri::State;
use crate::AppState;
use crate::models::budget::BudgetInput;
use crate::repositories::budget_repository;

#[tauri::command]
pub async fn save_budget_settings(
    state: State<'_, AppState>,
    input: BudgetInput
) -> Result<String, String> {
    // リポジトリ層の関数を呼び出し
    budget_repository::create_budget_setting(&state.db, input)
        .await
        .map_err(|e| {
            println!("予算保存エラー: {}", e);
            format!("データベースへの保存に失敗しました: {}", e)
        })?;

    Ok("予算設定を新規登録しました".to_string())
}
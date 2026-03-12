use tauri::State;
use crate::AppState; 
use crate::models::project_change_log::CreateProjectChangeLogInput;
// リポジトリ内の関数を直接使えるように import します
use crate::repositories::project_change_log_repository::add_project_change_log; 

#[tauri::command]
pub async fn register_history_log(
    state: State<'_, AppState>,
    payload: CreateProjectChangeLogInput,
) -> Result<(), String> {
    // 💡 1. フロントから届いたデータを確認
    println!("--- DEBUG START ---");
    println!("Payload: {:?}", payload);

    // 💡 2. フィールド名を db に修正
    let pool = &state.db; 

    // 💡 3. リポジトリ関数の呼び出し
    add_project_change_log(pool, payload)
        .await
        .map_err(|e| {

            let full_error = format!("DATABASE ERROR DETAIL: {:?}", e);
            println!("{}", full_error); 
            full_error 
        })?;

    println!("--- DEBUG SUCCESS ---");
    Ok(())
}
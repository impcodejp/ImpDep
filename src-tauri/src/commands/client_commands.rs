use tauri::State;
use crate::AppState; // lib.rsで定義したAppState
use crate::models::client::CreateClientInput;
use crate::repositories::client_repository;

// #[tauri::command] をつけることでReactから呼べるようになります
#[tauri::command]
pub async fn add_client(
    state: State<'_, AppState>,
    payload: CreateClientInput,
) -> Result<(), String> {
    // リポジトリ層の関数を呼び出す
    client_repository::create_client(&state.db, payload)
        .await
        .map_err(|e| {
            println!("DB Error: {:?}", e); // エラー時はコンソールに詳細を出す
            "データベースへの登録に失敗しました".to_string()
        })
}
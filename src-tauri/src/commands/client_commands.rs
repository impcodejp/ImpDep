use tauri::State;
use crate::AppState; // lib.rsで定義したAppState
use crate::models::client::{CreateClientInput, ClientResponse, UpdateClientInput};
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

#[tauri::command]
pub async fn get_client_by_code(
    state: State<'_, AppState>,
    code: String,
) -> Result<ClientResponse, String> {
    client_repository::get_client_by_code(&state.db, code)
        .await
        .map_err(|e| {
            println!("DB Error (get_client_by_code): {:?}", e);
            "指定された取引先コードが見つかりませんでした".to_string()
        })
}

// 取引先更新コマンド
#[tauri::command]
pub async fn update_client(
    state: State<'_, AppState>,
    payload: UpdateClientInput,
) -> Result<(), String> {
    client_repository::update_client(&state.db, payload)
        .await
        .map_err(|e| {
            println!("DB Error (update_client): {:?}", e);
            "取引先情報の更新に失敗しました".to_string()
        })
}

#[tauri::command]
pub async fn search_clients(
    state: State<'_, AppState>,
    name: String,
) -> Result<Vec<ClientResponse>, String> {
    client_repository::search_clients_by_name(&state.db, name)
        .await
        .map_err(|e| {
            println!("DB Error (search_clients): {:?}", e);
            "取引先の検索に失敗しました".to_string()
        })
}

#[tauri::command]
pub async fn get_all_clients(
    state: State<'_, AppState>,
) -> Result<Vec<ClientResponse>, String> {
    client_repository::get_all_clients(&state.db)
        .await
        .map_err(|e| {
            println!("DB Error (get_all_clients): {:?}", e);
            "取引先一覧の取得に失敗しました".to_string()
        })
}
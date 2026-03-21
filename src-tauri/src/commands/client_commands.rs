use tauri::State;
use crate::AppState; // lib.rsで定義したAppState
use crate::models::client::{CreateClientInput, ClientResponse, UpdateClientInput};
use crate::models::hard_info::{GetHardInfo, HardUserInfo, InsertHardInfo, InsertHardUserInfo};
use crate::repositories::client_repository;
use crate::repositories::hard_info_repository;

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
    code: i32,
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

#[tauri::command]
pub async fn get_hard_info_by_client_id(
    state: State<'_, AppState>,
    client_id: i32, 
) -> Result<Vec<GetHardInfo>, String> {
    hard_info_repository::get_hard_info_by_client_id(&state.db, client_id)
    .await
    .map_err(|e| {
        println!("DB Error (search_clients): {:?}", e);
        "ハード導入情報の検索に失敗しました".to_string()
    })
}

#[tauri::command]
pub async fn get_hard_user_info_secure(
    state: State<'_, AppState>,
    hard_id: i32,
    input_password: String,
) -> Result<Vec<HardUserInfo>, String> {
    let master_password = "MJS369CS"; 
    if input_password != master_password {
        return Err("パスワードが正しくありません".to_string());
    }

    hard_info_repository::get_user_info_by_hard_id(&state.db, hard_id)
        .await
        .map_err(|e| {
            println!("アカウント情報の取得に失敗しました:{}", e);
            "アカウント情報の取得に失敗しました".to_string()
        })
}

#[tauri::command]
pub async fn insert_hardware_info(
    state: State<'_, AppState>,
    hard_info: InsertHardInfo,
    user_infos: Vec<InsertHardUserInfo>,
) -> Result<(), String> {
    hard_info_repository::insert_hardware_with_users(&state.db, hard_info, user_infos)
        .await
        .map_err(|e| format!("機器情報の登録に失敗しました: {}", e))
}

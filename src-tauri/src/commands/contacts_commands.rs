use tauri::State;
use crate::AppState; // lib.rsで定義したAppState
use crate::repositories::contacts_repository;
use crate::models::contacts::{AddAndUpdateContactInfo, ContactInfo};

#[tauri::command]
pub async fn get_contact_info_by_client_id(
    state: State<'_, AppState>,
    client_id: i32,
) ->Result<Vec<ContactInfo>,String> {
    contacts_repository::get_contacts_info_by_client_id(&state.db, client_id)
        .await
        .map_err(|e| {
            println!("DB Error: {:?}", e);
            "データベースからの取得に失敗しました".to_string()
        })
}

#[tauri::command]
pub async fn upsert_contact_info(
    state: State<'_, AppState>,
    info: AddAndUpdateContactInfo,
) -> Result<String, String> {
    contacts_repository::upsert(&state.db, info)
        .await
        .map_err(|e| format!("コンタクト情報の保存エラー: {}", e))
}
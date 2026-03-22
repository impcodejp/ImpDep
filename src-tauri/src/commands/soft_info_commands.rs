use tauri::State;
use crate::AppState;
use crate::models::soft_info::{SoftwareInfo, UpsertSoftwareInfo};
use crate::repositories::soft_info_repository;

#[tauri::command]
pub async fn get_software_info_by_client_id(
    state: State<'_, AppState>,
    client_id: i32,
) -> Result<Option<SoftwareInfo>, String> {
    soft_info_repository::get_by_client_id(&state.db, client_id)
        .await
        .map_err(|e| format!("ソフトウェア情報の取得エラー: {}", e))
}

#[tauri::command]
pub async fn upsert_software_info(
    state: State<'_, AppState>,
    info: UpsertSoftwareInfo,
) -> Result<i32, String> {
    soft_info_repository::upsert(&state.db, info)
        .await
        .map_err(|e| format!("ソフトウェア情報の保存エラー: {}", e))
}
use tauri::State;
use crate::AppState;
use crate::models::todo::{AddTodo, EndTodo, GetTodo};
use crate::repositories::todo_repositories;

#[tauri::command]
pub async fn get_todo(
    state: State<'_,AppState>
) -> Result<Vec<GetTodo>, String> {
    todo_repositories::get_todo(&state.db)
        .await
        .map_err(|e| format!("todoの取得に失敗しました：{}",e))
}

#[tauri::command]
pub async fn add_todo(
    state: State<'_,AppState>,
    payload: AddTodo,
) -> Result<(), String> {
    todo_repositories::add_todo(&state.db, payload)
    .await
    .map_err(|e| format!("todoの追加に失敗しました：{}",e))
}

#[tauri::command]
pub async fn update_todo_status(
    state: State<'_,AppState>,
    payload: EndTodo,
) ->Result<(), String> {
    todo_repositories::complete_todo(&state.db, payload)
    .await
    .map_err(|e| format!("todoの更新に失敗しました：{}",e))
}
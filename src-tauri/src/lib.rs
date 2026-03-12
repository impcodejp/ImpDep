use tauri::Manager;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use dotenvy::dotenv;
use std::env;

pub mod models;
pub mod repositories;
pub mod commands;

pub struct AppState {
    db: Pool<Postgres>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
                // ダッシュボード関連コマンド
                commands::dashboard_commands::get_dashboard_summary,
                // ウィンドウ表示コマンド
                commands::window_commands::open_registration_window,
                commands::window_commands::open_edit_window,
                commands::window_commands::open_project_registration_window,
                commands::window_commands::open_project_detail_window,
                commands::window_commands::open_history_log_registration_window,
                // 取引先関連操作コマンド
                commands::client_commands::add_client,
                commands::client_commands::get_client_by_code,
                commands::client_commands::update_client,
                commands::client_commands::search_clients,
                commands::client_commands::get_all_clients,
                // プロジェクト関連操作コマンド
                commands::project_commands::create_project,
                commands::project_commands::get_projects,
                commands::project_commands::get_project_detail,
                commands::project_commands::get_project_history_list,
                commands::project_commands::update_project_details,
                commands::project_commands::delete_project,
                // プロジェクト変更履歴関連操作コマンド
                commands::project_change_log_commands::register_history_log,
            ])
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                let impdep_url = env::var("IMPDEP_URL").expect("IMPDEP_URL must be set");
                
                let pool = PgPoolOptions::new()
                    .max_connections(5)
                    .connect(&impdep_url)
                    .await
                    .expect("Failed to connect to Postgres");

                // --- ここから追加 ---
                // migrationsフォルダ内のSQLを読み込み、未実行のものがあれば実行する
                sqlx::migrate!("./migrations")
                    .run(&pool)
                    .await
                    .expect("Failed to run database migrations");
                println!("Database migrations completed successfully!!");
                // --- ここまで追加 --

                app.manage(AppState { db: pool });
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
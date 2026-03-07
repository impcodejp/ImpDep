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
                // 取引先関連操作コマンド
                commands::client_commands::add_client,
                commands::client_commands::get_client_by_code,
                commands::client_commands::update_client,
                commands::client_commands::search_clients,
                commands::client_commands::get_all_clients,
                // プロジェクト関連操作コマンド
                commands::project_commands::create_project,
                commands::project_commands::get_projects
            ])
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
                
                let pool = PgPoolOptions::new()
                    .max_connections(5)
                    .connect(&database_url)
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
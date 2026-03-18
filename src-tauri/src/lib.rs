use tauri::Manager;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use dotenvy::dotenv;
use std::env;

pub mod models;
pub mod repositories;
pub mod commands;
pub mod service;

pub struct AppState {
    db: Pool<Postgres>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 開発時（デバッグビルド）のみ .env ファイルを読み込む
    if cfg!(debug_assertions) {
        dotenv().ok();
        println!("🔧 開発モード: .env ファイルを読み込みました");
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
                // ダッシュボード関連コマンド
                commands::dashboard_commands::get_dashboard_summary,
                commands::dashboard_commands::get_fiscal_summary,
                // ウィンドウ表示コマンド
                commands::window_commands::open_registration_window,
                // ウィンドウ表示コマンド（追加分）
                commands::window_commands::open_edit_window,
                commands::window_commands::open_project_registration_window,
                commands::window_commands::open_project_detail_window,
                commands::window_commands::open_history_log_registration_window,
                commands::window_commands::open_load_transition_report,
                commands::window_commands::open_budget_setting,
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
                // 予算登録関連コマンド
                commands::budget_commands::save_budget_settings,
                // todo操作系コマンド
                commands::todo_commands::get_todo,
                commands::todo_commands::add_todo,
                commands::todo_commands::update_todo_status,
                // 帳票出力関連操作コマンド
                commands::report_commands::get_monthly_load_transition,
            ])
        .setup(|app| {
            // asyncブロックを定義
            let _handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                
                // 1. 環境変数の取得
                let db_url = if cfg!(debug_assertions) {
                    env::var("DATABASE_URL").expect("開発環境では .env に DATABASE_URL を設定してください")
                } else {
                    env::var("IMPDEP_URL").expect("本番環境では OSの環境変数 IMPDEP_URL を設定してください")
                };
                
                // 2. データベース接続
                let pool = match PgPoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await {
                        Ok(p) => p,
                        Err(e) => {
                            eprintln!("❌ データベース接続失敗: {:?}", e);
                            // 接続できない場合はここでパニックさせるか、適切に終了処理を書く
                            panic!("Failed to connect to Postgres: {}", e);
                        }
                    };

                // 3. マイグレーションの実行
                // expect() で落とさずに match で結果を確認するようにします
                match sqlx::migrate!("./migrations").run(&pool).await {
                    Ok(_) => {
                        println!("✅ Database migrations completed successfully!!");
                    },
                    Err(e) => {
                        // ここでエラー内容を詳細に表示（VersionMissing などがここでわかります）
                        eprintln!("⚠️ マイグレーション実行中にエラーが発生しました:");
                        eprintln!("詳細: {:?}", e);
                        
                        // 開発を止めないために panic させない選択肢もありますが、
                        // DB整合性が崩れている場合は止めたほうが安全なため、情報を出した上で panic させます
                        panic!("Migration error: {}", e);
                    }
                }

                // 状態の管理
                app.manage(AppState { db: pool });
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub async fn open_registration_window(app: AppHandle) -> Result<(), String> {
    // 1. 既に「client-registration-window」が開いているかチェック
    if let Some(window) = app.get_webview_window("client-registration-window") {
        // 既に開いていたら、新しく作らずに一番手前に持ってくる（フォーカスする）
        let _ = window.set_focus();
        return Ok(());
    }

    // 2. 開いていなければ、新しいウィンドウを作成する
    WebviewWindowBuilder::new(
        &app,
        "client-registration-window",
        WebviewUrl::App("/client-registration".into()) // Reactのルーティングのパスを指定
    )
    .title("取引先マスタ登録")
    .inner_size(500.0, 700.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}
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
    .inner_size(800.0, 800.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn open_edit_window(app: AppHandle) -> Result<(), String> {
    // 1. 既に「client-edit-window」が開いているかチェック
    if let Some(window) = app.get_webview_window("client-edit-window") {
        let _ = window.set_focus();
        return Ok(());
    }

    // 2. 開いていなければ、新しいウィンドウを作成する
    WebviewWindowBuilder::new(
        &app,
        "client-edit-window",
        // React側のルーティングに合わせてパスを指定します（例: /client-edit）
        WebviewUrl::App("/client-edit".into()) 
    )
    .title("取引先マスタ更新")
    // 検索枠などを開くことを考えて、少し高さを大きめにしてもいいかもしれませんね
    .inner_size(800.0, 800.0) 
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

// src/main.rs (または src/commands/mod.rs など)

#[tauri::command]
pub async fn open_project_registration_window(handle: tauri::AppHandle) -> Result<(), String> {
    // 既にウィンドウが開いているかチェック（二重開き防止）
    if let Some(window) = handle.get_webview_window("project_registration") {
        window.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    // 新しいウィンドウを作成
    tauri::WebviewWindowBuilder::new(
        &handle,
        "project_registration", // ウィンドウ識別子
        tauri::WebviewUrl::App("/project-registration".into()) // ReactのRouteパス
    )
    .title("案件新規登録")
    .inner_size(800.0, 800.0) // 登録画面なので少し縦長に
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn open_project_detail_window(handle: tauri::AppHandle, id: i32) -> Result<(), String> {
    // 💡 URLにIDをのせて、詳細画面側でどの案件か特定できるようにします
    let url = format!("/project-detail/{}", id);
    
    let _ = tauri::WebviewWindowBuilder::new(
        &handle,
        format!("detail-{}", id), // ウィンドウを識別するユニークなキー
        tauri::WebviewUrl::App(url.into())
    )
    .title("案件詳細")
    .inner_size(800.0, 600.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}
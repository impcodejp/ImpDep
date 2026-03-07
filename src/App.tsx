// src/App.tsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import ClientRegistration from "./pages/ClientRegistration";
import "./App.css";

function MainScreen() {
  // どのタブを開いているかを管理します（初期値はダッシュボード）
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu'>('dashboard');

  // サブウィンドウを開く関数（先ほど作ったRustのコマンドを呼びます）
  const openClientRegistration = async () => {
    try {
      await invoke("open_registration_window");
    } catch (error) {
      console.error("ウィンドウの展開に失敗しました:", error);
    }
  };

  return (
    <main className="main-container">
      <h1>ImpDep System</h1>

      {/* --- タブの切り替えボタン --- */}
      <div className="tab-header">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 ダッシュボード
        </button>
        <button 
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          📁 メニュー
        </button>
      </div>

      {/* --- タブの中身 --- */}
      <div className="tab-content">
        
        {/* ダッシュボードが選ばれている時の表示 */}
        {activeTab === 'dashboard' && (
          <div className="dummy-dashboard">
            <h2>今月の計上予定サマリー</h2>
            <div className="dummy-chart">
              <p>ここに棒グラフや円グラフが表示される予定です</p>
            </div>
            <div className="dummy-stats">
              <div className="stat-box">
                <span className="stat-label">今月の予定案件</span>
                <span className="stat-value">12 件</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">未処理（確認待ち）</span>
                <span className="stat-value alert">3 件</span>
              </div>
            </div>
          </div>
        )}

        {/* メニューが選ばれている時の表示（ツリー形式） */}
        {activeTab === 'menu' && (
          <div className="tree-menu">
            <h2>システムメニュー</h2>
            <ul className="tree-list">
              <li>
                <span className="folder">📂 マスタ管理</span>
                <ul>
                  <li>
                    <button className="tree-item-button" onClick={openClientRegistration}>
                      📄 取引先マスタ登録
                    </button>
                  </li>
                  <li><span className="tree-item disabled">📄 案件マスタ登録 (準備中)</span></li>
                </ul>
              </li>
              <li>
                <span className="folder">📂 帳票出力・レポート</span>
                <ul>
                  <li><span className="tree-item disabled">📊 来月の計上予定一覧表 (準備中)</span></li>
                  <li><span className="tree-item disabled">📑 案件詳細レポート (準備中)</span></li>
                </ul>
              </li>
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/client-registration" element={<ClientRegistration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
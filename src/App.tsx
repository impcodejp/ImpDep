// src/App.tsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Dashboard from "./components/Dashboard"; // 💡 作成したコンポーネントをインポート

// 各ページコンポーネントのインポート
import ClientRegistration from "./pages/ClientRegistration";
import ClientEdit from "./pages/ClientEdit";
import ClientList from "./pages/ClientList";
import ProjectRegistration from "./pages/ProjectRegistration";
import ProjectList from "./pages/ProjectList"; 

import "./App.css";

function MainScreen() {
  // タブの状態管理
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'clientList' | 'projectList'>('dashboard');

  // --- ウィンドウ操作用の関数群 ---

  const openClientRegistration = async () => {
    try {
      await invoke("open_registration_window");
    } catch (error) {
      console.error("ウィンドウ展開エラー:", error);
    }
  };

  const openClientEdit = async () => {
    try {
      await invoke("open_edit_window");
    } catch (error) {
      console.error("ウィンドウ展開エラー:", error);
    }
  };

  const openProjectRegistration = async () => {
    try {
      await invoke("open_project_registration_window");
    } catch (error) {
      console.error("ウィンドウ展開エラー:", error);
    }
  };

  return (
    <main className="main-container">
      <header className="main-header">
        <h1>ImpDep System 2026</h1>
      </header>

      {/* --- タブの切り替えボタン --- */}
      <nav className="tab-header">
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
        <button 
          className={`tab-button ${activeTab === 'projectList' ? 'active' : ''}`}
          onClick={() => setActiveTab('projectList')}
        >
          📈 案件進捗一覧
        </button>
        <button 
          className={`tab-button ${activeTab === 'clientList' ? 'active' : ''}`}
          onClick={() => setActiveTab('clientList')}
        >
          📋 取引先一覧
        </button>
      </nav>

      {/* --- タブの中身 --- */}
      <div className="tab-content">
        
        {/* ① ダッシュボード 💡 本物のコンポーネントに差し替え */}
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}

        {/* ② メニュー（ツリー形式） */}
        {activeTab === 'menu' && (
          <div className="tree-menu">
            <h2>システムメニュー</h2>
            <ul className="tree-list">
              <li>
                <span className="folder">📂 マスタ管理</span>
                <ul>
                  <li><button className="tree-item-button" onClick={openClientRegistration}>📄 取引先マスタ登録</button></li>
                  <li><button className="tree-item-button" onClick={openClientEdit}>📝 取引先マスタ更新</button></li>
                </ul>
              </li>
              
              <li>
                <span className="folder">📂 案件業務管理</span>
                <ul>
                  <li>
                    <button className="tree-item-button" onClick={openProjectRegistration}>
                      💎 案件新規登録
                    </button>
                  </li>
                  <li>
                    <button className="tree-item-button" onClick={() => setActiveTab('projectList')}>
                      📑 案件進捗一覧
                    </button>
                  </li>
                  <li><span className="tree-item disabled">💰 売上・粗利集計 (準備中)</span></li>
                </ul>
              </li>
            </ul>
          </div>
        )}

        {/* ③ 案件進捗一覧タブ */}
        {activeTab === 'projectList' && (
          <div className="list-view">
            <ProjectList />
          </div>
        )}

        {/* ④ 取引先一覧タブ */}
        {activeTab === 'clientList' && (
          <div className="list-view">
            <ClientList />
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
        <Route path="/client-edit" element={<ClientEdit />} />
        <Route path="/project-registration" element={<ProjectRegistration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
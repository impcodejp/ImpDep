import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Dashboard from "./components/Dashboard"; 
import Menu from "./components/Menu";
import "./MainScreen.css";

// 各ページコンポーネントのインポート
import ClientRegistration from "./pages/ClientRegistration";
import ClientEdit from "./pages/ClientEdit";
import ClientList from "./pages/ClientList";
import ProjectRegistration from "./pages/ProjectRegistration";
import ProjectList from "./pages/ProjectList"; 
import ProjectDetail from "./pages/ProjectDetail"; // 💡 追加：詳細画面をインポート
import HistoryLogRegistration from "./pages/HistoryLogRegistration";
import LoadTransitionReport from "./pages/LoadTransitionReport";
import BudgetSetting from "./pages/BudgetSetting";

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

  const openLoadTransitionReport = async () => {
    try {
      await invoke("open_load_transition_report");
    } catch (error) {
      console.error("ウィンドウ展開エラー:", error);
    }
  }

  const openBudgetSetting = async () => {
    try {
      await invoke("open_budget_setting");
    } catch (error) {
      console.error("ウィンドウ展開エラー", error)
    }
  }

  return (
    <main className="main-container">
      <header className="main-header">
        <h1>ImpDep</h1>
        <h2>- 個人計上管理システム -</h2>
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
        
        {/* ① ダッシュボード */}
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}

        {/* ② メニュー（ツリー形式） */}
        {activeTab === 'menu' && (
          <Menu 
            openClientRegistration={openClientRegistration}
            openClientEdit={openClientEdit}
            openProjectRegistration={openProjectRegistration}
            openLoadTransitionReport={openLoadTransitionReport}
            openBudgetSetting={openBudgetSetting}
            setActiveTab={setActiveTab}
          />
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
        {/* 💡 追記：案件詳細画面（サブウィンドウ用） */}
        <Route path="/project-detail/:id" element={<ProjectDetail />} />
        {/* 💡 追記：履歴登録画面（サブウィンドウ用） */}
        <Route path="/history-log-registration/:id" element={<HistoryLogRegistration />} />
        <Route path="/LoadTransitionReport" element={<LoadTransitionReport />} />
        <Route path="/BudgetSetting" element={<BudgetSetting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
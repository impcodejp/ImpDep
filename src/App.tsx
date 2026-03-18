import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Dashboard from "./components/Dashboard"; 
import Menu from "./components/Menu";

import ClientRegistration from "./pages/ClientRegistration";
import ClientEdit from "./pages/ClientEdit";
import ClientList from "./pages/ClientList";
import ProjectRegistration from "./pages/ProjectRegistration";
import ProjectList from "./pages/ProjectList"; 
import ProjectDetail from "./pages/ProjectDetail";
import HistoryLogRegistration from "./pages/HistoryLogRegistration";
import LoadTransitionReport from "./pages/LoadTransitionReport";
import BudgetSetting from "./pages/BudgetSetting";

import "./App.css";

function MainScreen() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'clientList' | 'projectList'>('dashboard');

  const openClientRegistration = async () => { try { await invoke("open_registration_window"); } catch (error) { console.error(error); } };
  const openClientEdit = async () => { try { await invoke("open_edit_window"); } catch (error) { console.error(error); } };
  const openProjectRegistration = async () => { try { await invoke("open_project_registration_window"); } catch (error) { console.error(error); } };
  const openLoadTransitionReport = async () => { try { await invoke("open_load_transition_report"); } catch (error) { console.error(error); } };
  const openBudgetSetting = async () => { try { await invoke("open_budget_setting"); } catch (error) { console.error(error); } };

  return (
    <div className="app-layout">
      {/* --- 左側：モダンなサイドバー --- */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <h1>ImpDep</h1>
          <p className="subtitle">Personal Management</p>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">✦</span> ダッシュボード
          </button>
          <button className={`nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <span className="icon">❖</span> メニュー
          </button>
          <button className={`nav-btn ${activeTab === 'projectList' ? 'active' : ''}`} onClick={() => setActiveTab('projectList')}>
            <span className="icon">📈</span> 案件進捗一覧
          </button>
          <button className={`nav-btn ${activeTab === 'clientList' ? 'active' : ''}`} onClick={() => setActiveTab('clientList')}>
            <span className="icon">🏢</span> 取引先一覧
          </button>
        </nav>
      </aside>

      {/* --- 右側：メインコンテンツ --- */}
      <main className="app-main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'menu' && (
          <div className="scrollable-view">
            <Menu 
              openClientRegistration={openClientRegistration} openClientEdit={openClientEdit}
              openProjectRegistration={openProjectRegistration} openLoadTransitionReport={openLoadTransitionReport}
              openBudgetSetting={openBudgetSetting} setActiveTab={setActiveTab}
            />
          </div>
        )}
        {activeTab === 'projectList' && <div className="scrollable-view"><ProjectList /></div>}
        {activeTab === 'clientList' && <div className="scrollable-view"><ClientList /></div>}
      </main>
    </div>
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
        <Route path="/project-detail/:id" element={<ProjectDetail />} />
        <Route path="/history-log-registration/:id" element={<HistoryLogRegistration />} />
        <Route path="/LoadTransitionReport" element={<LoadTransitionReport />} />
        <Route path="/BudgetSetting" element={<BudgetSetting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
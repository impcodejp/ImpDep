// src/components/Menu.tsx
import React, { useState } from "react";

interface MenuProps {
  openClientRegistration: () => void;
  openClientEdit: () => void;
  openProjectRegistration: () => void;
  openLoadTransitionReport: () => void;
  openBudgetSetting: () => void;
  setActiveTab: (tab: 'dashboard' | 'menu' | 'clientList' | 'projectList') => void;
}

const Menu: React.FC<MenuProps> = ({
  openClientRegistration,
  openClientEdit,
  openProjectRegistration,
  openLoadTransitionReport,
  openBudgetSetting,
  setActiveTab
}) => {
  // 💡 修正：初期状態をすべて false (閉じている状態) に変更しました！
  const [openFolders, setOpenFolders] = useState({
    master: false,
    project: false,
    report: false,
  });

  const toggleFolder = (folderKey: keyof typeof openFolders) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  return (
    <div className="tree-menu">
      <h2>システムメニュー</h2>
      <ul className="tree-list">
        
        {/* === 1. 案件業務管理 === */}
        <li>
          <span 
            className="folder clickable-folder" 
            onClick={() => toggleFolder('project')}
          >
            {openFolders.project ? "📂" : "📁"} 案件業務管理
          </span>
          {openFolders.project && (
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
              <li>
                <span className="tree-item disabled">💰 売上・粗利集計 (準備中)</span>
              </li>
            </ul>
          )}
        </li>

        {/* === 2. 帳票出力業務 === */}
        <li>
          <span 
            className="folder clickable-folder" 
            onClick={() => toggleFolder('report')}
          >
            {openFolders.report ? "📂" : "📁"} 帳票出力業務
          </span>
          {openFolders.report && (
            <ul>
              <li>
                <button className="tree-item-button" onClick={openLoadTransitionReport}>
                  💎 請負負荷推移表
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* === 3. マスタ管理 === */}
        <li>
          <span 
            className="folder clickable-folder" 
            onClick={() => toggleFolder('master')}
          >
            {openFolders.master ? "📂" : "📁"} マスタ管理
          </span>
          {openFolders.master && (
            <ul>
              <li>
                <button className="tree-item-button" onClick={openClientRegistration}>
                  📄 取引先マスタ登録
                </button>
              </li>
              <li>
                <button className="tree-item-button" onClick={openClientEdit}>
                  📝 取引先マスタ更新
                </button>
              </li>
              <li>
                <button className="tree-item-button" onClick={openBudgetSetting}>
                  💰 予算登録
                </button>
              </li>
            </ul>
          )}
        </li>

      </ul>
    </div>
  );
};

export default Menu;
// src/components/Menu.tsx
import React from "react";

interface MenuProps {
  openClientRegistration: () => void;
  openClientEdit: () => void;
  openProjectRegistration: () => void;
  setActiveTab: (tab: 'dashboard' | 'menu' | 'clientList' | 'projectList') => void;
}

const Menu: React.FC<MenuProps> = ({
  openClientRegistration,
  openClientEdit,
  openProjectRegistration,
  setActiveTab
}) => {
  return (
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
            <li>
              <button className="tree-item-button" onClick={openClientEdit}>
                📝 取引先マスタ更新
              </button>
            </li>
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
            <li>
              <span className="tree-item disabled">💰 売上・粗利集計 (準備中)</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
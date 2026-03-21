import { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./HardwareInfoSection.css";

// --- 型定義 ---
export interface HardInfo {
  id: number;
  clientId: number;
  hardKbn: number;
  hostName: string | null;
  ip: string | null;
  introductionDate: string | null;
  otherText: string | null;
  status: number;
}

export interface HardUserInfo {
  id: number;
  uuid: string | null;
  pass: string | null;
}

type SortKey = "hardKbn" | "introductionDate" | "status";
type SortOrder = "asc" | "desc";

// ==========================================
// 🔑 閲覧用：アカウント情報表示モーダル
// ==========================================
interface UserInfoModalProps {
  userInfos: HardUserInfo[];
  onClose: () => void;
}
function UserInfoModal({ userInfos, onClose }: UserInfoModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>🔑 アカウント情報</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-body">
          {userInfos.length > 0 ? (
            userInfos.map((u, index) => (
              <div key={u.id} className="user-info-item">
                {userInfos.length > 1 && <div className="user-index">アカウント {index + 1}</div>}
                <div className="info-field">
                  <label>UID:</label>
                  <input type="text" readOnly value={u.uuid || ""} onClick={(e) => (e.target as HTMLInputElement).select()} />
                </div>
                <div className="info-field">
                  <label>PASS:</label>
                  <input type="text" readOnly value={u.pass || ""} onClick={(e) => (e.target as HTMLInputElement).select()} />
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">登録情報はありません。</p>
          )}
        </div>
        <footer className="modal-footer">
          <p className="help-text">※ 項目をクリックで全選択されます</p>
          <button className="native-btn primary" onClick={onClose}>閉じる</button>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// ➕ 登録用：機器追加モーダル
// ==========================================
interface AddHardwareModalProps {
  onClose: () => void;
  onSave: (hardwareData: any, usersData: any[]) => void;
}
function AddHardwareModal({ onClose, onSave }: AddHardwareModalProps) {
  const [hardData, setHardData] = useState({
    hardKbn: 1,
    introductionDate: "",
    status: 1,
    hostName: "",
    ip: "",
    otherText: ""
  });

  const [users, setUsers] = useState<{uuid: string, pass: string}[]>([]);

  const handleAddUser = () => {
    setUsers([...users, { uuid: "", pass: "" }]);
  };

  const handleUserChange = (index: number, field: "uuid" | "pass", value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const handleRemoveUser = (index: number) => {
    const newUsers = users.filter((_, i) => i !== index);
    setUsers(newUsers);
  };

  const handleSubmit = () => {
    const validUsers = users.filter(u => u.uuid.trim() !== "" || u.pass.trim() !== "");
    onSave(hardData, validUsers);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>➕ 機器情報の追加</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        
        <div className="modal-body form-body">
          <div className="form-section">
            <h4 className="form-section-title">基本情報</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>種別</label>
                <select 
                  className="native-input" 
                  value={hardData.hardKbn} 
                  onChange={(e) => setHardData({...hardData, hardKbn: Number(e.target.value)})}
                >
                  <option value={1}>サーバ</option>
                  <option value={2}>PC</option>
                  <option value={3}>NW機器</option>
                  <option value={99}>その他</option>
                </select>
              </div>
              <div className="form-group">
                <label>状態</label>
                <select 
                  className="native-input" 
                  value={hardData.status} 
                  onChange={(e) => setHardData({...hardData, status: Number(e.target.value)})}
                >
                  <option value={1}>稼働中</option>
                  <option value={2}>撤去済</option>
                </select>
              </div>
              <div className="form-group">
                <label>導入日</label>
                <input 
                  type="date" 
                  className="native-input" 
                  value={hardData.introductionDate} 
                  onChange={(e) => setHardData({...hardData, introductionDate: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>ホスト名</label>
                <input 
                  type="text" 
                  className="native-input" 
                  value={hardData.hostName} 
                  onChange={(e) => setHardData({...hardData, hostName: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>IPアドレス</label>
                <input 
                  type="text" 
                  className="native-input" 
                  value={hardData.ip} 
                  onChange={(e) => setHardData({...hardData, ip: e.target.value})} 
                  placeholder="例: 192.168.1.1"
                />
              </div>
            </div>
            <div className="form-group full-width" style={{ marginTop: "12px" }}>
              <label>備考</label>
              <textarea 
                className="native-input" 
                rows={2}
                value={hardData.otherText} 
                onChange={(e) => setHardData({...hardData, otherText: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">アカウント情報</h4>
            <div className="dynamic-user-list">
              {users.map((user, index) => (
                <div key={index} className="dynamic-user-row">
                  <div className="user-index-badge">ユーザー {index + 1}</div>
                  <div className="user-inputs">
                    <input 
                      type="text" 
                      className="native-input" 
                      placeholder="UID" 
                      value={user.uuid}
                      onChange={(e) => handleUserChange(index, "uuid", e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="native-input" 
                      placeholder="PASSWORD" 
                      value={user.pass}
                      onChange={(e) => handleUserChange(index, "pass", e.target.value)}
                    />
                  </div>
                  <button className="remove-user-btn" onClick={() => handleRemoveUser(index)}>✖</button>
                </div>
              ))}
              
              <button className="add-user-btn" onClick={handleAddUser}>
                ＋ ユーザー情報を追加
              </button>
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="native-btn secondary" onClick={onClose}>キャンセル</button>
          <button className="native-btn primary" onClick={handleSubmit}>登録する</button>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// 📦 メイン抽出コンポーネント (HardwareInfoSection)
// ==========================================
interface Props {
  clientId: number;
  hardList: HardInfo[];
  isLoading: boolean;
  onAddHardware?: () => void;
  onEditHardware?: (hardId: number) => void;
  onRefreshRequested?: () => void;
  // 💡 親から受け取るプロパティを追加しました
  isOpen: boolean;
  onToggle: () => void;
}

export default function HardwareInfoSection({ 
  clientId, 
  hardList, 
  isLoading, 
  onAddHardware, 
  onEditHardware, 
  onRefreshRequested,
  isOpen,   // 💡 追加
  onToggle  // 💡 追加
}: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({
    key: "introductionDate", order: "desc",
  });
  
  const [viewModalData, setViewModalData] = useState<HardUserInfo[] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sortedHardList = useMemo(() => {
    let items = [...hardList];
    items.sort((a, b) => {
      const valA = a[sortConfig.key] ?? "";
      const valB = b[sortConfig.key] ?? "";
      if (valA < valB) return sortConfig.order === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.order === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [hardList, sortConfig]);

  const handleShowUserInfo = async (hardId: number) => {
    const password = prompt("閲覧パスワードを入力してください");
    if (!password) return;
    try {
      const dataList = await invoke<HardUserInfo[]>("get_hard_user_info_secure", { hardId, inputPassword: password });
      setViewModalData(dataList); 
    } catch (error: any) {
      alert(error);
    }
  };

  const handleSaveHardware = async (hardwareData: any, usersData: any[]) => {
    try {
      await invoke("insert_hardware_info", {
        hardInfo: {
          clientId: clientId,
          hardKbn: hardwareData.hardKbn,
          hostName: hardwareData.hostName,
          ip: hardwareData.ip,
          introductionDate: hardwareData.introductionDate,
          otherText: hardwareData.otherText,
          status: hardwareData.status
        },
        userInfos: usersData
      });

      setIsAddModalOpen(false);
      if (onRefreshRequested) {
        onRefreshRequested();
      }
    } catch (error: any) {
      alert(`登録エラー: ${error}`);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig({
      key,
      order: sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc",
    });
  };

  const getHardKbnLabel = (kbn: number) => {
    switch (kbn) { case 1: return "サーバ"; case 2: return "PC"; case 3: return "NW機器"; default: return "その他"; }
  };

  return (
    <fieldset className="native-fieldset">
      {/* 💡 legendをクリック可能にして、開閉アイコンを追加しました */}
      <legend 
        onClick={onToggle} 
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {isOpen ? "▼" : "▶"} ハードウェア導入情報
      </legend>
      
      {/* 💡 isOpen が true のときだけ中身を表示します */}
      {isOpen && (
        <>
          <div className="hardware-action-bar">
            <button className="native-btn add-btn" onClick={() => {
              if (onAddHardware) onAddHardware();
              setIsAddModalOpen(true);
            }}>
              + 機器追加
            </button>
          </div>

          <div className="table-wrapper">
            <table className="native-table">
              <thead>
                <tr>
                  <th className="sortable-th col-intro-date" onClick={() => handleSort("introductionDate")}>
                    導入日 {sortConfig.key === "introductionDate" && (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="sortable-th col-status" onClick={() => handleSort("status")}>
                    状態 {sortConfig.key === "status" && (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="sortable-th col-hard-kbn" onClick={() => handleSort("hardKbn")}>
                    種別 {sortConfig.key === "hardKbn" && (sortConfig.order === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="col-host-name">ホスト名</th>
                  <th className="col-ip">IPアドレス</th>
                  <th className="col-actions-header">操作</th>
                </tr>
              </thead>
              {sortedHardList.map(hard => (
                <tbody key={hard.id} className="chart-row-group" onDoubleClick={() => onEditHardware?.(hard.id)}>
                  <tr className="main-info-row">
                    <td className="col-intro-date">{hard.introductionDate || "---"}</td>
                    <td className="col-status">
                      <span className={hard.status === 1 ? "status-active" : "status-retired"}>
                        {hard.status === 1 ? "稼働中" : "撤去済"}
                      </span>
                    </td>
                    <td className="col-hard-kbn">
                      <span className={`kbn-tag kbn-${hard.hardKbn}`}>{getHardKbnLabel(hard.hardKbn)}</span>
                    </td>
                    <td className="col-host-name">{hard.hostName || "---"}</td>
                    <td className="col-ip mono-text">{hard.ip || "---"}</td>
                    <td className="col-actions-cell">
                      <button 
                        className="native-btn secondary edit-btn" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onEditHardware?.(hard.id); 
                        }}
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                  <tr className="sub-info-row">
                    <td colSpan={6} className="other-text-cell">
                      <div className="other-text-wrapper">
                        <div className="other-text-content">
                          <span className="other-text-label">備考:</span> 
                          <span className="other-text-value">{hard.otherText || "---"}</span>
                        </div>
                        <button className="native-btn secondary small-btn" onClick={(e) => { e.stopPropagation(); handleShowUserInfo(hard.id); }}>
                          🔑 アカウント表示
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ))}
              {sortedHardList.length === 0 && !isLoading && (
                <tbody>
                  <tr><td colSpan={6} className="no-data-message">登録された情報がありません。</td></tr>
                </tbody>
              )}
            </table>
          </div>
        </>
      )}

      {/* 💡 モーダルは isOpen の判定外に置くことで、開閉時に影響が出ないようにしています */}
      {viewModalData && <UserInfoModal userInfos={viewModalData} onClose={() => setViewModalData(null)} />}
      {isAddModalOpen && <AddHardwareModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveHardware} />}
      
    </fieldset>
  );
}
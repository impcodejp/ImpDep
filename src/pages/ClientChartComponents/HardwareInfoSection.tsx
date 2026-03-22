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

interface Props {
  clientId: number;
  hardList: HardInfo[];
  isLoading: boolean;
  onRefreshRequested: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ==========================================
// 🔑 1. アカウント情報 表示モーダル
// ==========================================
function UserInfoModal({ userInfos, onClose }: { userInfos: HardUserInfo[]; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>🔑 登録アカウント一覧</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-body">
          {userInfos.length > 0 ? (
            <div className="account-view-list">
              {userInfos.map((u: HardUserInfo, i: number) => (
                <div key={u.id || i} className="account-view-card">
                  <div className="card-badge">アカウント {i + 1}</div>
                  <div className="info-field"><label>UID</label><input type="text" readOnly value={u.uuid || ""} onClick={(e) => (e.target as HTMLInputElement).select()} /></div>
                  <div className="info-field"><label>PASS</label><input type="text" readOnly value={u.pass || ""} onClick={(e) => (e.target as HTMLInputElement).select()} /></div>
                </div>
              ))}
            </div>
          ) : <p className="no-data-text">登録情報はありません。</p>}
        </div>
        <footer className="modal-footer"><button className="btn-primary" onClick={onClose}>閉じる</button></footer>
      </div>
    </div>
  );
}

// ==========================================
// 📝 2. 機器・アカウント 登録/編集モーダル（完全復元）
// ==========================================
function HardwareEditModal({ onClose, onSave, initialData }: { onClose: () => void, onSave: any, initialData?: HardInfo }) {
  const [hardData, setHardData] = useState({
    hardKbn: initialData?.hardKbn ?? 1,
    introductionDate: initialData?.introductionDate ?? "",
    status: initialData?.status ?? 1,
    hostName: initialData?.hostName ?? "",
    ip: initialData?.ip ?? "",
    otherText: initialData?.otherText ?? ""
  });
  const [newUsers, setNewUsers] = useState<{uuid: string, pass: string}[]>([]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{initialData ? "✏️ 機器情報の編集" : "➕ 新規機器の追加"}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-body">
          <div className="form-layout-grid">
            {/* 左カラム：基本属性 */}
            <div className="form-column">
              <h4 className="section-title">基本属性</h4>
              <div className="form-group"><label>機器種別</label><select value={hardData.hardKbn} onChange={e => setHardData({...hardData, hardKbn: Number(e.target.value)})}><option value={1}>サーバ</option><option value={2}>PC</option><option value={3}>NW機器</option><option value={99}>その他</option></select></div>
              <div className="form-group"><label>稼働状態</label><select value={hardData.status} onChange={e => setHardData({...hardData, status: Number(e.target.value)})}><option value={1}>稼働中</option><option value={2}>撤去済</option></select></div>
              <div className="form-group"><label>導入日</label><input type="date" value={hardData.introductionDate || ""} onChange={e => setHardData({...hardData, introductionDate: e.target.value})} /></div>
            </div>
            {/* 右カラム：接続情報 */}
            <div className="form-column">
              <h4 className="section-title">接続設定</h4>
              <div className="form-group"><label>ホスト名</label><input type="text" value={hardData.hostName || ""} onChange={e => setHardData({...hardData, hostName: e.target.value})} /></div>
              <div className="form-group"><label>IPアドレス</label><input type="text" value={hardData.ip || ""} onChange={e => setHardData({...hardData, ip: e.target.value})} /></div>
              
              {!initialData && (
                <div className="embedded-account-section">
                  <label className="field-label-sm">初期アカウント追加</label>
                  {newUsers.map((u, i) => (
                    <div key={i} className="mini-user-row">
                      <input type="text" placeholder="UID" value={u.uuid} onChange={e => { const n = [...newUsers]; n[i].uuid = e.target.value; setNewUsers(n); }} />
                      <input type="text" placeholder="PASS" value={u.pass} onChange={e => { const n = [...newUsers]; n[i].pass = e.target.value; setNewUsers(n); }} />
                      <button className="btn-icon-del" onClick={() => setNewUsers(newUsers.filter((_, idx) => idx !== i))}>×</button>
                    </div>
                  ))}
                  <button className="btn-add-inline" onClick={() => setNewUsers([...newUsers, {uuid: "", pass: ""}])}>+ 追加</button>
                </div>
              )}
            </div>
          </div>
          <div className="form-group full-width-group"><label>備考</label><textarea rows={2} value={hardData.otherText || ""} onChange={e => setHardData({...hardData, otherText: e.target.value})} /></div>
        </div>
        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button className="btn-primary" onClick={() => onSave({ ...hardData, id: initialData?.id }, newUsers)}>保存</button>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// 🔐 3. アカウント情報 編集専用モーダル
// ==========================================
function AccountEditModal({ hardId, initialUsers, password, onClose, onRefresh }: any) {
  const [users, setUsers] = useState(initialUsers.map((u: any) => ({ uuid: u.uuid || "", pass: u.pass || "" })));
  const handleSave = async () => {
    try {
      await invoke("update_hardware_accounts", { hardId, userInfos: users, inputPassword: password });
      onRefresh(); onClose();
    } catch (err) { alert(err); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header"><h3>🔐 アカウント情報の編集</h3></header>
        <div className="modal-body">
          <div className="account-edit-list">
            {users.map((u: any, i: number) => (
              <div key={i} className="edit-user-row">
                <input type="text" placeholder="UID" value={u.uuid} onChange={e => { const n = [...users]; n[i].uuid = e.target.value; setUsers(n); }} />
                <input type="text" placeholder="PASS" value={u.pass} onChange={e => { const n = [...users]; n[i].pass = e.target.value; setUsers(n); }} />
                <button className="btn-icon-del" onClick={() => setUsers(users.filter((_:any,idx:number) => idx !== i))}>×</button>
              </div>
            ))}
            <button className="btn-add-inline" onClick={() => setUsers([...users, {uuid:"", pass:""}])}>+ 追加</button>
          </div>
        </div>
        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button className="btn-primary" onClick={handleSave}>保存</button>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// 📦 メインコンポーネント
// ==========================================
export default function HardwareInfoSection({ clientId, hardList, isLoading, onRefreshRequested, isOpen, onToggle }: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: "introductionDate", order: "desc" });
  const [viewData, setViewData] = useState<HardUserInfo[] | null>(null);
  const [infoEdit, setInfoEdit] = useState<HardInfo | null>(null);
  const [accEdit, setAccEdit] = useState<{ hardId: number, users: HardUserInfo[], pass: string } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const sortedList = useMemo(() => {
    let items = [...hardList];
    items.sort((a, b) => {
      const valA = (a as any)[sortConfig.key] ?? "";
      const valB = (b as any)[sortConfig.key] ?? "";
      return sortConfig.order === "asc" ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
    return items;
  }, [hardList, sortConfig]);

  const handleHeaderClick = (key: SortKey) => {
    setSortConfig({ key, order: sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc" });
  };

  return (
    <fieldset className="hardware-section-fieldset">
      <legend onClick={onToggle} className="section-legend">
        <span className={`arrow ${isOpen ? "open" : ""}`}>▶</span> ハードウェア導入情報
      </legend>

      {isOpen && (
        <div className="section-content">
          <div className="action-row">
            <button className="btn-add-main" onClick={() => setIsAddOpen(true)}>+ 機器追加</button>
          </div>
          <div className="hardware-table-container">
            {isLoading && <div className="loading-bar">読み込み中...</div>}
            <table className="hardware-main-table">
              <thead>
                <tr>
                  <th className="w-date" onClick={() => handleHeaderClick("introductionDate")}>導入日</th>
                  <th className="w-status" onClick={() => handleHeaderClick("status")}>状態</th>
                  <th className="w-kbn" onClick={() => handleHeaderClick("hardKbn")}>種別</th>
                  <th className="w-host">ホスト名</th>
                  <th className="w-ip">IPアドレス</th>
                  <th className="w-btn-half">操作</th>
                  <th className="w-btn-half"></th>
                </tr>
              </thead>
              {sortedList.map(hard => (
                <tbody key={hard.id} className="hardware-row-group">
                  {/* 1行目: 1+1+1+1+1+2(編集) = 7列 */}
                  <tr className="main-row" onDoubleClick={() => setInfoEdit(hard)}>
                    <td className="w-date">{hard.introductionDate || "---"}</td>
                    <td className="w-status text-center"><span className={`badge-status ${hard.status === 1 ? "active" : "retired"}`}>{hard.status === 1 ? "稼働" : "撤去"}</span></td>
                    <td className="w-kbn">{hard.hardKbn===1?"サーバ":hard.hardKbn===2?"PC":hard.hardKbn===3?"NW機器":"他"}</td>
                    <td className="w-host">{hard.hostName}</td>
                    <td className="w-ip mono">{hard.ip}</td>
                    <td colSpan={2} className="btn-cell">
                      <button className="btn-table-sm" onClick={() => setInfoEdit(hard)}>編集</button>
                    </td>
                  </tr>
                  {/* 2行目: 4(備考)+1(ラベル)+1(表示)+1(編集) = 7列 */}
                  <tr className="sub-row">
                    <td colSpan={4} className="memo-cell">
                      <div className="memo-flex">
                        <span className="memo-label">備考</span>
                        <span className="memo-text">{hard.otherText || "---"}</span>
                      </div>
                    </td>
                    <td className="acc-label-cell">アカウント情報：</td>
                    <td className="btn-cell no-border">
                      <button className="btn-table-sm" onClick={async () => {
                        const p = prompt("閲覧パスワード");
                        if(p) invoke<HardUserInfo[]>("get_hard_user_info_secure",{hardId:hard.id,inputPassword:p}).then(setViewData).catch(alert);
                      }}>表示</button>
                    </td>
                    <td className="btn-cell no-border">
                      <button className="btn-table-sm" onClick={async () => {
                        const p = prompt("編集パスワード");
                        if(p) invoke<HardUserInfo[]>("get_hard_user_info_secure",{hardId:hard.id,inputPassword:p}).then(d=>setAccEdit({hardId:hard.id,users:d,pass:p})).catch(alert);
                      }}>編集</button>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}

      {viewData && <UserInfoModal userInfos={viewData} onClose={() => setViewData(null)} />}
      {accEdit && <AccountEditModal hardId={accEdit.hardId} initialUsers={accEdit.users} password={accEdit.pass} onClose={() => setAccEdit(null)} onRefresh={onRefreshRequested} />}
      {(infoEdit || isAddOpen) && <HardwareEditModal initialData={infoEdit || undefined} onClose={() => {setInfoEdit(null); setIsAddOpen(false);}} onSave={async (d:any,u:any[]) => {
          try {
            if(d.id) await invoke("update_hardware_basic_info",{hardInfo:{...d,clientId}});
            else await invoke("insert_hardware_info",{hardInfo:{...d,clientId},userInfos:u});
            setInfoEdit(null); setIsAddOpen(false); onRefreshRequested();
          } catch(err){alert(err);}
      }} />}
    </fieldset>
  );
}
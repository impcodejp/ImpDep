import { useState } from "react";
import "./ContactInfoSection.css"; // CSSをインポート

export interface ContactInfo {
  id: number;
  clientId: number;
  name: string;
  telNumber: string;
  eMail: string;
  bmnName: string;
}

interface ContactInfoSectionProps {
  clientId: number;
  contactList: ContactInfo[];
  isLoading: boolean;
  onRefreshRequested: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ==========================================
// 📝 担当者情報 登録/編集モーダル
// ==========================================
function ContactEditModal({ 
  onClose, 
  onSave, 
  initialData 
}: { 
  onClose: () => void, 
  onSave: (data: Partial<ContactInfo>) => void, 
  initialData?: ContactInfo 
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    bmnName: initialData?.bmnName ?? "",
    telNumber: initialData?.telNumber ?? "",
    eMail: initialData?.eMail ?? ""
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{initialData ? "✏️ 担当者情報の編集" : "➕ 新規担当者の追加"}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-body">
          <div className="form-group">
            <label>名前</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例: 山田 太郎" />
          </div>
          <div className="form-group">
            <label>所属</label>
            <input type="text" value={formData.bmnName} onChange={e => setFormData({...formData, bmnName: e.target.value})} placeholder="例: 営業部" />
          </div>
          <div className="form-group">
            <label>電話番号</label>
            <input type="text" value={formData.telNumber} onChange={e => setFormData({...formData, telNumber: e.target.value})} placeholder="例: 03-1234-5678" />
          </div>
          <div className="form-group">
            <label>メールアドレス</label>
            <input type="email" value={formData.eMail} onChange={e => setFormData({...formData, eMail: e.target.value})} placeholder="例: taro@example.com" />
          </div>
        </div>
        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button className="btn-primary" onClick={() => onSave({ ...formData, id: initialData?.id })}>保存</button>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// 📦 メインコンポーネント
// ==========================================
export default function ContactInfoSection({ 
  clientId, 
  contactList, 
  isLoading, 
  onRefreshRequested,
  isOpen,
  onToggle
}: ContactInfoSectionProps) {

  // 💡 モーダルの開閉状態を管理するState
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<ContactInfo | null>(null);

  // 💡 保存ボタンが押された時の処理
  const handleSave = async (data: Partial<ContactInfo>) => {
    // ここで Tauriの invoke などを呼んでバックエンドに保存します
    console.log("保存するデータ:", { ...data, clientId });
    // await invoke("upsert_contact_info", { info: { ...data, clientId } });
    
    alert("保存処理を呼び出しました（Consoleを確認してください）");
    
    setIsAddOpen(false);
    setEditData(null);
    onRefreshRequested(); // 再読み込みして一覧を更新
  };

  return (
    <fieldset className="native-fieldset contact-info-form" data-client-id={clientId}>
      <legend onClick={onToggle} style={{ cursor: "pointer", userSelect: "none" }}>
        {isOpen ? "▼" : "▶"} 担当者情報
      </legend>
      
      {isOpen && (
        <div className="section-content">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            <button 
              className="native-btn primary" 
              onClick={() => setIsAddOpen(true)}
            >
              ➕ 担当者追加
            </button>
          </div>

          <div className="contact-table-container">
            {isLoading && <div className="loading-bar">読み込み中...</div>}
            
            {!isLoading && contactList.length === 0 ? (
              <p className="no-data-text" style={{ textAlign: "center", padding: "20px" }}>
                担当者情報は登録されていません。
              </p>
            ) : (
              <table className="contact-main-table">
                <thead>
                  <tr>
                    <th className="w-name">名前</th>
                    <th className="w-tel">電話番号</th>
                    <th className="w-email">メールアドレス</th>
                    <th className="w-bmn">所属</th>
                    <th className="w-btn">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {contactList.map(contact => (
                    // 💡 行をダブルクリックしても編集画面が開くようにしました
                    <tr key={contact.id} className="main-row" onDoubleClick={() => setEditData(contact)}>
                      <td className="w-name">{contact.name}</td>
                      <td className="w-tel mono">{contact.telNumber}</td>
                      <td className="w-email mono">{contact.eMail}</td>
                      <td className="w-bmn">{contact.bmnName}</td>
                      <td className="btn-cell">
                        <button className="btn-table-sm" onClick={() => setEditData(contact)}>編集</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 💡 モーダルの表示判定 */}
      {(isAddOpen || editData) && (
        <ContactEditModal 
          initialData={editData || undefined}
          onClose={() => {
            setIsAddOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
        />
      )}
    </fieldset>
  );
}
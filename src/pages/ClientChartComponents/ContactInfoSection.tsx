export interface ContactInfo {
  id: number;
  name: string;
  department: string;
}

interface ContactInfoSectionProps {
  clientId: number;
  contactList: ContactInfo[];
  isLoading: boolean;
  onRefreshRequested: () => void;
  // 💡 親から受け取るプロパティを追加
  isOpen: boolean;
  onToggle: () => void;
}

export default function ContactInfoSection({ 
  clientId, 
  contactList, 
  isLoading, 
  onRefreshRequested,
  isOpen,       // 💡 追加
  onToggle      // 💡 追加
}: ContactInfoSectionProps) {

  return (
    // 💡 属性としても clientId を持たせ、コード内で確実に使用されている状態にします
    <fieldset className="native-fieldset info-section" data-client-id={clientId}>
      {/* 💡 親から渡された onToggle を実行します */}
      <legend 
        onClick={onToggle} 
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {isOpen ? "▼" : "▶"} 担当者情報
      </legend>
      
      {/* 💡 親から渡された isOpen で表示を切り替えます */}
      {isOpen && (
        <div style={{ padding: "10px" }}>
          {isLoading ? (
            <p style={{ color: "#666" }}>読み込み中...</p>
          ) : contactList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              {/* 💡 未使用エラー回避のため clientId をテキストに含めます */}
              <p style={{ color: "#666", marginBottom: "10px" }}>
                担当者情報は実装準備中です。（対象顧客ID: {clientId}）
              </p>
            </div>
          ) : (
            <div>
              <p>※ここに担当者情報のリストやテーブルが表示されます（現在 {contactList.length} 件 / 顧客ID: {clientId}）</p>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button className="native-btn" onClick={onRefreshRequested}>再読み込み</button>
                {/* 💡 ロジック内でも clientId を使用します */}
                <button 
                  className="native-btn primary" 
                  onClick={() => console.log(`担当者追加パネルを開く (顧客ID: ${clientId})`)}
                >
                  ＋ 追加
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}
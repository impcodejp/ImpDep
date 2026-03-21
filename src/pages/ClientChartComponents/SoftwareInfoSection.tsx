
export interface SoftwareInfo {
  id: number;
  softwareName: string;
  version: string;
}

interface SoftwareInfoSectionProps {
  clientId: number;
  softwareList: SoftwareInfo[];
  isLoading: boolean;
  onRefreshRequested: () => void;
  // 💡 親から受け取るプロパティを追加
  isOpen: boolean;
  onToggle: () => void;
}

export default function SoftwareInfoSection({ 
  clientId, 
  softwareList, 
  isLoading, 
  onRefreshRequested,
  isOpen,       // 💡 追加
  onToggle      // 💡 追加
}: SoftwareInfoSectionProps) {

  return (
    // 💡 念のため属性(data属性)としても clientId を持たせておきます
    <fieldset className="native-fieldset info-section" data-client-id={clientId}>
      {/* 💡 親から渡された onToggle を実行します */}
      <legend 
        onClick={onToggle} 
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {isOpen ? "▼" : "▶"} ソフト運用情報
      </legend>
      
      {/* 💡 親から渡された isOpen で表示を切り替えます */}
      {isOpen && (
        <div style={{ padding: "10px" }}>
          {isLoading ? (
            <p style={{ color: "#666" }}>読み込み中...</p>
          ) : softwareList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              {/* 💡 テキストの中に clientId を表示してエラーを回避します */}
              <p style={{ color: "#666", marginBottom: "10px" }}>
                ソフト運用情報は実装準備中です。（対象顧客ID: {clientId}）
              </p>
            </div>
          ) : (
            <div>
              <p>※ここにソフト運用情報のリストやテーブルが表示されます（現在 {softwareList.length} 件 / 顧客ID: {clientId}）</p>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                <button className="native-btn" onClick={onRefreshRequested}>再読み込み</button>
                {/* 💡 追加ボタンのコンソールログにも clientId を使います */}
                <button 
                  className="native-btn primary" 
                  onClick={() => console.log(`ソフト運用情報追加パネルを開く (顧客ID: ${clientId})`)}
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
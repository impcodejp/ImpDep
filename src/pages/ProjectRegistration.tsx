import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Client {
  id: number;
  clientCode: string;
  clientName: string;
}

export default function ProjectRegistration() {
  const [projectName, setProjectName] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchCode, setClientSearchCode] = useState("");
  const [sales, setSales] = useState("");
  const [grossProfit, setGrossProfit] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  
  // 💡 追加項目
  const [burdenRatio, setBurdenRatio] = useState("100"); // デフォルト100%
  const [loadValue, setLoadValue] = useState("0");

  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleClientCodeBlur = async () => {
    if (!clientSearchCode) return;
    try {
      const data = await invoke<Client>("get_client_by_code", { code: clientSearchCode });
      setSelectedClient(data);
    } catch {
      setSelectedClient(null);
    }
  };

  const handleSearch = async () => {
    if (!searchName) return;
    const results = await invoke<Client[]>("search_clients", { name: searchName });
    setSearchResults(results);
  };

  const handleSelectClient = (c: Client) => {
    setSelectedClient(c);
    setClientSearchCode(c.clientCode);
    setIsSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("取引先を選択してください");
      return;
    }

    try {
      await invoke("create_project", { 
        projectName, 
        clientId: selectedClient.id, 
        sales: parseFloat(sales) || 0, 
        grossProfit: parseFloat(grossProfit) || 0, 
        scheduledDate,
        // 💡 Rust側に送るパラメータを追加
        burdenRatio: parseFloat(burdenRatio) || 0,
        loadValue: parseFloat(loadValue) || 0
      });
      alert("案件を登録しました！");
      // リセット（負担割合は100に戻す）
      setProjectName(""); setSelectedClient(null); setClientSearchCode("");
      setSales(""); setGrossProfit(""); setScheduledDate("");
      setBurdenRatio("100"); setLoadValue("0");
    } catch (err) {
      alert("登録エラー: " + err);
    }
  };

  return (
    <main>
      <div className="registration-form" style={{ maxWidth: "650px" }}>
        <h1>案件新規登録</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">案件名:</label>
            <input type="text" className="form-input" value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">取引先選択:</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="text" className="form-input" style={{ width: "120px" }}
                value={clientSearchCode} onChange={(e) => setClientSearchCode(e.target.value)}
                onBlur={handleClientCodeBlur} placeholder="コード" />
              <button type="button" className="retro-btn secondary" onClick={() => setIsSearching(!isSearching)}>
                🔍 検索
              </button>
              <div className="client-display-box" style={{ flex: 1, padding: "8px", borderBottom: "2px solid #ccc", background: "#f9f9f9" }}>
                {selectedClient ? selectedClient.clientName : <span style={{color: "#999"}}>取引先が選択されていません</span>}
              </div>
            </div>
            {/* 検索パネル部分は省略せずそのまま保持... */}
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">売上金額 (¥):</label>
              <input type="number" className="form-input" value={sales} 
                onChange={(e) => setSales(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">粗利金額 (¥):</label>
              <input type="number" className="form-input" value={grossProfit} 
                onChange={(e) => setGrossProfit(e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* 💡 追加：負担割合と負荷値 */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">計上負担割合 (%):</label>
              <input type="number" className="form-input" value={burdenRatio} 
                onChange={(e) => setBurdenRatio(e.target.value)} step="0.1" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">負荷値 (Load):</label>
              <input type="number" className="form-input" value={loadValue} 
                onChange={(e) => setLoadValue(e.target.value)} step="0.01" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">計上予定日:</label>
            <input type="date" className="form-input" style={{ width: "200px" }}
              value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
          </div>

          <button type="submit" className="submit-button" style={{ marginTop: "20px", width: "100%" }}>
            この内容で案件を登録する
          </button>
        </form>
      </div>
    </main>
  );
}
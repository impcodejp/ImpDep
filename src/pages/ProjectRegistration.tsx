import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Client {
  id: number;
  clientCode: string;
  clientName: string;
}

const RootTypeOptions = [
  { value: "A", label: "追加" },
  { value: "N", label: "新規" },
  // 必要に応じて他のルートタイプも追加
];

export default function ProjectRegistration() {
  const [projectName, setProjectName] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchCode, setClientSearchCode] = useState("");
  const [sales, setSales] = useState("");
  const [grossProfit, setGrossProfit] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  
  // 💡 追加項目
  const [burdenRatio, setBurdenRatio] = useState("100");
  const [loadValue, setLoadValue] = useState("0");
  const [assignedDate, setAssignedDate] = useState(""); // 💡 割振日のステートを追加

  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [rootType, setRootType] = useState("N"); // 💡 ルートタイプのステートを追加

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
        // 💡 Rust側に送るパラメータ
        burdenRatio: parseFloat(burdenRatio) || 0,
        loadValue: parseFloat(loadValue) || 0,
        assignedDate: assignedDate || null,
        rootType: rootType || "N", 
      });
      alert("案件を登録しました！");
      
      // リセット
      setProjectName(""); setSelectedClient(null); setClientSearchCode("");
      setSales(""); setGrossProfit(""); setScheduledDate("");
      setBurdenRatio("100"); setLoadValue("0"); setAssignedDate("");
    } catch (err) {
      alert("登録エラー: " + err);
    }
  };

  return (
    <main>
      <div className="registration-form" style={{ maxWidth: "650px", padding: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>案件新規登録</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">案件名:</label>
            <input type="text" className="form-input" value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">取引先選択:</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input type="text" className="form-input" style={{ width: "100px" }}
                value={clientSearchCode} onChange={(e) => setClientSearchCode(e.target.value)}
                onBlur={handleClientCodeBlur} placeholder="コード" />
              <button type="button" className="retro-btn secondary" style={{ padding: "0.5rem" }} onClick={() => setIsSearching(!isSearching)}>
                🔍 検索
              </button>
              <div className="client-display-box" style={{ flex: 1, padding: "8px", borderBottom: "2px solid #ccc", background: "#f9f9f9", fontSize: "0.9rem" }}>
                {selectedClient ? selectedClient.clientName : <span style={{color: "#999"}}>未選択</span>}
              </div>
            </div>
            {/* 検索パネル部分は必要に応じて表示 */}
          </div>

          <div style={{ display: "flex", gap: "20px"}}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">ルートタイプ:</label>
              <select className="form-input" value={rootType} onChange={(e) => setRootType(e.target.value)}>
                {RootTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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

          {/* 💡 割振日と計上予定日を横並びに配置 */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">割振日:</label>
              <input type="date" className="form-input" 
                value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">計上予定日:</label>
              <input type="date" className="form-input" 
                value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="submit-button" style={{ marginTop: "10px", padding: "0.8rem" }}>
            この内容で案件を登録する
          </button>
        </form>
      </div>
    </main>
  );
}
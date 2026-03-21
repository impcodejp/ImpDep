import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import HardwareInfoSection, { HardInfo } from "./ClientChartComponents/HardwareInfoSection";
import ContactInfoSection, { ContactInfo } from "./ClientChartComponents/ContactInfoSection";
import SoftwareInfoSection, { SoftwareInfo } from "./ClientChartComponents/SoftwareInfoSection";
import "./ClientChart.css";

interface Client { 
  id: number; 
  clientCode: number; 
  clientName: string; 
}

export default function ClientChart() {
  const [inputCode, setInputCode] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  
  const [hardList, setHardList] = useState<HardInfo[]>([]);
  const [contactList, setContactList] = useState<ContactInfo[]>([]);
  const [softwareList, setSoftwareList] = useState<SoftwareInfo[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  // 💡 各セクションの開閉状態を管理（初期値はすべて true = 開いた状態）
  const [isHardOpen, setIsHardOpen] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [isSoftwareOpen, setIsSoftwareOpen] = useState(true);

  const loadClientChart = async (targetCode?: number) => {
    const code = targetCode ?? Number(inputCode);
    if (!code) return;

    setIsLoading(true);
    setErrorMessage(null);

    if (client?.clientCode !== code) {
      setHardList([]);
      setContactList([]);
      setSoftwareList([]);
    }

    try {
      const clientData = await invoke<Client>("get_client_by_code", { code });
      setClient(clientData);
      
      const hards = await invoke<HardInfo[]>("get_hard_info_by_client_id", { clientId: clientData.id })
        .catch(() => []); 
      setHardList(hards);
      
      const contacts = await invoke<ContactInfo[]>("get_contact_info_by_client_id", { clientId: clientData.id })
        .catch(() => []);
      setContactList(contacts);

      const softwares = await invoke<SoftwareInfo[]>("get_software_info_by_client_id", { clientId: clientData.id })
        .catch(() => []);
      setSoftwareList(softwares);
      
      setIsSearching(false);
    } catch (error) {
      setErrorMessage("指定された取引先コードが見つかりません。");
      setClient(null);
      setHardList([]);
      setContactList([]);
      setSoftwareList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setErrorMessage(null);
    try {
      const results = await invoke<Client[]>("search_clients", { name: searchName });
      setSearchResults(results);
    } catch (error) {
      setErrorMessage("検索エラーが発生しました。");
    }
  };

  const toggleSearchPanel = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchName("");
      setSearchResults([]);
    } else {
      setIsSearching(true);
    }
  };

  return (
    <div className="native-window-container">
      <header className="native-window-header"><h1>顧客カルテ</h1></header>
      <div className="native-window-content">
        
        {/* 検索セクション */}
        <fieldset className="native-fieldset search-section">
          <legend>対象顧客の指定</legend>
          <div className="search-inputs-row">
            <div className="input-group">
              <label className="form-label" style={{ fontSize: "0.8rem", marginBottom: "2px" }}>取引先コード</label>
              <input 
                type="number" 
                className="native-input" 
                value={inputCode} 
                onChange={(e) => setInputCode(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && loadClientChart()}
                placeholder="顧客CD" 
                disabled={isLoading}
              />
            </div>
            <button className="native-btn primary" onClick={() => loadClientChart()} disabled={isLoading}>
              {isLoading ? "読込中..." : "表示"}
            </button>
            <button className="native-btn secondary" onClick={toggleSearchPanel} disabled={isLoading}>
              {isSearching ? "閉じる" : "名称検索"}
            </button>
          </div>

          {isSearching && (
            <div className="search-panel-inline">
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input 
                  type="text" 
                  className="native-input flex-1" 
                  value={searchName} 
                  onChange={(e) => setSearchName(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="名称の一部を入力" 
                  autoFocus
                />
                <button className="native-btn" onClick={handleSearch}>検索</button>
              </div>
              <ul className="search-results-list">
                {searchResults.map(c => (
                  <li key={c.id} onClick={() => { setInputCode(String(c.clientCode)); loadClientChart(c.clientCode); }}>
                    <strong>[{c.clientCode}]</strong> {c.clientName}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {errorMessage && <div className="search-error-message">⚠️ {errorMessage}</div>}
        </fieldset>

        {/* メインカルテ部分 */}
        {client && (
          <div className="chart-main-content">
            <div className="client-info-banner">
              <h2>{client.clientName} 様 <small>(CD: {client.clientCode})</small></h2>
            </div>

            {/* 💡 各コンポーネントに isOpen と onToggle を渡します */}

            <SoftwareInfoSection 
              clientId={client.id}
              softwareList={softwareList} 
              isLoading={isLoading} 
              onRefreshRequested={() => loadClientChart(client.clientCode)}
              isOpen={isSoftwareOpen}
              onToggle={() => setIsSoftwareOpen(!isSoftwareOpen)}
            />

            <HardwareInfoSection 
              clientId={client.id}
              hardList={hardList} 
              isLoading={isLoading} 
              onRefreshRequested={() => loadClientChart(client.clientCode)}
              isOpen={isHardOpen}
              onToggle={() => setIsHardOpen(!isHardOpen)}
            />

            <ContactInfoSection 
              clientId={client.id}
              contactList={contactList} 
              isLoading={isLoading} 
              onRefreshRequested={() => loadClientChart(client.clientCode)}
              isOpen={isContactOpen}
              onToggle={() => setIsContactOpen(!isContactOpen)}
            />
            
          </div>
        )}
      </div>
    </div>
  );
}
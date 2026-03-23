import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import HardwareInfoSection, { HardInfo } from "./ClientChartComponents/HardwareInfoSection";
import ContactInfoSection, { ContactInfo } from "./ClientChartComponents/ContactInfoSection";
import SoftwareInfoSection, { SoftwareInfo } from "./ClientChartComponents/SoftwareInfoSection";
import "./ClientChart.css";

// 💡 修正：システム利用状況の項目を追加
interface Client { 
  id: number; 
  clientCode: number; 
  clientName: string; 
  usegali: boolean;
  useml: boolean;
  usexro: boolean;
  otherSystem: string | null;
}

export default function ClientChart() {
  const [inputCode, setInputCode] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  
  const [hardList, setHardList] = useState<HardInfo[]>([]);
  const [contactList, setContactList] = useState<ContactInfo[]>([]);
  const [softwareInfo, setSoftwareInfo] = useState<SoftwareInfo | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  // 💡 各セクションの開閉状態を管理
  const [isHardOpen, setIsHardOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSoftwareOpen, setIsSoftwareOpen] = useState(false);

  const loadClientChart = async (targetCode?: number) => {
    const code = targetCode ?? Number(inputCode);
    if (!code) return;

    setIsLoading(true);
    setErrorMessage(null);

    if (client?.clientCode !== code) {
      setHardList([]);
      setContactList([]);
      setSoftwareInfo(null); // 💡 修正
    }

    try {
      const clientData = await invoke<Client>("get_client_by_code", { code });
      setClient(clientData);
      
      const hards = await invoke<HardInfo[]>("get_hard_info_by_client_id", { clientId: clientData.id })
        .catch(() => []); 
      setHardList(hards);
      
      // const contacts = await invoke<ContactInfo[]>("get_contact_info_by_client_id", { clientId: clientData.id })
      //   .catch(() => []);

      const contacts: ContactInfo[] = [
        {
          id: 1,
          clientId: 101,
          name: "山田 太郎",
          telNumber: "03-1234-5678",
          eMail: "taro.yamada@example.com",
          bmnName: "営業部"
        },
        {
          id: 2,
          clientId: 101,
          name: "佐藤 花子",
          telNumber: "090-9876-5432",
          eMail: "hanako.sato@example.com",
          bmnName: "人事部"
        },
        {
          id: 3,
          clientId: 102,
          name: "鈴木 一郎",
          telNumber: "06-1111-2222",
          eMail: "ichiro.suzuki@example.jp",
          bmnName: "システム開発部"
        },
        {
          id: 4,
          clientId: 103,
          name: "高橋 美咲",
          telNumber: "080-3333-4444",
          eMail: "misaki.takahashi@example.co.jp",
          bmnName: "マーケティング部"
        },
        {
          id: 5,
          clientId: 104,
          name: "伊藤 健",
          telNumber: "052-555-6666",
          eMail: "ken.ito@example.com",
          bmnName: "総務部"
        }
      ];

      setContactList(contacts);

      // 💡 修正：配列ではなく単一のデータとして取得する
      const softInfo = await invoke<SoftwareInfo | null>("get_software_info_by_client_id", { clientId: clientData.id })
        .catch(() => null);
      setSoftwareInfo(softInfo);
      
      setIsSearching(false);
    } catch (error) {
      setErrorMessage("指定された取引先コードが見つかりません。");
      setClient(null);
      setHardList([]);
      setContactList([]);
      setSoftwareInfo(null); // 💡 修正
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
              
              {/* 💡 ここに「利用システム」という見出しを追加します */}
              <h3>利用システム</h3> 

              {/* バッジの部分は、h3 の下に置きます */}
              <div className="sys-badges">
                {client.usegali && <span className="sys-badge badge-gali">Galileopt</span>}
                {client.useml && <span className="sys-badge badge-ml">MJSLINK</span>}
                {client.usexro && <span className="sys-badge badge-xro">Xronos</span>}
                {client.otherSystem && <span className="sys-badge badge-other">{client.otherSystem}</span>}
              </div>
            </div>

            {/* 💡 修正：softwareList を softwareInfo に変更 */}
            <SoftwareInfoSection 
              clientId={client.id}
              softwareInfo={softwareInfo} 
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
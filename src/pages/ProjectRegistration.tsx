import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ProjectRegistration.css";

interface Client { id: number; clientCode: number; clientName: string; }
interface ProjectFormData {
  projectName: string; sales: string; grossProfit: string;
  scheduledDate: string; burdenRatio: string; loadValue: string;
  assignedDate: string; rootType: string;
}

const ROOT_TYPE_OPTIONS = [{ value: "N", label: "新規" }, { value: "A", label: "追加" }];
const INITIAL_FORM_STATE: ProjectFormData = {
  projectName: "", sales: "", grossProfit: "", scheduledDate: "",
  burdenRatio: "100", loadValue: "0", assignedDate: "", rootType: "N",
};

export default function ProjectRegistration() {
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_STATE);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchCode, setClientSearchCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  const focusNextElement = (currentElement: HTMLElement) => {
    const form = currentElement.closest("form");
    if (!form) return;
    const elements = Array.from(form.elements) as HTMLElement[];
    const index = elements.indexOf(currentElement);
    if (index > -1 && index < elements.length - 1) elements[index + 1].focus();
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON") return;
      e.preventDefault();
      focusNextElement(target);
    }
  }, []);

  const handleLoadClient = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (!clientSearchCode) return;
    try {
      // 💡 修正箇所：clientSearchCode を Number() で数値に変換して送信
      const data = await invoke<Client>("get_client_by_code", { code: Number(clientSearchCode) });
      setSelectedClient(data);
      setIsSearching(false);
      if (e?.target) focusNextElement(e.target as HTMLElement);
    } catch (err) {
      alert("該当取引先なし");
      setSelectedClient(null);
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    try {
      const results = await invoke<Client[]>("search_clients", { name: searchName });
      setSearchResults(results);
    } catch (err) { setSearchResults([]); }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleSearch(); }
  };

  const handleSelectSearchResult = (client: Client) => {
    setSelectedClient(client);
    setClientSearchCode(String(client.clientCode));
    setIsSearching(false);
    setSearchName("");
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return alert("取引先を選択してください");
    try {
      await invoke("create_project", {
        projectName: formData.projectName, clientId: selectedClient.id,
        sales: formData.sales || "0", grossProfit: formData.grossProfit || "0",
        scheduledDate: formData.scheduledDate, burdenRatio: parseFloat(formData.burdenRatio) || 0,
        loadValue: parseFloat(formData.loadValue) || 0, assignedDate: formData.assignedDate || null,
        rootType: formData.rootType,
      });
      alert("案件を登録しました。");
      setFormData(INITIAL_FORM_STATE);
      setSelectedClient(null);
      setClientSearchCode("");
    } catch (err) { alert(`登録エラー: ${err}`); }
  };

  return (
    <div className="native-window-container">
      <header className="native-window-header">
        <h1>案件新規登録</h1>
      </header>

      <div className="native-window-content">
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="native-form-body wide">
          
          <div className="form-group">
            <label className="form-label">案件名</label>
            <input name="projectName" type="text" className="native-input" value={formData.projectName} onChange={handleInputChange} required autoFocus />
          </div>

          <fieldset className="native-fieldset search-section">
            <legend>取引先の指定</legend>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
              <input type="text" className="native-input flex-1" style={{ marginBottom: 0 }} value={clientSearchCode} onChange={(e) => setClientSearchCode(e.target.value)} placeholder="コード" />
              <button type="button" className="native-btn primary" onClick={(e) => handleLoadClient(e)}>読込</button>
              <button type="button" className="native-btn secondary" onClick={() => setIsSearching(!isSearching)}>{isSearching ? "検索を閉じる" : "名称で検索"}</button>
              <div className="client-name-display" style={{ marginLeft: "auto", paddingLeft: "8px" }}>
                {selectedClient ? <span className="selected-text">対象: {selectedClient.clientName}</span> : <span className="placeholder-text">未選択</span>}
              </div>
            </div>

            {isSearching && (
              <div className="search-panel" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
                  <input type="text" className="native-input flex-1" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="取引先名" onKeyDown={handleSearchKeyDown} />
                  <button type="button" className="native-btn primary" onClick={handleSearch}>検索</button>
                </div>
                {searchResults.length > 0 && (
                  <ul className="native-list-box">
                    {searchResults.map((c) => (
                      <li key={c.id} className="list-box-item" onClick={() => handleSelectSearchResult(c)}>
                        <span className="result-code">[{c.clientCode}]</span> {c.clientName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </fieldset>

          <fieldset className="native-fieldset">
            <legend>案件詳細</legend>
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">ルートタイプ</label>
                <select name="rootType" className="native-input" value={formData.rootType} onChange={handleInputChange}>
                  {ROOT_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div className="form-group flex-1">
                <label className="form-label">売上金額 (¥)</label>
                <input name="sales" type="number" className="native-input" value={formData.sales} onChange={handleInputChange} placeholder="0" />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">粗利金額 (¥)</label>
                <input name="grossProfit" type="number" className="native-input" value={formData.grossProfit} onChange={handleInputChange} placeholder="0" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">計上負担割合 (%)</label>
                <input name="burdenRatio" type="number" className="native-input" value={formData.burdenRatio} onChange={handleInputChange} step="0.1" />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">負荷値 (Load Score)</label>
                <input name="loadValue" type="number" className="native-input" value={formData.loadValue} onChange={handleInputChange} step="0.01" />
              </div>
              <div className="form-group flex-1"></div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">割振日</label>
                <input name="assignedDate" type="date" className="native-input" value={formData.assignedDate} onChange={handleInputChange} />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">計上予定日</label>
                <input name="scheduledDate" type="date" className="native-input" value={formData.scheduledDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group flex-1"></div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="native-btn primary-save">登録する</button>
          </div>
        </form>
      </div>
    </div>
  );
}
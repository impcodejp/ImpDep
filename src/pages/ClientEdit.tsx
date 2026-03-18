import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./ClientEdit.css";

interface Client {
  id: number;
  clientCode: string;
  clientName: string;
  usegali: boolean;
  useml: boolean;
  usexro: boolean;
}

export default function ClientEditForm() {
  const [inputCode, setInputCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState<Client | null>(null);

  const fetchClientData = async (targetCode: string) => {
    try {
      const data = await invoke<Client>("get_client_by_code", { code: targetCode });
      setFormData(data);
      setSearchResults([]);
      setIsSearching(false);
      setInputCode(targetCode); 
    } catch (error) {
      alert("指定された取引先コードが見つかりませんでした");
      setFormData(null);
    }
  };

  const handleLoadClient = () => { if (inputCode) fetchClientData(inputCode); };

  useEffect(() => {
    const unlisten = listen<{ code: string }>("load_client_for_edit", (event) => {
      if (event.payload && event.payload.code) fetchClientData(event.payload.code);
    });
    return () => { unlisten.then((f) => f()); };
  }, []);

  const handleSearch = async () => {
    if (!searchName) return;
    try {
      const results = await invoke<Client[]>("search_clients", { name: searchName });
      setSearchResults(results);
      if (results.length === 0) alert("一致する取引先がありません");
    } catch (error) {
      alert(error);
    }
  };

  const handleSelectSearchResult = (client: Client) => {
    setInputCode(client.clientCode);
    setFormData(client);
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: type === "checkbox" ? checked : value } : prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await invoke("update_client", { payload: formData });
      alert("取引先の情報を更新しました。");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="native-window-container">
      <header className="native-window-header">
        <h1>取引先マスタ更新</h1>
      </header>

      <div className="native-window-content">
        <div className="native-form-body">
          <fieldset className="native-fieldset search-section">
            <legend>対象取引先の指定</legend>
            <div className="search-inputs">
              <label className="form-label" style={{ marginBottom: "4px" }}>取引先コード</label>
              {/* 💡 修正：固定幅をなくし flex-1 で広げる */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
                <input
                  type="text"
                  className="native-input flex-1"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
                <button className="native-btn primary" onClick={handleLoadClient}>読込</button>
                <button className="native-btn secondary" onClick={() => setIsSearching(!isSearching)}>
                  {isSearching ? "検索を閉じる" : "名称で検索"}
                </button>
              </div>
            </div>

            {isSearching && (
              <div className="search-panel">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "1rem" }}>
                  <input
                    type="text"
                    className="native-input flex-1"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="取引先名の一部"
                  />
                  <button className="native-btn primary" onClick={handleSearch}>検索</button>
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

          {formData && (
            <form onSubmit={handleSubmit} className="edit-form-wrapper">
              <fieldset className="native-fieldset">
                <legend>情報の編集</legend>
                
                <div className="form-group">
                  <label className="form-label">取引先コード (読取専用)</label>
                  <input
                    type="text"
                    name="clientCode"
                    className="native-input readonly-input"
                    value={formData.clientCode}
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">取引先名</label>
                  <input
                    type="text"
                    name="clientName"
                    className="native-input"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="native-checkbox-area" style={{ marginTop: "1rem" }}>
                  <label className="form-label">利用システム</label>
                  <div className="checkbox-group-modern">
                    <input type="checkbox" id="edit-usegali" name="usegali" className="checkbox-input" checked={formData.usegali} onChange={handleChange} />
                    <label htmlFor="edit-usegali" className="checkbox-label">Galileopt</label>
                  </div>
                  <div className="checkbox-group-modern">
                    <input type="checkbox" id="edit-useml" name="useml" className="checkbox-input" checked={formData.useml} onChange={handleChange} />
                    <label htmlFor="edit-useml" className="checkbox-label">MJSLINK</label>
                  </div>
                  <div className="checkbox-group-modern">
                    <input type="checkbox" id="edit-usexro" name="usexro" className="checkbox-input" checked={formData.usexro} onChange={handleChange} />
                    <label htmlFor="edit-usexro" className="checkbox-label">Xronos</label>
                  </div>
                </div>
              </fieldset>
              
              <div className="form-actions">
                <button type="submit" className="native-btn primary-save">更新を保存する</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ProjectRegistration.css";

// 型定義
interface Client {
  id: number;
  clientCode: string;
  clientName: string;
}

interface ProjectFormData {
  projectName: string;
  sales: string;
  grossProfit: string;
  scheduledDate: string;
  burdenRatio: string;
  loadValue: string;
  assignedDate: string;
  rootType: string;
}

const ROOT_TYPE_OPTIONS = [
  { value: "N", label: "新規" },
  { value: "A", label: "追加" },
] as const;

const INITIAL_FORM_STATE: ProjectFormData = {
  projectName: "",
  sales: "",
  grossProfit: "",
  scheduledDate: "",
  burdenRatio: "100",
  loadValue: "0",
  assignedDate: "",
  rootType: "N",
};

export default function ProjectRegistration() {
  // --- States ---
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_STATE);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearchCode, setClientSearchCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  // --- Helpers ---

  // 次の要素にフォーカスを移動させる共通関数
  const focusNextElement = (currentElement: HTMLElement) => {
    const form = currentElement.closest("form");
    if (!form) return;
    const elements = Array.from(form.elements) as HTMLElement[];
    const index = elements.indexOf(currentElement);
    if (index > -1 && index < elements.length - 1) {
      elements[index + 1].focus();
    }
  };

  // --- Handlers ---

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // フォーム全体のEnter制御
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA") return;

      // 確定ボタンや検索ボタン自体のEnterは、それぞれのonClickに任せるためここでは何もしない
      if (target.tagName === "BUTTON") return;

      e.preventDefault();
      focusNextElement(target);
    }
  }, []);

  // 取引先確定ボタンの処理
  const handleLoadClient = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (!clientSearchCode) return;
    try {
      const data = await invoke<Client>("get_client_by_code", { code: clientSearchCode });
      setSelectedClient(data);
      setIsSearching(false);

      // 処理成功後、ボタン（または入力欄）から次の要素へフォーカスを移す
      if (e?.target) {
        focusNextElement(e.target as HTMLElement);
      }
    } catch (err) {
      alert("該当する取引先が見つかりませんでした");
      setSelectedClient(null);
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    try {
      const results = await invoke<Client[]>("search_clients", { name: searchName });
      setSearchResults(results);
    } catch (err) {
      console.error("検索エラー:", err);
      setSearchResults([]);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
    }
  };

  const handleSelectSearchResult = (client: Client) => {
    setSelectedClient(client);
    setClientSearchCode(client.clientCode);
    setIsSearching(false);
    setSearchName("");
    setSearchResults([]);
    // 選択後、名称検索ボタンの次の要素（ルートタイプ）へ飛ばすなどの調整も可能
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return alert("取引先を選択してください");

    try {
      await invoke("create_project", {
        projectName: formData.projectName,
        clientId: selectedClient.id,
        // 💡 金額は文字列のまま送る（未入力時は "0" にする）
        sales: formData.sales || "0",
        grossProfit: formData.grossProfit || "0",
        scheduledDate: formData.scheduledDate,
        burdenRatio: parseFloat(formData.burdenRatio) || 0,
        loadValue: parseFloat(formData.loadValue) || 0,
        assignedDate: formData.assignedDate || null,
        rootType: formData.rootType,
      });

      alert("案件を登録しました！");
      setFormData(INITIAL_FORM_STATE);
      setSelectedClient(null);
      setClientSearchCode("");
    } catch (err) {
      alert(`登録エラー: ${err}`);
    }
  };

  return (
    <main className="registration-container">
      <div className="registration-form-card">
        <h1>案件新規登録</h1>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          
          <div className="form-group">
            <label className="form-label">案件名:</label>
            <input
              name="projectName"
              type="text"
              className="form-input"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">取引先選択:</label>
            <div className="search-section">
              <div className="search-inputs">
                <div className="id-input-wrap">
                  <input
                    type="text"
                    className="form-input code-input"
                    style={{ width: "120px" }}
                    value={clientSearchCode}
                    onChange={(e) => setClientSearchCode(e.target.value)}
                    placeholder="コード"
                  />
                </div>
                <button 
                  type="button" 
                  className="retro-btn primary" 
                  onClick={(e) => handleLoadClient(e)}
                >
                  確定
                </button>
                <button type="button" className="retro-btn secondary" onClick={() => setIsSearching(!isSearching)}>
                  {isSearching ? "検索を閉じる" : "名称で検索"}
                </button>
                
                <div className="client-name-display" style={{ marginLeft: "10px" }}>
                  {selectedClient ? (
                    <span className="selected-name">✅ {selectedClient.clientName}</span>
                  ) : (
                    <span className="placeholder">未選択</span>
                  )}
                </div>
              </div>

              {isSearching && (
                <div className="search-panel retro-panel">
                  <div className="search-bar">
                    <input
                      type="text"
                      className="form-input"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="取引先名の一部を入力"
                      onKeyDown={handleSearchKeyDown}
                    />
                    <button type="button" className="retro-btn primary" onClick={handleSearch}>検索</button>
                  </div>
                  {searchResults.length > 0 && (
                    <ul className="search-result-list">
                      {searchResults.map((c) => (
                        <li key={c.id} className="search-result-item">
                          <span>[{c.clientCode}] {c.clientName}</span>
                          <button type="button" className="btn-select" onClick={() => handleSelectSearchResult(c)}>
                            選択
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">ルートタイプ:</label>
              <select
                name="rootType"
                className="form-input"
                value={formData.rootType}
                onChange={handleInputChange}
              >
                {ROOT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label className="form-label">売上金額 (¥):</label>
              <input
                name="sales"
                type="number"
                className="form-input"
                value={formData.sales}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">粗利金額 (¥):</label>
              <input
                name="grossProfit"
                type="number"
                className="form-input"
                value={formData.grossProfit}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">計上負担割合 (%):</label>
              <input
                name="burdenRatio"
                type="number"
                className="form-input"
                value={formData.burdenRatio}
                onChange={handleInputChange}
                step="0.1"
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">負荷値 (Load):</label>
              <input
                name="loadValue"
                type="number"
                className="form-input"
                value={formData.loadValue}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">割振日:</label>
              <input
                name="assignedDate"
                type="date"
                className="form-input"
                value={formData.assignedDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">計上予定日:</label>
              <input
                name="scheduledDate"
                type="date"
                className="form-input"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button main-submit">
            この内容で案件を登録する
          </button>
        </form>
      </div>
    </main>
  );
}
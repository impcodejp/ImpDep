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

  // 💡 共通化：コードを受け取ってデータを取得する処理
  const fetchClientData = async (targetCode: string) => {
    try {
      const data = await invoke<Client>("get_client_by_code", { code: targetCode });
      setFormData(data);
      setSearchResults([]);
      setIsSearching(false);
      setInputCode(targetCode); // 検索入力欄も合わせて更新
    } catch (error) {
      console.error("取得エラー:", error);
      alert("指定された取引先コードが見つかりませんでした");
      setFormData(null);
    }
  };

  // 確定ボタンを押した時の処理
  const handleLoadClient = () => {
    if (inputCode) fetchClientData(inputCode);
  };

  // 💡 追加：他ウィンドウ（一覧画面など）から「このコードを開いて！」と呼ばれた時の処理
  useEffect(() => {
    const unlisten = listen<{ code: string }>("load_client_for_edit", (event) => {
      if (event.payload && event.payload.code) {
        fetchClientData(event.payload.code);
      }
    });

    // コンポーネントが閉じられる時にリスナーを解除する（クリーンアップ）
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  // 名前であいまい検索する処理
  const handleSearch = async () => {
    if (!searchName) return;
    try {
      const results = await invoke<Client[]>("search_clients", { name: searchName });
      setSearchResults(results);
      if (results.length === 0) alert("一致する取引先がありません");
    } catch (error) {
      console.error("検索エラー:", error);
      alert(error);
    }
  };

  // 検索結果から選択した時の処理
  const handleSelectSearchResult = (client: Client) => {
    setInputCode(client.clientCode);
    setFormData(client);
    setSearchResults([]);
    setIsSearching(false);
  };

  // フォームの入力内容を変更した時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  // 更新を保存する処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await invoke("update_client", { payload: formData });
      alert("取引先の情報を更新しました！");
    } catch (error) {
      console.error("更新エラー:", error);
      alert(error);
    }
  };

  return (
    <main>
      <div className="registration-form" style={{ maxWidth: "600px" }}>
        <h1>取引先マスタ更新</h1>

        {/* --- コード入力・検索エリア --- */}
        <div className="search-section">
          <div className="search-inputs">
            <div className="id-input-wrap">
              <label className="form-label" style={{ marginBottom: 0 }}>コード:</label>
              <input
                type="text"
                className="form-input"
                style={{ width: "140px" }}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="コードを入力"
              />
            </div>
            <button className="retro-btn primary" onClick={handleLoadClient}>確定</button>
            <button className="retro-btn secondary" onClick={() => setIsSearching(!isSearching)}>
              {isSearching ? "検索を閉じる" : "検索を開く"}
            </button>
          </div>

          {/* 検索枠（トグルで表示/非表示） */}
          {isSearching && (
            <div className="search-panel">
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="form-input"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="取引先名の一部を入力"
                />
                <button className="retro-btn primary" onClick={handleSearch}>検索</button>
              </div>

              {/* 検索結果のリスト表示 */}
              {searchResults.length > 0 && (
                <ul className="search-result-list">
                  {searchResults.map((c) => (
                    <li key={c.id} className="search-result-item">
                      <span>[{c.clientCode}] {c.clientName}</span>
                      <button className="btn-select" onClick={() => handleSelectSearchResult(c)}>
                        選択
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* --- 編集フォームエリア --- */}
        {formData && (
          <form onSubmit={handleSubmit}>
            <h3 className="edit-form-title">情報の編集</h3>
            
            <div className="form-group">
              <label className="form-label">取引先コード:</label>
              <input
                type="text"
                name="clientCode"
                className="form-input"
                value={formData.clientCode}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">取引先名:</label>
              <input
                type="text"
                name="clientName"
                className="form-input"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox" id="edit-usegali" name="usegali"
                  className="checkbox-input"
                  checked={formData.usegali} onChange={handleChange}
                />
                <label htmlFor="edit-usegali" className="checkbox-label">Galileoptを利用する</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox" id="edit-useml" name="useml"
                  className="checkbox-input"
                  checked={formData.useml} onChange={handleChange}
                />
                <label htmlFor="edit-useml" className="checkbox-label">MJSLINKを利用する</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox" id="edit-usexro" name="usexro"
                  className="checkbox-input"
                  checked={formData.usexro} onChange={handleChange}
                />
                <label htmlFor="edit-usexro" className="checkbox-label">Xronosを利用する</label>
              </div>
            </div>
            
            <button type="submit" className="submit-button">更新を保存する</button>
          </form>
        )}
      </div>
    </main>
  );
}
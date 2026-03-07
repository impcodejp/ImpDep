import { useState } from "react";
import { invoke } from "@tauri-apps/api/core"; // Tauri2.0の呼び出し機能を追加！
import "../App.css";

function App() {
  const [formData, setFormData] = useState({
    clientCode: "",
    clientName: "",
    usegali: false,
    useml: false,
    usexro: false,
  });

  // メッセージ表示用の状態（成功か失敗かと、そのテキスト）
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" }); // 送信前に一度メッセージをクリア

    try {
      // Rustの `add_client` コマンドを呼び出し、formDataを渡します！
      await invoke("add_client", { payload: formData });
      
      // 成功した場合の処理
      setMessage({ type: "success", text: "データの登録が完了しました！" });
      
      // フォームを空に戻す（連続で登録しやすくするため）
      setFormData({
        clientCode: "",
        clientName: "",
        usegali: false,
        useml: false,
        usexro: false,
      });

    } catch (error) {
      // Rust側でエラー（Err）が返ってきた場合の処理
      console.error(error);
      setMessage({ type: "error", text: `エラーが発生しました: ${error}` });
    }
  };

  return (
    <main>
      <h1>取引先マスタ登録</h1>

      <form className="registration-form" onSubmit={handleSubmit}>
        
        {/* --- メッセージ表示エリア --- */}
        {message.text && (
          <div className={`message-box ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">取引先コード</label>
          <input
            type="text"
            name="clientCode"
            value={formData.clientCode}
            onChange={handleChange}
            placeholder="例: C0001"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">取引先名</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="株式会社〇〇"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="checkbox-group">
            <input type="checkbox" name="usegali" checked={formData.usegali} onChange={handleChange} className="checkbox-input" />
            <span className="checkbox-label">Galileoptを使用する</span>
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-group">
            <input type="checkbox" name="useml" checked={formData.useml} onChange={handleChange} className="checkbox-input" />
            <span className="checkbox-label">MJSLINKを使用する</span>
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-group">
            <input type="checkbox" name="usexro" checked={formData.usexro} onChange={handleChange} className="checkbox-input" />
            <span className="checkbox-label">Xronosを使用する</span>
          </label>
        </div>

        <button type="submit" className="submit-button">
          登録する
        </button>
      </form>
    </main>
  );
}

export default App;
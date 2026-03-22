import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ClientRegistration.css";

export default function ClientRegistration() {
  const [formData, setFormData] = useState({
    clientCode: "",
    clientName: "",
    usegali: false,
    useml: false,
    usexro: false,
    myUser: false,
    otherSystem: "", // 💡 追加：その他システム（初期値は空文字）
  });

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
    setMessage({ type: "", text: "" }); 

    const submitData = {
      ...formData,
      clientCode: Number(formData.clientCode)
    };

    try {
      await invoke("add_client", { payload: submitData });
      setMessage({ type: "success", text: "データの登録が完了しました。" });
      setFormData({
        clientCode: "",
        clientName: "",
        usegali: false,
        useml: false,
        usexro: false,
        myUser: false,
        otherSystem: "", // 💡 追加：登録成功後のリセット
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: `エラーが発生しました: ${error}` });
    }
  };

  return (
    <div className="native-window-container">
      <header className="native-window-header">
        <h1>取引先マスタ登録</h1>
      </header>

      <div className="native-window-content">
        <form onSubmit={handleSubmit} className="native-form-body">
          {message.text && (
            <div className={`native-message-box ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">取引先コード</label>
            <input
              type="number"
              name="clientCode"
              value={formData.clientCode}
              onChange={handleChange}
              placeholder="例: 1"
              className="native-input"
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
              className="native-input"
              required
            />
          </div>

          <div className="checkbox-group-modern">
            <input
              type="checkbox" id="reg-myUser" name="myUser"
              className="checkbox-input"
              checked={formData.myUser} onChange={handleChange}
            />
            <label htmlFor="reg-myUser" className="checkbox-label">担当顧客</label>
          </div>

          <div className="native-checkbox-area">
            <label className="form-label">利用システムの選択</label>
            <div className="checkbox-group-modern">
              <input
                type="checkbox" id="reg-usegali" name="usegali"
                className="checkbox-input"
                checked={formData.usegali} onChange={handleChange}
              />
              <label htmlFor="reg-usegali" className="checkbox-label">Galileopt</label>
            </div>
            <div className="checkbox-group-modern">
              <input
                type="checkbox" id="reg-useml" name="useml"
                className="checkbox-input"
                checked={formData.useml} onChange={handleChange}
              />
              <label htmlFor="reg-useml" className="checkbox-label">MJSLINK</label>
            </div>
            <div className="checkbox-group-modern">
              <input
                type="checkbox" id="reg-usexro" name="usexro"
                className="checkbox-input"
                checked={formData.usexro} onChange={handleChange}
              />
              <label htmlFor="reg-usexro" className="checkbox-label">Xronos</label>
            </div>
          </div>

          {/* 💡 追加：その他システムの入力欄 */}
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label">その他システム</label>
            <input
              type="text"
              name="otherSystem"
              value={formData.otherSystem || ""}
              onChange={handleChange}
              placeholder="その他のシステム名（任意）"
              className="native-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="native-btn primary-save">
              登録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
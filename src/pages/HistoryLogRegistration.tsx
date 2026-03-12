import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./HistoryLogRegistration.css";

export default function HistoryLogRegistration() {
  const { id } = useParams<{ id: string }>();

  // --- 状態管理 ---
  const [projectName, setProjectName] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [oldDate, setOldDate] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [changeReason, setChangeReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期データの読み込み
  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const project = await invoke<any>("get_project_detail", { id: Number(id) });
        setProjectName(project.projectName);
        setClientName(project.clientName);
        setOldDate(project.currentScheduledDate);
        setNewDate(project.currentScheduledDate); // 初期値として現在の予定日をセット
      } catch (error) {
        console.error("データの取得に失敗:", error);
      }
    };
    if (id) fetchProjectInfo();
  }, [id]);

  // --- フォーム送信処理 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await invoke("register_history_log", {
        payload: {
          projectId: Number(id),
          oldScheduledDate: oldDate,
          newScheduledDate: newDate || oldDate,
          changeReason: changeReason
        }
      });

      // 親画面（詳細画面）へ通知
      await emit("history-updated");

      alert("履歴を登録しました");
      await getCurrentWindow().close();
    } catch (error) {
      alert("登録に失敗しました: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="registration-container">
      <div className="registration-form-card">
        {/* 💡 ヘッダー部分：案件名と顧客名を強調 */}
        <header className="registration-header">
          <h1 className="registration-title">HISTORY LOG REGISTRATION</h1>
          <div className="project-info-badge">
            <div className="info-row">
              <span className="info-label">CLIENT</span>
              <span className="info-value">{clientName || "---"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">PROJECT</span>
              <span className="info-value highlight">{projectName || "---"}</span>
            </div>
          </div>
        </header>

        <div className="subtitle">
          <span>CASE ID: {id}</span>
          <span>DATE: {new Date().toLocaleDateString()}</span>
        </div>

        <form onSubmit={handleSubmit} className="retro-form">
          <div className="form-group">
            <label className="form-label">変更前の予定日</label>
            <input 
              type="date" 
              value={oldDate} 
              readOnly 
              className="form-input readonly-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">新しい予定日</label>
            <input 
              type="date" 
              className="form-input"
              value={newDate} 
              onChange={(e) => setNewDate(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">変更理由 / コメント</label>
            <textarea 
              className="form-input reason-textarea"
              value={changeReason} 
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="例：クライアント都合により延期"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="retro-btn secondary" 
              onClick={() => getCurrentWindow().close()}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="submit-button primary-save" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "SAVING..." : "REGISTER LOG"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
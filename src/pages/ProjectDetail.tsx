import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import "./ProjectDetail.css";

// 型定義
interface ProjectDetailData {
  id: number;
  projectName: string;
  clientName: string;
  salesAmount: number;
  grossProfitAmount: number;
  initialScheduledDate: string;
  currentScheduledDate: string;
  assignedDate: string | null;
  status: string;
  burdenRatio: number;
  loadValue: number;
  completedDate: string | null;
}

interface ChangeHistory {
  id: number;
  oldDate: string | null;
  newDate: string;
  changeReason: string | null;
  changedAt: string;
}

const STATUS_OPTIONS = ["割振済", "着手", "検収合意", "送付済", "完了"];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [histories, setHistories] = useState<ChangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Partial<ProjectDetailData>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [detail, historyList] = await Promise.all([
        invoke<ProjectDetailData>("get_project_detail", { id: Number(id) }),
        invoke<ChangeHistory[]>("get_project_history_list", { id: Number(id) })
      ]);
      setProject(detail);
      setEditData(detail);
      setHistories(historyList);
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      const oldStatus = project.status;
      const newStatus = editData.status;
      let finalCompletedDate: string | null | undefined = project.completedDate;

      // --- ステータス変更に伴う日付制御ロジック ---
      if (oldStatus !== "完了" && newStatus === "完了") {
        const today = new Date().toISOString().split('T')[0];
        const inputDate = window.prompt("【案件完了】完了日を入力してください (YYYY-MM-DD)", today);
        
        if (inputDate === null) return;
        finalCompletedDate = inputDate;
      } 
      else if (oldStatus === "完了" && newStatus !== "完了") {
        const confirmRevert = window.confirm("ステータスを「完了」以外に変更します。完了日データは削除されますがよろしいですか？");
        if (!confirmRevert) return;
        finalCompletedDate = null;
      }

      // 💡 数値項目を Number() でキャストして送信
      await invoke("update_project_details", {
        id: Number(id),
        projectName: editData.projectName,
        salesAmount: Number(editData.salesAmount),
        grossProfitAmount: Number(editData.grossProfitAmount),
        status: editData.status,
        burdenRatio: Number(editData.burdenRatio),
        loadValue: Number(editData.loadValue),
        assignedDate: editData.assignedDate,
        completedDate: finalCompletedDate,
      });

      alert("更新が完了しました");
      loadData();
    } catch (error) {
      alert("更新に失敗しました: " + error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("この案件を削除してもよろしいですか？")) return;
    try {
      await invoke("delete_project", { id: Number(id) });
      alert("削除しました");
      navigate(-1);
    } catch (error) {
      alert("削除に失敗しました: " + error);
    }
  };

  if (loading || !project) {
    return <main className="main-container"><div className="message-box">LOADING...</div></main>;
  }

  return (
    <main className="main-container">
      <div className="tab-content detail-full-screen">
        <header className="detail-header-full">
          <div className="title-area">
            <h1 className="project-title-display">{editData.projectName}</h1>
            <div className="client-info-banner">
              <span className="label">CLIENT:</span>
              <span className="value">{project.clientName}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="retro-btn secondary" onClick={() => navigate(-1)}>BACK</button>
          </div>
        </header>

        <div className="detail-grid-layout">
          {/* 左側：メイン編集フォーム */}
          <section className="main-edit-pane">
            <h2 className="edit-form-title">PROJECT INFORMATION</h2>
            
            <div className="form-group">
              <label className="form-label">プロジェクト名称</label>
              <input
                className="form-input"
                type="text"
                value={editData.projectName || ""}
                onChange={(e) => setEditData({ ...editData, projectName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ステータス</label>
                <select
                  className="form-input status-select"
                  value={editData.status || ""}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  style={{
                    borderColor: editData.status === "完了" ? "#2ecc71" : "var(--border-color)",
                    fontWeight: editData.status === "完了" ? "bold" : "normal"
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">割振日 (LOAD基準日)</label>
                <input
                  className="form-input"
                  type="date"
                  value={editData.assignedDate || ""}
                  onChange={(e) => setEditData({ ...editData, assignedDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">売上金額 (JPY)</label>
                <input
                  className="form-input"
                  type="number"
                  value={editData.salesAmount ?? 0}
                  onChange={(e) => setEditData({ ...editData, salesAmount: e.target.value as any })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">粗利金額 (JPY)</label>
                <input
                  className="form-input"
                  type="number"
                  value={editData.grossProfitAmount ?? 0}
                  onChange={(e) => setEditData({ ...editData, grossProfitAmount: e.target.value as any })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">負担割合 (%)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  value={editData.burdenRatio ?? 0}
                  onChange={(e) => setEditData({ ...editData, burdenRatio: e.target.value as any })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">負荷値 (LOAD SCORE)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  value={editData.loadValue ?? 0}
                  onChange={(e) => setEditData({ ...editData, loadValue: e.target.value as any })}
                />
              </div>
            </div>

            <div className="action-footer">
              <button className="submit-button save-btn" onClick={handleSave}>UPDATE / 変更保存</button>
              <button className="retro-btn secondary delete-btn" onClick={handleDelete}>DELETE / 案件削除</button>
            </div>
          </section>

          {/* 右側：履歴と日付サマリー */}
          <aside className="side-info-pane">
            <div className="date-summary-card">
              <h3 className="side-title">SCHEDULE</h3>
              <div className="date-item">
                <label>現在の計上予定日</label>
                <p className="date-val highlight">{project.currentScheduledDate}</p>
              </div>
              {project.completedDate && (
                <div className="date-item completed-box" style={{ border: '2px solid #2ecc71', padding: '8px', marginBottom: '10px', backgroundColor: '#f0fff4', borderRadius: '4px' }}>
                  <label style={{ color: '#27ae60', fontWeight: 'bold' }}>完了確定日</label>
                  <p className="date-val" style={{ color: '#27ae60', fontSize: '1.2rem' }}>{project.completedDate}</p>
                </div>
              )}
              <div className="date-item">
                <label>当初計上予定日</label>
                <p className="date-val">{project.initialScheduledDate || "---"}</p>
              </div>
            </div>

            <div className="history-log-area">
              <h3 className="side-title">HISTORY LOG</h3>
              <div className="history-scroll">
                {histories.length === 0 ? (
                  <p className="no-history">履歴なし</p>
                ) : (
                  histories.map((h) => (
                    <div key={h.id} className="history-card">
                      <div className="history-meta">
                        <span className="h-date">{new Date(h.changedAt).toLocaleDateString()}</span>
                        <span className="h-label">変更</span>
                      </div>
                      <div className="h-flow">
                        <span className="old">{h.oldDate || "始"}</span>
                        <span className="arrow">→</span>
                        <span className="new">{h.newDate}</span>
                      </div>
                      {h.changeReason && <div className="h-reason">{h.changeReason}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
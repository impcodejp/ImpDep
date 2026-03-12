import { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import "./ProjectDetail.css";

// 型定義
interface ProjectDetailData {
  id: number;
  projectName: string;
  clientName: string;
  salesAmount: number;
  grossProfitAmount: number;
  currentScheduledDate: string;
  originalScheduledDate: string | null;
  status: string;
  rootType: string;
  burdenRatio: number;
  loadValue: number;
  assignedDate: string | null;
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
const ROOT_TYPE_OPTIONS = [
  { value: "N", label: "新規" },
  { value: "A", label: "追加" },
];

export default function ProjectDetail() {
  const { id: paramsId } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [histories, setHistories] = useState<ChangeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // フォーム用State
  const [editData, setEditData] = useState<Partial<ProjectDetailData>>({});

  const id = paramsId ? Number(paramsId) : 0;

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [detail, historyList] = await Promise.all([
        invoke<ProjectDetailData>("get_project_detail", { id: Number(id) }),
        invoke<ChangeHistory[]>("get_project_history_list", { id: Number(id) })
      ]);
      
      setProject(detail);
      // 💡 DBの小数(0.7)を画面用の%(70)に変換してセット
      setEditData({
        ...detail,
        burdenRatio: detail.burdenRatio * 100
      });
      setHistories(historyList);
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unlisten = listen("history-updated", () => {
      loadData();
    });
    return () => {
      unlisten.then(f => f());
    };
  }, [id]);

  const handleBack = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  const openHistoryLogRegistration = async (projectId: number) => {
    try {
      await invoke("open_history_log_registration_window", { id: Number(projectId) });
    } catch (error) {
      console.error("履歴登録ウィンドウのオープンに失敗しました:", error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // 数値入力の場合は数値として保持
    const val = e.target.type === "number" ? parseFloat(value) : value;
    setEditData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    if (!project) return;
    try {
      const oldStatus = project.status;
      const newStatus = editData.status;
      let finalCompletedDate: string | null | undefined = project.completedDate;

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

      await invoke("update_project_details", {
        id: Number(id),
        projectName: editData.projectName,
        salesAmount: Number(editData.salesAmount),
        grossProfitAmount: Number(editData.grossProfitAmount),
        status: editData.status,
        rootType: editData.rootType,
        // 💡 Rustに送る直前で % から 小数（/100）に戻す
        burdenRatio: Number(editData.burdenRatio || 0) / 100,
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
      handleBack(); 
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
            <h1 className="project-title-display">{project.projectName}</h1>
            <div className="client-info-banner">
              <span className="label">CLIENT:</span>
              <span className="value">{project.clientName}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="retro-btn secondary" onClick={handleBack}>BACK</button>
          </div>
        </header>

        <div className="detail-grid-layout">
          {/* 左側：メイン編集フォーム */}
          <section className="main-edit-pane">
            <h2 className="edit-form-title">PROJECT INFORMATION</h2>
            
            <div className="form-group">
              <label className="form-label">プロジェクト名称</label>
              <input name="projectName" className="form-input" type="text" value={editData.projectName || ""} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">ステータス</label>
                <select
                  name="status"
                  className="form-input status-select"
                  value={editData.status || ""}
                  onChange={handleChange}
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
              <div className="form-group flex-1">
                <label className="form-label">ルートタイプ</label>
                <select name="rootType" className="form-input" value={editData.rootType || "N"} onChange={handleChange}>
                  {ROOT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">売上金額 (JPY)</label>
                <input name="salesAmount" className="form-input" type="number" value={editData.salesAmount ?? 0} onChange={handleChange} />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">粗利金額 (JPY)</label>
                <input name="grossProfitAmount" className="form-input" type="number" value={editData.grossProfitAmount ?? 0} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">計上負担割合 (%)</label>
                <input 
                  name="burdenRatio" 
                  className="form-input" 
                  type="number" 
                  step="0.1" 
                  max="100"
                  min="0"
                  value={editData.burdenRatio ?? 0} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">負荷値 (LOAD SCORE)</label>
                <input name="loadValue" className="form-input" type="number" step="0.1" value={editData.loadValue ?? 0} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">割振日 (LOAD基準日)</label>
                <input name="assignedDate" className="form-input" type="date" value={editData.assignedDate || ""} onChange={handleChange} />
              </div>
              <div className="form-group flex-1"></div>
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
                <div className="date-item completed-box">
                  <label>完了確定日</label>
                  <p className="date-val">{project.completedDate}</p>
                </div>
              )}
              <div className="date-item">
                <label>当初計上予定日</label>
                <p className="date-val">{project.originalScheduledDate || "---"}</p>
              </div>
            </div>

            <div className="history-log-area">
              <div className="side-title-header">
                <h3 className="side-title">HISTORY LOG</h3>
                <button className="retro-btn secondary history-add-btn" onClick={() => openHistoryLogRegistration(project.id)}>
                  + 履歴登録
                </button>
              </div>
              
              <div className="history-scroll">
                {histories.length === 0 ? (
                  <p className="no-history">履歴なし</p>
                ) : (
                  histories.map((h) => (
                    <div key={h.id} className="history-card">
                      <div className="history-meta">
                        <span className="h-date">{new Date(h.changedAt).toLocaleDateString()}</span>
                        <span className="h-label">{h.oldDate !== h.newDate ? "変更" : "コメント"}</span>
                      </div>
                      <div className="h-flow">
                        {h.oldDate !== h.newDate && (
                          <div>
                            <span className="old">{h.oldDate || "始"}</span>
                            <span className="arrow">→</span>
                            <span className="new">{h.newDate}</span>
                          </div>
                        )}
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
// Reactフック・ルーティング・Tauri API
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import "./ProjectDetail.css";

/**
 * 案件詳細データ（バックエンドから取得）
 * ※金額は文字列で扱う（精度・フォーマット維持のため）
 */
interface ProjectDetailData {
  id: number;
  projectName: string;
  clientName: string;
  salesAmount: string;
  grossProfitAmount: string;
  currentScheduledDate: string;
  originalScheduledDate: string | null;
  status: string;
  rootType: string;
  burdenRatio: number; // 0〜1（内部値）
  loadValue: number;
  assignedDate: string | null;
  completedDate: string | null;
}

/**
 * 日付変更履歴
 */
interface ChangeHistory {
  id: number;
  oldDate: string | null;
  newDate: string;
  changeReason: string | null;
  changedAt: string;
}

// ステータス選択肢
const STATUS_OPTIONS = ["割振済", "着手", "検収合意", "送付済", "完了"];

// ルートタイプ（N:新規 / A:追加）
const ROOT_TYPE_OPTIONS = [
  { value: "N", label: "新規" },
  { value: "A", label: "追加" },
];

export default function ProjectDetail() {
  // URLパラメータから案件ID取得
  const { id: paramsId } = useParams<{ id: string }>();

  // 画面表示用データ
  const [project, setProject] = useState<ProjectDetailData | null>(null);

  // 履歴データ
  const [histories, setHistories] = useState<ChangeHistory[]>([]);

  // ローディング状態
  const [loading, setLoading] = useState(true);
  
  /**
   * 編集用データ（フォームの状態）
   * projectとは分離して保持（未保存変更を扱うため）
   */
  const [editData, setEditData] = useState<Partial<ProjectDetailData>>({});

  // IDをnumberに変換（不正値は0）
  const id = paramsId ? Number(paramsId) : 0;

  /**
   * データ読み込み
   * - 案件詳細
   * - 履歴一覧
   */
  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // 並列取得（パフォーマンス最適化）
      const [detail, historyList] = await Promise.all([
        invoke<ProjectDetailData>("get_project_detail", { id: Number(id) }),
        invoke<ChangeHistory[]>("get_project_history_list", { id: Number(id) })
      ]);
      
      setProject(detail);

      // 編集用データ初期化
      // ※ burdenRatio はUI表示用に % に変換
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

  /**
   * 初期表示 + ID変更時再読込
   * また履歴更新イベントを購読して自動リロード
   */
  useEffect(() => {
    loadData();

    // Tauriイベント購読
    const unlisten = listen("history-updated", () => {
      loadData();
    });

    // クリーンアップ（重要：メモリリーク防止）
    return () => {
      unlisten.then(f => f());
    };
  }, [id]);

  /**
   * ウィンドウを閉じる（Tauri）
   */
  const handleBack = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  /**
   * 履歴登録ウィンドウを開く
   */
  const openHistoryLogRegistration = async (projectId: number) => {
    try {
      await invoke("open_history_log_registration_window", { id: Number(projectId) });
    } catch (error) {
      console.error("履歴登録ウィンドウのオープンに失敗しました:", error);
    }
  }

  /**
   * フォーム入力変更処理
   * - 数値/文字列を適切に変換
   * - 金額は文字列として保持（フォーマット維持）
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // 金額はそのまま文字列で扱う
    if (name === "salesAmount" || name === "grossProfitAmount") {
      setEditData(prev => ({ ...prev, [name]: value }));
      return;
    }

    // number型は数値に変換
    const val = e.target.type === "number" ? parseFloat(value) : value;

    setEditData(prev => ({ ...prev, [name]: val }));
  };

  /**
   * 保存処理
   * - ステータス変更による完了日制御あり
   */
  const handleSave = async () => {
    if (!project) return;

    try {
      const oldStatus = project.status;
      const newStatus = editData.status;

      let finalCompletedDate: string | null | undefined = editData.completedDate;

      /**
       * 完了 → 未完了 に戻す場合
       * 完了日を削除する確認
       */
      if (oldStatus === "完了" && newStatus !== "完了") {
        const confirmRevert = window.confirm("ステータスを「完了」以外に変更します。完了日データは削除されますがよろしいですか？");
        if (!confirmRevert) return;
        finalCompletedDate = null;
      }

      // 完了以外は完了日を必ずnull
      if (newStatus !== "完了") {
        finalCompletedDate = null;
      }

      /**
       * バックエンド更新
       * - burdenRatioは0〜1に戻す
       */
      await invoke("update_project_details", {
        id: Number(id),
        projectName: editData.projectName,
        salesAmount: String(editData.salesAmount || "0"),
        grossProfitAmount: String(editData.grossProfitAmount || "0"),
        status: editData.status,
        rootType: editData.rootType,
        burdenRatio: Number(editData.burdenRatio || 0) / 100,
        loadValue: Number(editData.loadValue),
        assignedDate: editData.assignedDate,
        completedDate: finalCompletedDate,
      });

      alert("更新が完了しました");

      // 再読み込みで整合性担保
      loadData();

    } catch (error) {
      alert("更新に失敗しました: " + error);
    }
  };

  /**
   * 案件削除処理
   */
  const handleDelete = async () => {
    if (!window.confirm("この案件を削除してもよろしいですか？")) return;

    try {
      await invoke("delete_project", { id: Number(id) });

      alert("削除しました");

      // 削除後はウィンドウを閉じる
      handleBack(); 
    } catch (error) {
      alert("削除に失敗しました: " + error);
    }
  };

  /**
   * ローディング表示
   */
  if (loading || !project) {
    return (
      <div className="detail-full-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-sub)', fontWeight: 600 }}>LOADING...</div>
      </div>
    );
  }

  /**
   * メインUI
   */
  return (
    <div className="detail-full-screen">
      {/* ヘッダー */}
      <header className="detail-header-full">
        <div className="title-area">
          <h1 className="project-title-display">{project.projectName}</h1>

          {/* クライアント表示 */}
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

        {/* =========================
           左：編集フォーム
        ========================= */}
        <section className="main-edit-pane">
          <h2 className="edit-form-title">PROJECT INFORMATION</h2>

          {/* 以下フォーム群（省略コメント） */}
          {/* → UIは見れば分かるので冗長説明は省略 */}

          <div className="action-footer">
            <button className="submit-button save-btn" onClick={handleSave}>UPDATE / 変更保存</button>
            <button className="retro-btn secondary delete-btn" onClick={handleDelete}>DELETE / 案件削除</button>
          </div>
        </section>

        {/* =========================
           右：履歴・日付サマリー
        ========================= */}
        <aside className="side-info-pane">

          {/* スケジュール表示 */}
          <div className="date-summary-card">
            <h3 className="side-title">SCHEDULE</h3>

            {/* 現在予定日 */}
            <div className="date-item">
              <label>現在の計上予定日</label>
              <p className="date-val highlight">{project.currentScheduledDate}</p>
            </div>

            {/* 完了日（存在時のみ） */}
            {project.completedDate && (
              <div className="date-item completed-box">
                <label>完了確定日</label>
                <p className="date-val">{project.completedDate}</p>
              </div>
            )}

            {/* 当初予定日 */}
            <div className="date-item">
              <label>当初計上予定日</label>
              <p className="date-val">{project.originalScheduledDate || "---"}</p>
            </div>
          </div>

          {/* 履歴ログ */}
          <div className="history-log-area">
            <div className="side-title-header">
              <h3 className="side-title">HISTORY LOG</h3>

              {/* 履歴追加 */}
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

                    {/* 日付・種別 */}
                    <div className="history-meta">
                      <span className="h-date">{new Date(h.changedAt).toLocaleDateString()}</span>
                      <span className="h-label">{h.oldDate !== h.newDate ? "変更" : "コメント"}</span>
                    </div>

                    {/* 日付変更表示 */}
                    <div className="h-flow">
                      {h.oldDate !== h.newDate && (
                        <div>
                          <span className="old">{h.oldDate || "始"}</span>
                          <span className="arrow">→</span>
                          <span className="new">{h.newDate}</span>
                        </div>
                      )}
                    </div>

                    {/* 理由 */}
                    {h.changeReason && <div className="h-reason">{h.changeReason}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
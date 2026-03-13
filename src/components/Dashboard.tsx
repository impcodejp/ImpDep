import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./Dashboard.css";

interface DashboardSummary {
  monthlySalesPlan: string;
  monthlySalesActual: string;
  monthlyProfitPlan: string;
  monthlyProfitActual: string;
  upcomingProjects: any[];
  loadValueSum: number;
}
const LOAD_VALUE_THRESHOLD = 100;

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  
  // 右側セクションの幅（%）を管理
  const [rightWidth, setRightWidth] = useState(33.3); 
  const isResizing = useRef(false);

  const loadDashboard = async () => {
    try {
      const yearMonth = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const data = await invoke<DashboardSummary>("get_dashboard_summary", { targetMonth: yearMonth });
      setSummary(data);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  };

  useEffect(() => { loadDashboard(); }, [viewDate]);

  // リサイズロジック
  const startResizing = () => { isResizing.current = true; document.body.style.cursor = "col-resize"; };
  const stopResizing = () => { isResizing.current = false; document.body.style.cursor = "default"; };
  
  const resize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
    if (newWidth > 15 && newWidth < 70) { 
      setRightWidth(newWidth);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  if (!summary) return <div className="loading">読み込み中...</div>;

  const handleDoubleClick = async (id: number) => {
    try { await invoke("open_project_detail_window", { id }); } 
    catch (error) { console.error("詳細ウィンドウの展開に失敗:", error); }
  };

  // 💡 進捗・差引残の計算
  const getProgress = (actual: string, plan: string) => {
    const a = Number(actual) || 0;
    const p = Number(plan) || 1;
    return Math.min(Math.round((a / p) * 100), 100);
  };

  const getRemaining = (actual: string, plan: string) => {
    const diff = Number(plan) - Number(actual);
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="dashboard-split-container">
      {/* 左側：統計エリア */}
      <div className="dashboard-left-pane" style={{ width: `${100 - rightWidth}%` }}>
        <div className="month-selector">
          <button className="retro-btn secondary" onClick={() => changeMonth(-1)}>◀ PREV</button>
          <h2 className="month-title">{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</h2>
          <button className="retro-btn secondary" onClick={() => changeMonth(1)}>NEXT ▶</button>
        </div>

        <div className="summary-section">
          <div className="load-value-card-compact">
            <label className="load-label">CURRENT LOAD SCORE</label>
            <div className="main-value">
              {(Number(summary.loadValueSum) || 0).toFixed(2)} <span className="unit">pts</span>
            </div>
            <div className="load-status-bar">
              <span className={`status-text ${Number(summary.loadValueSum) > LOAD_VALUE_THRESHOLD ? 'alert' : 'safe'}`}>
                {Number(summary.loadValueSum) > 10 ? '● SYSTEM OVERLOADED' : '● SYSTEM OPTIMIZED'}
              </span>
            </div>
          </div>
        </div>

        {/* 売上・粗利の横並びグリッド */}
        <div className="stats-horizontal-grid">
          {[
            { label: '当月売上管理', actual: summary.monthlySalesActual, plan: summary.monthlySalesPlan, type: 'sales' },
            { label: '当月粗利管理', actual: summary.monthlyProfitActual, plan: summary.monthlyProfitPlan, type: 'profit' }
          ].map((item) => {
            const percent = getProgress(item.actual, item.plan);
            const remaining = getRemaining(item.actual, item.plan);
            return (
              <div key={item.label} className={`stat-card ${item.type}`}>
                <label className="stat-card-label">{item.label}</label>
                
                <div className="values-comparison">
                  <div className="value-block">
                    <span className="block-label">予定</span>
                    <div className="main-value">¥{Math.floor(Number(item.plan)).toLocaleString()}</div>
                  </div>
                  <div className="value-block">
                    <span className="block-label">進捗</span>
                    <div className="main-value">¥{Math.floor(Number(item.actual)).toLocaleString()}</div>
                  </div>
                </div>

                <div className="retro-progress-container">
                  <div className="progress-info">
                    <span className="remaining-text">差引残: ¥{remaining.toLocaleString()}</span>
                    <span className="percent-tag">{percent}%</span>
                  </div>
                  <div className="retro-progress-bg">
                    <div className="retro-progress-bar" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 中央：リサイズハンドル */}
      <div className="resizer-handle" onMouseDown={startResizing}></div>

      {/* 右側：案件スケジュール（スクロール） */}
      <div className="dashboard-right-pane" style={{ width: `${rightWidth}%` }}>
        <div className="upcoming-section-fixed">
          <h3 className="section-title">📅 案件スケジュール</h3>
          <div className="table-scroll-area">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>予定日</th>
                  <th>案件名 / 取引先</th>
                  <th style={{ textAlign: 'right' }}>金額</th>
                  <th style={{ textAlign: 'center' }}>状態</th>
                </tr>
              </thead>
              <tbody>
                {summary.upcomingProjects.map((p) => (
                  <tr key={p.id} className={p.status === '完了' ? 'row-completed' : ''} onDoubleClick={() => handleDoubleClick(p.id)}>
                    <td className="font-retro">{p.currentScheduledDate.slice(5)}</td>
                    <td>
                      <div className="bold">{p.projectName}</div>
                      <div className="sub-text">{p.clientName}</div>
                    </td>
                    <td style={{ textAlign: 'right' }} className="font-retro">
                      ¥{(Number(p.salesAmount) / 10000).toFixed(1)}万
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${p.status}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
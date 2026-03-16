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

// 💡 最新の Rust 構造体に合わせたインターフェース
interface DashboardBudget {
  loadPoint: string;
  profitSum: string;               // 当月までの累計
  profitBudget: string;            // 期間予算
  profitPoint: string;             // 累計の達成率
  profitSumThismonth: string;      // 当月実績
  profitPointThismonth: string;    // 期間予算に占める当月実績割合
  newProfitSum: string;            // 当月迄の累計
  newProfitBudget: string;         // 期間予算 
  newProfitPoint: string;          // 累計達成率
  newProfitSumThismonth: string;   // 当月実績
  newProfitPointThismonth: string; // 期間予算に占める当月実施割合
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [budget, setBudget] = useState<DashboardBudget | null>(null);
  const [rightWidth, setRightWidth] = useState(33.3);
  const isResizing = useRef(false);

  const loadDashboard = async () => {
    const yearMonth = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const apiInputDate = yearMonth.replace("-", "") + "01";

    try {
      const data = await invoke<DashboardSummary>("get_dashboard_summary", { targetMonth: yearMonth });
      setSummary(data);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
    try {
      // 💡 引数名はキャメルケースの inputDate
      const dateBudget = await invoke<DashboardBudget>("get_fiscal_summary", { inputDate: apiInputDate });
      setBudget(dateBudget);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  };

  useEffect(() => { loadDashboard(); }, [viewDate]);

  const loadThreshold = budget ? (Number(budget.loadPoint) || 100) : 100;
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
    catch (error) { console.error("失敗:", error); }
  };

  // 補助関数
  const formatYen = (val: string | number) => Math.floor(Number(val)).toLocaleString();

  return (
    <div className="dashboard-split-container">
      <div className="dashboard-left-pane" style={{ width: `${100 - rightWidth}%` }}>
        <div className="month-selector">
          <button className="retro-btn secondary" onClick={() => changeMonth(-1)}>◀ PREV</button>
          <h2 className="month-title">{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</h2>
          <button className="retro-btn secondary" onClick={() => changeMonth(1)}>NEXT ▶</button>
        </div>

        {/* 1. 負荷スコアエリア */}
        <div className="summary-section">
          <div className="load-value-card-compact">
            <label className="load-label">CURRENT LOAD SCORE</label>
            <label className="load-label"> (Max line: {loadThreshold})</label>
            <div className="main-value">
              {(Number(summary.loadValueSum) || 0).toFixed(2)} <span className="unit">pts</span>
            </div>
            <div className="load-status-bar">
              <span className={`status-text ${Number(summary.loadValueSum) > loadThreshold ? 'alert' : 'safe'}`}>
                {Number(summary.loadValueSum) > loadThreshold ? '● SYSTEM OVERLOADED' : '● SYSTEM OPTIMIZED'}
              </span>
            </div>
            <div className="retro-progress-bg" style={{marginTop: '8px', height: '4px'}}>
                <div 
                  className={`retro-progress-bar ${Number(summary.loadValueSum) > loadThreshold ? 'bg-alert' : ''}`} 
                  style={{ width: `${Math.min((Number(summary.loadValueSum) / loadThreshold) * 100, 100)}%` }}
                ></div>
            </div>
          </div>
        </div>

        {/* 2. 当月売上・粗利（既存） */}
        <div className="stats-horizontal-grid">
          {[
            { label: '当月売上計上管理', actual: summary.monthlySalesActual, plan: summary.monthlySalesPlan, type: 'sales' },
            { label: '当月粗利計上管理', actual: summary.monthlyProfitActual, plan: summary.monthlyProfitPlan, type: 'profit' }
          ].map((item) => (
            <div key={item.label} className={`stat-card ${item.type}`}>
              <label className="stat-card-label">{item.label}</label>
              <div className="values-comparison">
                <div className="value-block">
                  <span className="block-label">予定</span>
                  <div className="main-value">¥{formatYen(item.plan)}</div>
                </div>
                <div className="value-block">
                  <span className="block-label">進捗</span>
                  <div className="main-value">¥{formatYen(item.actual)}</div>
                </div>
              </div>
              <div className="retro-progress-container">
                <div className="progress-info">
                  <span className="remaining-text">残: ¥{formatYen(Math.max(0, Number(item.plan) - Number(item.actual)))}</span>
                  <span className="percent-tag">{Math.min(Math.round((Number(item.actual) / (Number(item.plan) || 1)) * 100), 100)}%</span>
                </div>
                <div className="retro-progress-bg">
                  <div className="retro-progress-bar" style={{ width: `${Math.min((Number(item.actual) / (Number(item.plan) || 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. 期間集計エリア */}
        {budget && (
          <div className="stats-horizontal-grid">
            {[
              // 順番を入れ替え＆新規粗利の type を "sales"（売上と同色）に変更
              {
                label: "新規粗利 予算進捗",
                actualSum: budget.newProfitSum,
                actualThisMonth: budget.newProfitSumThismonth,
                plan: budget.newProfitBudget,
                pointSum: budget.newProfitPoint,
                pointThisMonth: budget.newProfitPointThismonth,
                type: "sales" 
              },
              {
                label: "粗利計上 予算進捗",
                actualSum: budget.profitSum,                 
                actualThisMonth: budget.profitSumThismonth,  
                plan: budget.profitBudget,                   
                pointSum: budget.profitPoint,                
                pointThisMonth: budget.profitPointThismonth, 
                type: "profit" 
              }
            ].map((item) => (
              <div key={item.label} className={`stat-card ${item.type}`}>
                <label className="stat-card-label">{item.label}</label>
                <div className="values-comparison">
                  <div className="value-block">
                    <span className="block-label">期間予算</span>
                    <div className="main-value">¥{formatYen(item.plan)}</div>
                  </div>
                  <div className="value-block">
                    <span className="block-label">累計進捗</span>
                    <div className="main-value">¥{formatYen(item.actualSum)}</div>
                  </div>
                </div>
                <div className="retro-progress-container">
                  <div className="progress-info">
                    {/* 左下に当月単月の実績を表示 */}
                    <span className="remaining-text" style={{color: '#888'}}>
                      当月実績: ¥{formatYen(item.actualThisMonth)} ({Number(item.pointThisMonth).toFixed(1)}%)
                    </span>
                    {/* 右上に累計の達成率を表示 */}
                    <span className="percent-tag">{Number(item.pointSum).toFixed(1)}%</span>
                  </div>
                  <div className="retro-progress-bg">
                    {/* 累計のバー（薄い色） */}
                    <div 
                      className="retro-progress-bar period-bg-bar" 
                      style={{ width: `${Math.min(Number(item.pointSum), 100)}%` }}
                    ></div>
                    {/* 当月実績のバー（濃い色） */}
                    <div 
                      className="retro-progress-bar current-fg-bar" 
                      style={{ width: `${Math.min(Number(item.pointThisMonth), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resizer-handle" onMouseDown={startResizing}></div>

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
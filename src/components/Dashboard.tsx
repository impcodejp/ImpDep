// src/components/Dashboard.tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./Dashboard.css";

interface DashboardSummary {
  monthlySalesPlan: number;
  monthlySalesActual: number;
  monthlyProfitPlan: number;
  monthlyProfitActual: number;
  upcomingProjects: any[];
  loadValueSum: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

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

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  if (!summary) return <div className="loading">読み込み中...</div>;

  return (
    <div className="dashboard-container">
      {/* 月切り替え */}
      <div className="month-selector">
        <button className="retro-btn secondary" onClick={() => changeMonth(-1)}>◀ PREV</button>
        <h2 className="month-title">{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</h2>
        <button className="retro-btn secondary" onClick={() => changeMonth(1)}>NEXT ▶</button>
      </div>

      {/* 負荷値サマリー（高さを抑えつつ配置維持） */}
      <div className="summary-section">
        <div className="load-value-card-compact">
          <label className="load-label">CURRENT LOAD SCORE</label>
          <div className="main-value">
            {(Number(summary.loadValueSum) || 0).toFixed(2)} <span className="unit">pts</span>
          </div>
          <p className="description">※アサイン済みかつ、計上待ちのプロジェクト負荷合計</p>
        </div>
      </div>

      {/* 統計グリッド */}
      <div className="stats-grid">
        <div className="stat-card sales">
          <label>当月売上計画</label>
          <div className="main-value">¥{Math.floor(Number(summary.monthlySalesPlan)).toLocaleString()}</div>
          <div className="sub-value">内 計上済: ¥{Math.floor(Number(summary.monthlySalesActual)).toLocaleString()}</div>
        </div>
        <div className="stat-card profit">
          <label>当月粗利計画</label>
          <div className="main-value">¥{Math.floor(Number(summary.monthlyProfitPlan)).toLocaleString()}</div>
          <div className="sub-value">内 計上済: ¥{Math.floor(Number(summary.monthlyProfitActual)).toLocaleString()}</div>
        </div>
      </div>

      {/* 案件スケジュール（最初の状態のスタイル） */}
      <div className="upcoming-section">
        <h3 className="section-title">📅 案件スケジュール (今月計上予定)</h3>
        <table className="mini-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>予定日</th>
              <th>案件名</th>
              <th>取引先</th>
              <th style={{ textAlign: 'right' }}>売上</th>
              <th style={{ textAlign: 'center' }}>状態</th>
            </tr>
          </thead>
          <tbody>
            {summary.upcomingProjects.map((p) => {
              const isDone = p.status === '完了' || p.status === '送付済' || p.status === '検収合意';
              return (
                <tr key={p.id} className={isDone ? 'row-completed' : ''}>
                  <td>{p.currentScheduledDate}</td>
                  <td className="bold">{p.projectName}</td>
                  <td>{p.clientName}</td>
                  <td style={{ textAlign: 'right' }}>¥{Math.floor(Number(p.salesAmount)).toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
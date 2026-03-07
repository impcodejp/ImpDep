// src/components/Dashboard.tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./Dashboard.css"; // ダッシュボード専用のスタイル

// Rust側のDashboardSummary構造体と合わせる
interface DashboardSummary {
  monthlySalesPlan: number;
  monthlySalesActual: number;
  monthlyProfitPlan: number;
  monthlyProfitActual: number;
  upcomingProjects: any[]; // Project型があればそれに差し替え
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const loadDashboard = async () => {
    try {
      const data = await invoke<DashboardSummary>("get_dashboard_summary");
      setSummary(data);
    } catch (error) {
      console.error("ダッシュボードデータの取得に失敗:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!summary) return <div>読み込み中...</div>;

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card sales">
          <label>当月売上計画</label>
          <div className="main-value">¥{Math.floor(summary.monthlySalesPlan).toLocaleString()}</div>
          <div className="sub-value">内 計上済: ¥{Math.floor(summary.monthlySalesActual).toLocaleString()}</div>
        </div>
        
        <div className="stat-card profit">
          <label>当月粗利計画</label>
          <div className="main-value">¥{Math.floor(summary.monthlyProfitPlan).toLocaleString()}</div>
          <div className="sub-value">内 計上済: ¥{Math.floor(summary.monthlyProfitActual).toLocaleString()}</div>
        </div>
      </div>

      <div className="upcoming-section">
        <h3>📅 当月/次月 案件スケジュール</h3>
        <table className="mini-table">
          <thead>
            <tr>
              <th style={{width: '120px'}}>予定日</th>
              <th>案件名</th>
              <th>取引先</th>
              <th style={{textAlign: 'right', width: '120px'}}>売上金額</th>
              <th style={{textAlign: 'center', width: '100px'}}>状態</th>
            </tr>
          </thead>
          <tbody>
            {summary.upcomingProjects.map((p) => (
              <tr key={p.id} className={p.status === '完了' ? 'row-completed' : ''}>
                <td>{p.currentScheduledDate}</td>
                <td className="bold">{p.projectName}</td>
                <td>{p.clientName}</td>
                <td style={{textAlign: 'right', fontFamily: 'monospace'}}>
                  ¥{Math.floor(p.salesAmount).toLocaleString()}
                </td>
                <td style={{textAlign: 'center'}}>
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
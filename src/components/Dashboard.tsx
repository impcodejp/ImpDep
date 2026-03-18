import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import SidePanel from "./SidePanel";
import "./Dashboard.css";

interface DashboardBudget {
  loadPoint: string;
  profitSum: string;
  profitBudget: string;
  profitPoint: string;
  profitSumThismonth: string;
  profitPointThismonth: string;
  newProfitSum: string;
  newProfitBudget: string;
  newProfitPoint: string;
  newProfitSumThismonth: string;
  newProfitPointThismonth: string;
}

export interface DashboardSummary {
  monthlySalesPlan: string;
  monthlySalesActual: string;
  monthlyProfitPlan: string;
  monthlyProfitActual: string;
  upcomingProjects: any[];
  loadValueSum: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [budget, setBudget] = useState<DashboardBudget | null>(null);
  
  // スケジュールの表示・非表示を管理するステート
  const [isScheduleVisible, setIsScheduleVisible] = useState(true);

  const loadDashboard = async () => {
    const yearMonth = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const apiInputDate = yearMonth.replace("-", "") + "01";
    try { 
      setSummary(await invoke<DashboardSummary>("get_dashboard_summary", { targetMonth: yearMonth })); 
    } catch (e) {
      console.error("Failed to load summary:", e);
    }
    try { 
      setBudget(await invoke<DashboardBudget>("get_fiscal_summary", { inputDate: apiInputDate })); 
    } catch (e) {
      console.error("Failed to load budget:", e);
    }
  };

  useEffect(() => { 
    loadDashboard(); 
  }, [viewDate]);

  const loadThreshold = budget ? (Number(budget.loadPoint) || 100) : 100;

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleDoubleClick = async (id: number) => { 
    try { 
      await invoke("open_project_detail_window", { id }); 
    } catch (e) {
      console.error("Failed to open project detail:", e);
    } 
  };

  const formatYen = (val: string | number) => Math.floor(Number(val)).toLocaleString();

  if (!summary) return <div className="loading">Loading...</div>;

  return (
    <div className="dash-root">
      {/* 上部：月選択とスケジュール切替ボタン */}
      <header className="dash-header">
        <div className="month-selector-group">
          <button className="retro-btn" onClick={() => changeMonth(-1)}>←</button>
          <h2 className="month-title">
            {viewDate.getFullYear()} . {String(viewDate.getMonth() + 1).padStart(2, '0')}
          </h2>
          <button className="retro-btn" onClick={() => changeMonth(1)}>→</button>
        </div>
        
        <button 
          className={`toggle-schedule-btn ${isScheduleVisible ? 'active' : ''}`}
          onClick={() => setIsScheduleVisible(!isScheduleVisible)}
        >
          <span className="icon">📅</span> 
          {isScheduleVisible ? 'Schedule On' : 'Schedule Off'}
        </button>
      </header>

      {/* メインエリア */}
      <div className="dash-grid-container">
        
        {/* 左パネル */}
        <div className="dash-left-panel">
          
          {/* 1. 負荷スコア */}
          <div className="modern-card load-card">
            <div className="card-top">
              <span className="card-title">Load Score</span>
              <span className="sub-tag">Max {loadThreshold}</span>
            </div>
            <div className="main-value">{(Number(summary.loadValueSum) || 0).toFixed(2)}</div>
            <div className="progress-wrapper">
              <div className="prog-info">
                <span className={`status-dot ${Number(summary.loadValueSum) > loadThreshold ? 'alert' : 'safe'}`}></span>
                <span className="status-text">
                  {Number(summary.loadValueSum) > loadThreshold ? 'Overloaded' : 'Optimized'}
                </span>
              </div>
              <div className="prog-bg">
                <div 
                  className={`prog-bar ${Number(summary.loadValueSum) > loadThreshold ? 'bar-alert' : 'bar-safe'}`} 
                  style={{ width: `${Math.min((Number(summary.loadValueSum) / loadThreshold) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2 & 3. 統計カード(2x2) */}
          <div className="stats-2x2">
            
            {/* 売上 */}
            <div className="modern-card stat-card border-blue">
              <div className="card-top"><span className="card-title">当月売上</span></div>
              <div className="val-grid">
                <div>
                  <div className="v-lbl">進捗</div>
                  <div className="v-num">¥{formatYen(summary.monthlySalesActual)}</div>
                </div>
                <div>
                  <div className="v-lbl">予定</div>
                  <div className="v-num">¥{formatYen(summary.monthlySalesPlan)}</div>
                </div>
              </div>
              <div className="progress-wrapper">
                <div className="prog-info">
                  <span>残 ¥{formatYen(Math.max(0, Number(summary.monthlySalesPlan) - Number(summary.monthlySalesActual)))}</span>
                  <span>{Math.min(Math.round((Number(summary.monthlySalesActual) / (Number(summary.monthlySalesPlan) || 1)) * 100), 100)}%</span>
                </div>
                <div className="prog-bg">
                  <div 
                    className="prog-bar bg-blue" 
                    style={{ width: `${Math.min((Number(summary.monthlySalesActual) / (Number(summary.monthlySalesPlan) || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 粗利 */}
            <div className="modern-card stat-card border-green">
              <div className="card-top"><span className="card-title">当月粗利</span></div>
              <div className="val-grid">
                <div>
                  <div className="v-lbl">進捗</div>
                  <div className="v-num">¥{formatYen(summary.monthlyProfitActual)}</div>
                </div>
                <div>
                  <div className="v-lbl">予定</div>
                  <div className="v-num">¥{formatYen(summary.monthlyProfitPlan)}</div>
                </div>
              </div>
              <div className="progress-wrapper">
                <div className="prog-info">
                  <span>残 ¥{formatYen(Math.max(0, Number(summary.monthlyProfitPlan) - Number(summary.monthlyProfitActual)))}</span>
                  <span>{Math.min(Math.round((Number(summary.monthlyProfitActual) / (Number(summary.monthlyProfitPlan) || 1)) * 100), 100)}%</span>
                </div>
                <div className="prog-bg">
                  <div 
                    className="prog-bar bg-green" 
                    style={{ width: `${Math.min((Number(summary.monthlyProfitActual) / (Number(summary.monthlyProfitPlan) || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 新規粗利 累計 */}
            {budget && (
              <div className="modern-card stat-card border-blue">
                <div className="card-top"><span className="card-title">新規粗利 累計</span></div>
                
                <div className="budget-val-area">
                  <div className="achievement-rate">
                    <div className="v-lbl">達成率</div>
                    <div className="rate-num">{Number(budget.newProfitPoint).toFixed(1)}<span className="percent-mark">%</span></div>
                  </div>
                  <div className="budget-fraction">
                    <span className="v-lbl">実績 </span>
                    <div className="fraction-num">
                      ¥{formatYen(budget.newProfitSum)}
                    </div>
                  </div>
                  <div className="budget-fraction">
                    <span className="v-lbl">予算</span>
                    <div className="fraction-num">
                      ¥{formatYen(budget.newProfitBudget)}
                    </div>
                  </div>
                </div>

                <div className="progress-wrapper">
                  <div className="prog-info">
                    <span className="v-lbl" style={{ marginBottom: 0 }}>当月実績: ¥{formatYen(budget.newProfitSumThismonth)}</span>
                    <span className="this-month-percent">うち当月 {Number(budget.newProfitPointThismonth).toFixed(1)}%</span>
                  </div>
                  <div className="prog-bg">
                    <div className="prog-bar bg-blue op-30" style={{ width: `${Math.min(Number(budget.newProfitPoint), 100)}%`, position: 'absolute' }}></div>
                    <div className="prog-bar bg-blue" style={{ width: `${Math.min(Number(budget.newProfitPointThismonth), 100)}%`, position: 'absolute' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* 粗利計上 累計 */}
            {budget && (
              <div className="modern-card stat-card border-green">
                <div className="card-top"><span className="card-title">粗利計上 累計</span></div>
                
                <div className="budget-val-area">
                  <div className="achievement-rate">
                    <div className="v-lbl">達成率</div>
                    <div className="rate-num">{Number(budget.profitPoint).toFixed(1)}<span className="percent-mark">%</span></div>
                  </div>
                  <div className="budget-fraction">
                    <span className="v-lbl">実績 </span>
                    <div className="fraction-num">
                      ¥{formatYen(budget.profitSum)}
                    </div>
                  </div>
                  <div className="budget-fraction">
                    <span className="v-lbl">予算</span>
                    <div className="fraction-num">
                      ¥{formatYen(budget.profitBudget)}
                    </div>
                  </div>
                </div>

                <div className="progress-wrapper">
                  <div className="prog-info">
                    <span className="v-lbl" style={{ marginBottom: 0 }}>当月実績: ¥{formatYen(budget.profitSumThismonth)}</span>
                    <span className="this-month-percent">うち当月 {Number(budget.profitPointThismonth).toFixed(1)}%</span>
                  </div>
                  <div className="prog-bg">
                    <div className="prog-bar bg-green op-30" style={{ width: `${Math.min(Number(budget.profitPoint), 100)}%`, position: 'absolute' }}></div>
                    <div className="prog-bar bg-green" style={{ width: `${Math.min(Number(budget.profitPointThismonth), 100)}%`, position: 'absolute' }}></div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* 分離したSidePanelコンポーネント */}
        <SidePanel 
          isVisible={isScheduleVisible}
          summary={summary}
          onDoubleClick={handleDoubleClick}
        />

      </div>
    </div>
  );
}
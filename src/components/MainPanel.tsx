// src\components\MainPanel.tsx

import { DashboardSummary, DashboardBudget } from "./Dashboard";

interface MainPanelProps {
  summary: DashboardSummary;
  budget: DashboardBudget | null;
  loadThreshold: number;
  viewDate: Date; // 💡 追加
  onChangeMonth: (offset: number) => void; // 💡 追加
}

export default function MainPanel({ summary, budget, loadThreshold, viewDate, onChangeMonth }: MainPanelProps) {
  const formatYen = (val: string | number) => Math.floor(Number(val)).toLocaleString();

  return (
    <div className="dash-left-panel">
      
      {/* 💡 Dashboardから移動してきた月選択エリア */}
      <div className="main-panel-header">
        <div className="month-selector-group">
          <button className="retro-btn" onClick={() => onChangeMonth(-1)}>←</button>
          <h2 className="month-title">
            {viewDate.getFullYear()} . {String(viewDate.getMonth() + 1).padStart(2, '0')}
          </h2>
          <button className="retro-btn" onClick={() => onChangeMonth(1)}>→</button>
        </div>
      </div>

      {/* 1. 負荷スコア */}
      <div className="modern-card load-card">
        {/* ... (負荷スコアの中身は変更なし) ... */}
        <div className="card-top">
          <span className="card-title">Load Score</span>
          <span className="sub-tag">Max {loadThreshold}</span>
        </div>
        <div className="main-value">{(Number(summary.loadValueSum) || 0).toFixed(2)}</div>
        <div className="progress-wrapper">
          <div className="prog-info" style={{ justifyContent: 'flex-end' }}>
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
        {/* ... (統計カードの中身は変更なし) ... */}
        
        {/* 売上 */}
        <div className="modern-card stat-card border-blue">
          <div className="card-top"><span className="card-title">当月売上</span></div>
          <div className="val-grid">
            <div>
              <div className="v-lbl">進捗(千円)</div>
              <div className="v-num">¥{formatYen(Number(summary.monthlySalesActual) / 1000)}</div>
            </div>
            <div>
              <div className="v-lbl">予定(千円)</div>
              <div className="v-num">¥{formatYen(Number(summary.monthlySalesPlan) / 1000)}</div>
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
              <div className="v-lbl">進捗(千円)</div>
              <div className="v-num">¥{formatYen(Number(summary.monthlyProfitActual) / 1000)}</div>
            </div>
            <div>
              <div className="v-lbl">予定(千円)</div>
              <div className="v-num">¥{formatYen(Number(summary.monthlyProfitPlan) / 1000)}</div>
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
              {/* 左側：達成率 */}
              <div className="achievement-rate">
                <div className="v-lbl">達成率</div>
                <div className="rate-num">{Number(budget.newProfitPoint).toFixed(1)}<span className="percent-mark">%</span></div>
              </div>
              {/* 右側上段：実績 */}
              <div className="actual-box">
                <div className="v-lbl">実績(千円)</div>
                <div className="fraction-num">¥{Math.floor(Number(budget.newProfitSum) / 1000).toFixed(0)}</div>
              </div>
              {/* 右側下段：予算 */}
              <div className="budget-box">
                <div className="v-lbl">予算(千円)</div>
                <div className="fraction-num">¥{Math.floor(Number(budget.newProfitBudget) /1000).toFixed(0)}</div>
              </div>
            </div>

            <div className="progress-wrapper">
              <div className="prog-info">
                <span className="v-lbl" style={{ marginBottom: 0 }}>当月実績(千円): ¥{Math.floor(Number(budget.newProfitSumThismonth) /1000).toFixed(0)}</span>
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
              {/* 左側：達成率 */}
              <div className="achievement-rate">
                <div className="v-lbl">達成率</div>
                <div className="rate-num">{Number(budget.profitPoint).toFixed(0)}<span className="percent-mark">%</span></div>
              </div>
              {/* 右側上段：実績 */}
              <div className="actual-box">
                <div className="v-lbl">実績(千円)</div>
                <div className="fraction-num">¥{Math.floor(Number(budget.profitSum) / 1000).toFixed(0)}</div>
              </div>
              {/* 右側下段：予算 */}
              <div className="budget-box">
                <div className="v-lbl">予算(千円)</div>
                <div className="fraction-num">¥{Math.floor(Number(budget.profitBudget) / 1000).toFixed(0)}</div>
              </div>
            </div>

            <div className="progress-wrapper">
              <div className="prog-info">
                <span className="v-lbl" style={{ marginBottom: 0 }}>当月実績(千円): ¥{Math.floor(Number(budget.profitSumThismonth) /1000).toFixed(0)}</span>
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
  );
}
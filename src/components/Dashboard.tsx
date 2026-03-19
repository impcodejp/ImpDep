// src\components\Dashboard.tsx

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import SidePanel from "./SidePanel";
import MainPanel from "./MainPanel";
import "./Dashboard.css";

export interface DashboardBudget {
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

  if (!summary) return <div className="loading">Loading...</div>;

  return (
    <div className="dash-root">
      
      {/* 💡 ヘッダーを削除し、トグルボタンのみ絶対配置で残します */}
      <button 
        className={`toggle-schedule-btn ${isScheduleVisible ? 'active' : ''}`}
        onClick={() => setIsScheduleVisible(!isScheduleVisible)}
      >
        <span className="icon">📅</span> 
        {isScheduleVisible ? 'Schedule On' : 'Schedule Off'}
      </button>

      <div className="dash-grid-container">
        
        {/* 💡 MainPanelにPropsを追加 */}
        <MainPanel 
          summary={summary} 
          budget={budget} 
          loadThreshold={loadThreshold} 
          viewDate={viewDate}
          onChangeMonth={changeMonth}
        />

        <SidePanel 
          isVisible={isScheduleVisible}
          summary={summary}
          onDoubleClick={handleDoubleClick}
        />

      </div>
    </div>
  );
}
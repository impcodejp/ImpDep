// src/pages/LoadTransitionReport.tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./LoadTransitionReport.css";

interface MonthlyLoadSummary {
  yearMonth: string;
  projectCount: number; // 💡 追加：稼働案件数
  totalLoad: string;
}

export default function LoadTransitionReport() {
  const [summaries, setSummaries] = useState<MonthlyLoadSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const defaultStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const futureDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);
  const defaultEnd = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

  const [startMonth, setStartMonth] = useState(defaultStart);
  const [endMonth, setEndMonth] = useState(defaultEnd);

  const fetchTransition = async () => {
    if (!startMonth || !endMonth) return;
    if (startMonth > endMonth) {
      alert("開始月は終了月以前を指定してください。");
      return;
    }

    setLoading(true);
    try {
      const data = await invoke<MonthlyLoadSummary[]>("get_monthly_load_transition", {
        startMonth,
        endMonth
      });
      setSummaries(data);
    } catch (error) {
      console.error("負荷推移データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransition();
  }, []);

  return (
    <div className="detail-full-screen">
      <div className="report-container">
        <div className="report-header">
          <h2>🗓️ 請負負荷推移表</h2>
          <p>※各月で割振り済みかつ、その月1日時点で未計上となっている案件の負荷合計推移です。</p>
        </div>

        <div className="report-search-bar">
          <div className="search-group">
            <label className="form-label" style={{ margin: 0 }}>開始月:</label>
            <input 
              type="month" 
              className="form-input" 
              value={startMonth} 
              onChange={(e) => setStartMonth(e.target.value)} 
            />
          </div>
          <span className="bold">〜</span>
          <div className="search-group">
            <label className="form-label" style={{ margin: 0 }}>終了月:</label>
            <input 
              type="month" 
              className="form-input" 
              value={endMonth} 
              onChange={(e) => setEndMonth(e.target.value)} 
            />
          </div>
          <button 
            className="retro-btn primary" 
            onClick={fetchTransition}
            disabled={loading}
          >
            {loading ? "集計中..." : "推移を表示"}
          </button>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th className="text-center">対象月</th>
                <th className="text-right">稼働案件数</th>
                <th className="text-right">合計負荷値 (LOAD)</th>
              </tr>
            </thead>
            <tbody>
              {!loading && summaries.length > 0 ? (
                summaries.map((s, index) => {
                  // 負荷値の計算
                  const currentLoad = Number(s.totalLoad);
                  let diffLoadStr = "";
                  let diffLoadClass = "";
                  
                  // 案件数の計算
                  const currentCount = s.projectCount;
                  let diffCountStr = "";
                  let diffCountClass = "";
                  
                  // 前の月が存在する場合のみ差分を計算
                  if (index > 0) {
                    // 負荷値の差分
                    const prevLoad = Number(summaries[index - 1].totalLoad);
                    const diffLoad = currentLoad - prevLoad;
                    if (Math.abs(diffLoad) > 0.001) {
                      const sign = diffLoad > 0 ? "+" : "";
                      diffLoadStr = `(${sign}${diffLoad.toFixed(2)})`;
                      diffLoadClass = diffLoad > 0 ? "plus" : "minus";
                    }

                    // 案件数の差分
                    const prevCount = summaries[index - 1].projectCount;
                    const diffCount = currentCount - prevCount;
                    if (diffCount !== 0) {
                      const sign = diffCount > 0 ? "+" : "";
                      diffCountStr = `(${sign}${diffCount})`;
                      diffCountClass = diffCount > 0 ? "plus" : "minus";
                    }
                  }

                  return (
                    <tr key={s.yearMonth}>
                      <td className="text-center bold month-label">
                        {s.yearMonth}
                      </td>
                      
                      {/* 💡 追加：稼働案件数の列 */}
                      <td className="text-right">
                        <div className="bold" style={{ fontSize: "1.2em", color: "#555" }}>
                          {currentCount} <span style={{ fontSize: "0.8em" }}>件</span>
                        </div>
                        <div className={`diff-value ${diffCountClass}`}>
                          {diffCountStr || "\u00A0"}
                        </div>
                      </td>

                      <td className="text-right">
                        <div className="bold load-value">
                          {currentLoad.toFixed(2)}
                        </div>
                        <div className={`diff-value ${diffLoadClass}`}>
                          {diffLoadStr || "\u00A0"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : !loading && (
                <tr>
                  <td colSpan={3} className="no-data">
                    集計データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
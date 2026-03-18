import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ProjectList.css";

interface ProjectWithClient {
  id: number;
  projectName: string;
  clientName: string;
  salesAmount: string;
  grossProfitAmount: string;
  currentScheduledDate: string;
  status: string;
  burdenRatio: number;
  loadValue: number;
  rootType: string;
}

const STATUS_OPTIONS = ["割振済", "着手", "検収合意", "送付済", "完了"];

// 💡 ソート用の型定義
type SortKey = keyof ProjectWithClient;
type SortOrder = "asc" | "desc";

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  
  // 検索フィルター用のState
  const [searchClient, setSearchClient] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [monthFrom, setMonthFrom] = useState("");
  const [monthTo, setMonthTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(STATUS_OPTIONS);

  // 💡 ソート用のState（初期値は計上予定日の昇順など、必要に応じて変更可）
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await invoke<ProjectWithClient[]>("get_projects");
      setProjects(data);
    } catch (error) {
      console.error("案件一覧の取得に失敗:", error);
    }
  };

  const toggleStatus = (status: string) => {
    setStatusFilter((prev) => 
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // 1. 絞り込み（フィルタリング）
  const filteredProjects = projects.filter((p) => {
    if (searchClient && !p.clientName.toLowerCase().includes(searchClient.toLowerCase())) return false;
    if (searchProject && !p.projectName.toLowerCase().includes(searchProject.toLowerCase())) return false;
    if (!statusFilter.includes(p.status)) return false;
    
    const pMonth = p.currentScheduledDate ? p.currentScheduledDate.substring(0, 7) : "";
    if (monthFrom && pMonth < monthFrom) return false;
    if (monthTo && pMonth > monthTo) return false;

    return true; 
  });

  // 💡 2. 並び替え（ソート）
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig) return 0; // ソート指定がなければそのまま

    const { key, order } = sortConfig;
    let valA: string | number = a[key];
    let valB: string | number = b[key];

    // 金額や数値の列は、文字列から数値に変換して比較する
    if (key === "salesAmount" || key === "grossProfitAmount" || key === "id") {
      valA = Number(valA);
      valB = Number(valB);
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

  // 💡 ヘッダーをクリックした時のソート設定処理
  const handleSort = (key: SortKey) => {
    let direction: SortOrder = "asc";
    // 同じ列をクリックしたら昇順/降順を切り替える
    if (sortConfig && sortConfig.key === key && sortConfig.order === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, order: direction });
  };

  const handleDoubleClick = async (id: number) => {
    try {
      await invoke("open_project_detail_window", { id });
    } catch (error) {
      console.error("詳細ウィンドウの展開に失敗:", error);
    }
  };

  const displayRootType = (typeCode: string) => {
    if (typeCode === "N") return "新規";
    if (typeCode === "A") return "追加";
    return typeCode;
  };

  // ソートの矢印アイコンを表示するヘルパー
  const renderSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return <span className="sort-icon-placeholder" />;
    return <span className="sort-icon">{sortConfig.order === "asc" ? "▲" : "▼"}</span>;
  };

  return (
    <main className="main-container">
      <div className="tab-content project-list-tab">
        
        <header className="list-tab-header">
          <div className="header-title-area">
            <h1 className="list-tab-title">案件進捗一覧</h1>
            <p className="list-tab-note">※行をダブルクリックすると詳細・編集画面が開きます</p>
          </div>
        </header>

        {/* フィルター条件（変更なし） */}
        <fieldset className="native-fieldset filter-panel">
          <legend>フィルター条件</legend>
          <div className="filter-rows">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">案件名</label>
                <input type="text" className="native-input filter-input" value={searchProject} onChange={(e) => setSearchProject(e.target.value)} placeholder="部分一致" />
              </div>
              <div className="filter-group">
                <label className="filter-label">取引先名</label>
                <input type="text" className="native-input filter-input" value={searchClient} onChange={(e) => setSearchClient(e.target.value)} placeholder="部分一致" />
              </div>
              <div className="filter-group">
                <label className="filter-label">計上予定月</label>
                <div className="date-range-group">
                  <input type="month" className="native-input filter-input" value={monthFrom} onChange={(e) => setMonthFrom(e.target.value)} />
                  <span className="range-tilde">〜</span>
                  <input type="month" className="native-input filter-input" value={monthTo} onChange={(e) => setMonthTo(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-group status-filter-group">
                <label className="filter-label">ステータス</label>
                <div className="checkbox-wrap-row">
                  {STATUS_OPTIONS.map((status) => (
                    <label key={status} className="filter-checkbox-label">
                      <input type="checkbox" checked={statusFilter.includes(status)} onChange={() => toggleStatus(status)} />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {/* リスト表示エリア */}
        <div className="list-table-container">
          <table className="modern-list-table">
            <thead>
              {/* 💡 各ヘッダーに onClick と className="sortable" を追加 */}
              <tr>
                <th className="col-date sortable" onClick={() => handleSort("currentScheduledDate")}>
                  計上予定日 {renderSortIcon("currentScheduledDate")}
                </th>
                <th className="col-root text-center sortable" onClick={() => handleSort("rootType")}>
                  ルート {renderSortIcon("rootType")}
                </th>
                <th className="col-p-name sortable" onClick={() => handleSort("projectName")}>
                  案件名 {renderSortIcon("projectName")}
                </th>
                <th className="col-c-name sortable" onClick={() => handleSort("clientName")}>
                  取引先 {renderSortIcon("clientName")}
                </th>
                <th className="col-money text-right sortable" onClick={() => handleSort("salesAmount")}>
                  売上金額 {renderSortIcon("salesAmount")}
                </th>
                <th className="col-money text-right sortable" onClick={() => handleSort("grossProfitAmount")}>
                  粗利金額 {renderSortIcon("grossProfitAmount")}
                </th>
                <th className="col-status text-center sortable" onClick={() => handleSort("status")}>
                  ステータス {renderSortIcon("status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 💡 filteredProjects ではなく sortedProjects を展開 */}
              {sortedProjects.length > 0 ? (
                sortedProjects.map((p) => (
                  <tr key={p.id} onDoubleClick={() => handleDoubleClick(p.id)} className="clickable-row">
                    <td className="col-date date-text">{p.currentScheduledDate}</td>
                    <td className="col-root text-center">
                      <span className={`root-badge ${p.rootType === "A" ? "badge-add" : "badge-new"}`}>
                        {displayRootType(p.rootType)}
                      </span>
                    </td>
                    <td className="col-p-name bold-text">{p.projectName}</td>
                    <td className="col-c-name">{p.clientName}</td>
                    <td className="col-money text-right money-text">¥{Number(p.salesAmount).toLocaleString()}</td>
                    <td className="col-money text-right money-text">¥{Number(p.grossProfitAmount).toLocaleString()}</td>
                    <td className="col-status text-center">
                      <span className="status-badge" data-status={p.status}>{p.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-data">該当する案件が見つかりません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
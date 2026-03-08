import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ProjectList.css";

interface ProjectWithClient {
  id: number;
  projectName: string;
  clientName: string;
  salesAmount: number;
  grossProfitAmount: number;
  currentScheduledDate: string;
  status: string;
  burdenRatio: number;
  loadValue: number;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 検索用

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

  // 💡 取引先名でフィルタリングするロジック
  const filteredProjects = projects.filter((p) =>
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 💡 ダブルクリック時の処理（Rust側のコマンドを呼ぶ）
  const handleDoubleClick = async (id: number) => {
    try {
      await invoke("open_project_detail_window", { id });
    } catch (error) {
      console.error("詳細ウィンドウの展開に失敗:", error);
    }
  };

  return (
    <div className="project-list-container">
      <div className="list-header">
        <h2>📈 案件進捗一覧</h2>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="取引先名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="project-table">
          <thead>
            <tr>
              <th>計上予定日</th>
              <th>案件名</th>
              <th>取引先</th>
              <th className="text-right">売上金額</th>
              <th className="text-right">粗利金額</th>
              <th className="text-center">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onDoubleClick={() => handleDoubleClick(p.id)} // 💡 ダブルクリックイベント
                  className="clickable-row"
                  title="ダブルクリックで詳細を開く"
                >
                  <td>{p.currentScheduledDate}</td>
                  <td className="bold">{p.projectName}</td>
                  <td>{p.clientName}</td>
                  <td className="text-right">¥{p.salesAmount.toLocaleString()}</td>
                  <td className="text-right">¥{p.grossProfitAmount.toLocaleString()}</td>
                  <td className="text-center">
                    <span className={`status-badge ${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-data">
                  該当する案件が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="list-footer">※ 行をダブルクリックすると詳細・編集画面が開きます</p>
    </div>
  );
}
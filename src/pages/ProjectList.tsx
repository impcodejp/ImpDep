// src/pages/ProjectList.tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./ProjectList.css"; // 💡 専用のCSSを読み込みます

// Rust側の構造体と合わせるためのインターフェース
interface Project {
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // データをロードする関数
  const loadProjects = async () => {
    try {
      setLoading(true);
      // Rustのコマンド "get_projects" を呼び出す
      const data = await invoke<Project[]>("get_projects");
      setProjects(data);
    } catch (error) {
      console.error("案件データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントが表示された時に一度だけ実行
  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="project-list-container">
      <div className="list-header">
        <h2 className="list-title">案件進捗一覧</h2>
        <button className="refresh-button" onClick={loadProjects}>
          🔄 更新
        </button>
      </div>

      {loading ? (
        <div className="loading-message">読み込み中...</div>
      ) : (
        <div className="table-wrapper">
          <table className="project-table">
            <thead>
              <tr>
                <th className="col-date">予定日</th>
                <th className="col-name">案件名</th>
                <th className="col-client">取引先</th>
                <th className="col-amount">売上金額</th>
                <th className="col-amount">粗利金額</th>
                <th className="col-ratio">負担%</th>
                <th className="col-load">負荷</th>
                <th className="col-status">状態</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">登録されている案件はありません</td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id}>
                    <td className="text-center">{p.currentScheduledDate}</td>
                    <td className="project-name-cell" title={p.projectName}>
                      {p.projectName}
                    </td>
                    <td title={p.clientName}>{p.clientName}</td>
                    <td className="text-right">
                      ¥{Math.floor(p.salesAmount).toLocaleString()}
                    </td>
                    <td className="text-right">
                      ¥{Math.floor(p.grossProfitAmount).toLocaleString()}
                    </td>
                    <td className="text-center">{(p.burdenRatio * 100).toFixed(1)}%</td>
                    <td className="text-center">{p.loadValue}</td>
                    <td className="text-center">
                      <span className={`status-badge ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* 💡 合計行などを将来的に追加する場合はここへ <tfoot> を入れると綺麗です */}
          </table>
        </div>
      )}
    </div>
  );
}
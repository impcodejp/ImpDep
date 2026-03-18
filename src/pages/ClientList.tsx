import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import "./ClientList.css";

interface Client {
  id: number;
  clientCode: string;
  clientName: string;
  usegali: boolean;
  useml: boolean;
  usexro: boolean;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);

  // 画面が開いた時に全件取得する
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await invoke<Client[]>("get_all_clients");
        setClients(data);
      } catch (error) {
        console.error("一覧取得エラー:", error);
      }
    };
    fetchClients();
  }, []);

  // 行をダブルクリックした時の処理
  const handleRowDoubleClick = async (clientCode: string) => {
    try {
      await invoke("open_edit_window");
      setTimeout(async () => {
        await emit("load_client_for_edit", { code: clientCode });
      }, 500);
    } catch (error) {
      console.error("編集画面の展開エラー:", error);
    }
  };

  return (
    /* 💡 MenuやDashboardと同じ、アプリ共通のメインコンテナ構造を使用 */
    <main className="main-container">
      <div className="tab-content client-list-tab">
        
        <header className="list-tab-header">
          <h1 className="list-tab-title">取引先一覧</h1>
          <p className="list-tab-note">※行をダブルクリックすると編集画面が開きます</p>
        </header>

        {/* リストを表示するモダンなカード領域 */}
        <div className="list-table-container">
          <table className="modern-list-table">
            <thead>
              <tr>
                <th className="col-code">コード</th>
                <th className="col-name">取引先名</th>
                <th className="col-system">利用システム</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr 
                  key={c.id} 
                  onDoubleClick={() => handleRowDoubleClick(c.clientCode)}
                  className="clickable-row"
                >
                  <td className="col-code code-text">{c.clientCode}</td>
                  <td className="col-name">{c.clientName}</td>
                  <td className="col-system">
                    <div className="sys-badges">
                      {c.usegali && <span className="sys-badge badge-gali">Galileopt</span>}
                      {c.useml && <span className="sys-badge badge-ml">MJSLINK</span>}
                      {c.usexro && <span className="sys-badge badge-xro">Xronos</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </main>
  );
}
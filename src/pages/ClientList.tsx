// src/pages/ClientList.tsx
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event"; // 💡 ウィンドウ間通信の機能

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

  // 💡 行をダブルクリックした時の処理
  const handleRowDoubleClick = async (clientCode: string) => {
    try {
      // 1. まず編集ウィンドウを開く（既に開いていれば手前に持ってくる）
      await invoke("open_edit_window");

      // 2. ウィンドウが立ち上がる時間を少しだけ待ってから、「このコードを読み込んで！」とメッセージを送信
      setTimeout(async () => {
        await emit("load_client_for_edit", { code: clientCode });
      }, 500);

    } catch (error) {
      console.error("編集画面の展開エラー:", error);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ fontFamily: "var(--font-family-retro)", color: "var(--accent-color)" }}>
        取引先一覧
      </h2>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>※行をダブルクリックすると編集画面が開きます</p>

      {/* 簡単なテーブルデザイン（App.cssの世界観に合わせて枠線をつけます） */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "3px solid var(--border-color)", backgroundColor: "#fff" }}>
        <thead style={{ backgroundColor: "#dcdcdc", borderBottom: "3px solid var(--border-color)" }}>
          <tr>
            <th style={{ padding: "10px", borderRight: "1px dashed var(--border-color)" }}>コード</th>
            <th style={{ padding: "10px", borderRight: "1px dashed var(--border-color)" }}>取引先名</th>
            <th style={{ padding: "10px" }}>利用システム</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr 
              key={c.id} 
              onDoubleClick={() => handleRowDoubleClick(c.clientCode)}
              style={{ borderBottom: "1px dashed var(--border-color)", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f8ff"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <td style={{ padding: "10px", textAlign: "center", borderRight: "1px dashed var(--border-color)", fontWeight: "bold" }}>
                {c.clientCode}
              </td>
              <td style={{ padding: "10px", borderRight: "1px dashed var(--border-color)" }}>
                {c.clientName}
              </td>
              <td style={{ padding: "10px", textAlign: "center", fontSize: "0.85rem" }}>
                {c.usegali && <span style={{ marginRight: "5px", color: "#00a3ee" }}>[Galileopt]</span>}
                {c.useml && <span style={{ marginRight: "5px", color: "#00f000" }}>[MJSLINK]</span>}
                {c.usexro && <span style={{ marginRight: "5px", color: "#ff8800" }}>[Xronos]</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
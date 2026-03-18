import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./SidePanel.css";

export interface DashboardSummary {
  monthlySalesPlan: string;
  monthlySalesActual: string;
  monthlyProfitPlan: string;
  monthlyProfitActual: string;
  upcomingProjects: any[];
  loadValueSum: number;
}

interface Todo {
  id: number;
  title: string;
  endDate: string; // 💡 Rust側の #[serde(rename_all = "camelCase")] が必須です
  endFlag: boolean;
  weightLabel: string;
}

interface SidePanelProps {
  isVisible: boolean;
  summary: DashboardSummary;
  onDoubleClick: (id: number) => Promise<void>;
}

export default function SidePanel({ isVisible, summary, onDoubleClick }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'todo'>('schedule');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodo, setLoadingTodo] = useState(false);

  // --- 新規タスク入力用のステート ---
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState("中");

  const getWeightClass = (label: string) => {
    switch (label) {
      case '高': return 'weight-high';
      case '中': return 'weight-mid';
      case '低': return 'weight-low';
      default: return 'weight-default';
    }
  };

  const loadTodos = async () => {
    setLoadingTodo(true);
    try {
      const data = await invoke<Todo[]>("get_todo");
      // console.log("Debug Todo Data:", data); // 💡 何かあればここでデータを確認できます
      setTodos(data || []);
    } catch (e) {
      console.error("Failed to load todos:", e);
    } finally {
      setLoadingTodo(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await invoke("add_todo", { 
        payload: {
          title: newTitle, 
          endDate: newDate, 
          weightLabel: newWeight,
          endFlag: false
        }
      });
      setNewTitle("");
      loadTodos();
    } catch (e) {
      console.error("Failed to add todo:", e);
    }
  };

  const handleTodoClick = async (todo: Todo) => {
    if (todo.endFlag) return;
    const confirmed = window.confirm(`「${todo.title}」を完了にしますか？`);
    if (confirmed) {
      try {
        // Rust側の payload 定義に合わせて id を送信
        await invoke("update_todo_status", { payload: {id: todo.id }});
        loadTodos();
      } catch (e) {
        console.error("Failed to update todo:", e);
      }
    }
  };

  useEffect(() => {
    if (isVisible && activeTab === 'todo') {
      loadTodos();
    }
  }, [isVisible, activeTab]);

  if (!isVisible) return null;

  return (
    <div className="modern-card dash-right-panel">
      <div className="side-panel-tabs">
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</button>
        <button className={`tab-btn ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>To-Do</button>
      </div>

      <div className="schedule-wrap">
        {activeTab === 'schedule' ? (
          <table className="modern-table">
            <thead>
              <tr><th>Date</th><th>Project</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center' }}>Status</th></tr>
            </thead>
            <tbody>
              {summary.upcomingProjects.map((p) => (
                <tr key={p.id} className={p.status === '完了' ? 'completed' : ''} onDoubleClick={() => onDoubleClick(p.id)}>
                  <td className="date-col">{(p.currentScheduledDate || "").slice(5).replace('-', '/')}</td>
                  <td><div className="p-name">{p.projectName}</div><div className="p-client">{p.clientName}</div></td>
                  <td style={{ textAlign: 'right' }} className="date-col">{(Number(p.salesAmount) / 10000).toFixed(1)}w</td>
                  <td style={{ textAlign: 'center' }}><span className={`badge badge-${p.status === '完了' ? 'done' : 'active'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="todo-container">
            <form className="todo-input-form" onSubmit={handleAddTodo}>
              <div className="input-row-top">
                <input type="text" className="todo-quick-input" placeholder="タスク名を入力..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="input-row-bottom">
                <input type="date" className="todo-date-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                <select className="todo-select-input" value={newWeight} onChange={(e) => setNewWeight(e.target.value)}>
                  <option value="高">重要：高</option><option value="中">重要：中</option><option value="低">重要：低</option>
                </select>
                <button type="submit" className="todo-add-btn">追加</button>
              </div>
            </form>

            {loadingTodo ? (
              <div className="todo-loading">Loading...</div>
            ) : (
              <ul className="todo-list">
                {todos.map((todo) => (
                  <li key={todo.id} className={`todo-item clickable ${todo.endFlag ? 'done' : ''}`} onClick={() => handleTodoClick(todo)}>
                    <div className="todo-check-area"><input type="checkbox" checked={todo.endFlag} readOnly /></div>
                    <div className="todo-main-content">
                      <div className="todo-title-row">
                        <span className="todo-title">{todo.title}</span>
                        <span className={`todo-weight-badge ${getWeightClass(todo.weightLabel)}`}>{todo.weightLabel}</span>
                      </div>
                    </div>
                    <div className="todo-date-area">
                      {/* 💡 ?. を使って undefined エラーを防止 */}
                      <span className="todo-date">{todo.endDate?.replace(/-/g, '/') || '--/--'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./SoftwareInfoSection.css";

// --- 型定義 ---
export interface SoftwareInfo {
  id: number;
  clientId: number;
  useZaimu: boolean;
  useSaimu: boolean;
  useSaiken: boolean;
  useSisan: boolean;
  useKyuyo: boolean;
  useJinji: boolean;
  useHanbai: boolean;
  useOther: string | null;
  details: TreeNode[];
}

export interface TreeNode {
  id: string;
  label: string;
  value?: string;
  isGroup: boolean;
  children?: TreeNode[];
}

interface Props {
  clientId: number;
  softwareInfo: SoftwareInfo | null;
  onRefreshRequested: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ==========================================
// 🌿 編集用コンポーネント (TreeRow - DnDなし)
// ==========================================
function TreeRow({ node, onChange, onAddSibling, onAddChild, onRemove }: any) {
  return (
    <div className="tree-row-container">
      <div className="tree-row-inputs">
        <div className="tree-row-actions">
          <button type="button" onClick={() => onAddSibling(node.id)} title="同じ階層に追加">➕</button>
          {!node.isGroup && <button type="button" onClick={() => onAddChild(node.id)} title="グループ化">📁</button>}
          <button type="button" className="danger-btn" onClick={() => onRemove(node.id)} title="削除">🗑️</button>
        </div>

        <input 
          type="text" 
          className="native-input tree-input-label" 
          value={node.label} 
          onChange={(e) => onChange(node.id, "label", e.target.value)} 
          placeholder="項目名" 
        />
        
        {!node.isGroup ? (
          <input 
            type="text" 
            className="native-input tree-input-value" 
            value={node.value || ""} 
            onChange={(e) => onChange(node.id, "value", e.target.value)} 
            placeholder="内容" 
          />
        ) : (
          <span className="tree-group-badge">(グループ)</span>
        )}
      </div>
      
      {node.isGroup && node.children && (
        <div className="tree-children-container">
          {node.children.map((child: TreeNode) => (
            <TreeRow 
              key={child.id} node={child} 
              onChange={onChange} onAddSibling={onAddSibling} onAddChild={onAddChild} onRemove={onRemove} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 👁️ 閲覧用コンポーネント (TreePreview)
// ==========================================
function TreePreview({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul className="tree-preview-list" style={{ paddingLeft: depth === 0 ? "0" : "24px" }}>
      {nodes.map(node => (
        <li key={node.id} className="tree-preview-item">
          {node.isGroup ? (
            <div className="tree-preview-group"><span className="group-icon">■</span> {node.label || "(未設定グループ)"}</div>
          ) : (
            <div className="tree-preview-leaf">
              <span className="leaf-icon">・</span>
              <span className="leaf-label">{node.label || "(未設定項目)"} :</span>
              <span className="leaf-value">{node.value || ""}</span>
            </div>
          )}
          {node.isGroup && node.children && <TreePreview nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

// ==========================================
// 📦 メインコンポーネント
// ==========================================
export default function SoftwareInfoSection({ clientId, softwareInfo, onRefreshRequested, isOpen, onToggle }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    useZaimu: false, useSaimu: false, useSaiken: false, useSisan: false,
    useKyuyo: false, useJinji: false, useHanbai: false, useOther: ""
  });
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    if (softwareInfo) {
      const getB = (c: keyof SoftwareInfo, s: string) => softwareInfo[c] === true || (softwareInfo as any)[s] === 1;
      setFormData({
        useZaimu: getB("useZaimu", "use_zaimu"), useSaimu: getB("useSaimu", "use_saimu"), useSaiken: getB("useSaiken", "use_saiken"),
        useSisan: getB("useSisan", "use_sisan"), useKyuyo: getB("useKyuyo", "use_kyuyo"), useJinji: getB("useJinji", "use_jinji"),
        useHanbai: getB("useHanbai", "use_hanbai"), useOther: softwareInfo.useOther ?? (softwareInfo as any).use_other ?? ""
      });
      let d = softwareInfo.details;
      if (typeof d === "string") try { d = JSON.parse(d); } catch { d = []; }
      setTree(Array.isArray(d) && d.length > 0 ? d : [{ id: crypto.randomUUID(), label: "", value: "", isGroup: false }]);
    } else {
      setFormData({ useZaimu: false, useSaimu: false, useSaiken: false, useSisan: false, useKyuyo: false, useJinji: false, useHanbai: false, useOther: "" });
      setTree([{ id: crypto.randomUUID(), label: "", value: "", isGroup: false }]);
    }
  }, [softwareInfo]);

  // ツリー操作関数
  const handleTreeChange = (id: string, field: string, val: string) => {
    const update = (nodes: TreeNode[]): TreeNode[] => nodes.map(n => {
      if (n.id === id) return { ...n, [field]: val };
      return n.children ? { ...n, children: update(n.children) } : n;
    });
    setTree(prev => update(prev));
  };

  const handleAddSibling = (targetId: string) => {
    const insert = (nodes: TreeNode[]): TreeNode[] => {
      const index = nodes.findIndex(n => n.id === targetId);
      if (index !== -1) {
        const newNodes = [...nodes];
        newNodes.splice(index + 1, 0, { id: crypto.randomUUID(), label: "", value: "", isGroup: false });
        return newNodes;
      }
      return nodes.map(n => ({ ...n, children: n.children ? insert(n.children) : undefined }));
    };
    setTree(prev => insert(prev));
  };

  const handleAddChild = (targetId: string) => {
    const add = (nodes: TreeNode[]): TreeNode[] => nodes.map(n => {
      if (n.id === targetId) return { ...n, isGroup: true, children: [...(n.children || []), { id: crypto.randomUUID(), label: "", value: "", isGroup: false }] };
      return n.children ? { ...n, children: add(n.children) } : n;
    });
    setTree(prev => add(prev));
  };

  const handleRemove = (targetId: string) => {
    const rem = (nodes: TreeNode[]): TreeNode[] => nodes.map(n => {
      if (n.id === targetId) return null;
      return n.children ? { ...n, children: rem(n.children) } : n;
    }).filter(Boolean) as TreeNode[];
    setTree(prev => rem(prev));
  };

  const handleSave = async () => {
    try {
      await invoke("upsert_software_info", { info: { clientId, ...formData, details: tree } });
      alert("保存しました");
      setIsEditing(false);
      onRefreshRequested();
    } catch (err) { alert(`保存エラー: ${err}`); }
  };

  const hasNoData = tree.length === 0 || (tree.length === 1 && !tree[0].label && !tree[0].value && !tree[0].isGroup);

  return (
    <fieldset className="native-fieldset software-info-form">
      <legend onClick={onToggle} style={{ cursor: "pointer", userSelect: "none" }}>
        {isOpen ? "▼" : "▶"} ソフトウェア運用状況
      </legend>
      
      {isOpen && (
        <div className="section-content">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            {isEditing ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="native-btn secondary" onClick={() => { setIsEditing(false); onRefreshRequested(); }}>キャンセル</button>
                <button className="native-btn primary" onClick={handleSave}>💾 保存</button>
              </div>
            ) : (
              <button className="native-btn secondary" onClick={() => setIsEditing(true)}>✏️ 編集</button>
            )}
          </div>

          <div className="software-switches-grid">
            {Object.entries({ useZaimu: "財務", useSaimu: "債務", useSaiken: "債権", useSisan: "資産", useKyuyo: "給与", useJinji: "人事", useHanbai: "販売" }).map(([k, l]) => (
              <label key={k} className={`software-switch ${formData[k as keyof typeof formData] ? "active" : ""}`}>
                <input type="checkbox" checked={Boolean(formData[k as keyof typeof formData])} disabled={!isEditing} onChange={(e) => setFormData({...formData, [k]: e.target.checked})} /> {l}
              </label>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label className="form-label">その他モジュール等</label>
            <input type="text" className="native-input other-system-input" value={formData.useOther} disabled={!isEditing} onChange={(e) => setFormData({...formData, useOther: e.target.value})} placeholder="例）リース管理" />
          </div>

          <hr style={{ margin: "20px 0", border: "none", borderTop: "1px dashed #ccc" }} />

          <div className="tree-section">
            <label className="form-label">詳細情報</label>
            {isEditing ? (
              <div className="tree-editor-container">
                {tree.map(node => (
                  <TreeRow 
                    key={node.id} node={node} 
                    onChange={handleTreeChange} onAddSibling={handleAddSibling} onAddChild={handleAddChild} onRemove={handleRemove} 
                  />
                ))}
              </div>
            ) : (
              <div className="tree-viewer-container">
                {hasNoData ? <p className="no-data-text">登録なし</p> : <TreePreview nodes={tree} />}
              </div>
            )}
          </div>
        </div>
      )}
    </fieldset>
  );
}
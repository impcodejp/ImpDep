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
  useSisan: boolean; // 💡 追加
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

// 🌿 編集用コンポーネント
function TreeRow({ node, onChange, onAddSibling, onAddChild, onRemove }: any) {
  return (
    <div className="tree-row-container">
      <div className="tree-row-inputs">
        <span className="tree-drag-handle">≡</span>
        <input type="text" className="native-input tree-input-label" value={node.label} placeholder="項目名" onChange={(e) => onChange(node.id, "label", e.target.value)} />
        {!node.isGroup ? (
          <input type="text" className="native-input tree-input-value" value={node.value || ""} placeholder="内容" onChange={(e) => onChange(node.id, "value", e.target.value)} />
        ) : (
          <span className="tree-group-badge">(グループ)</span>
        )}
        <div className="tree-row-actions">
          <button type="button" onClick={() => onAddSibling(node.id)}>➕</button>
          {!node.isGroup && <button type="button" onClick={() => onAddChild(node.id)}>📁</button>}
          <button type="button" className="danger-btn" onClick={() => onRemove(node.id)}>🗑️</button>
        </div>
      </div>
      {node.isGroup && node.children && node.children.length > 0 && (
        <div className="tree-children-container">
          {node.children.map((child: TreeNode) => (
            <TreeRow key={child.id} node={child} onChange={onChange} onAddSibling={onAddSibling} onAddChild={onAddChild} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

// 👁️ 閲覧用コンポーネント
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

export default function SoftwareInfoSection({ clientId, softwareInfo, onRefreshRequested, isOpen, onToggle }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    useZaimu: false, useSaimu: false, useSaiken: false, useSisan: false,
    useKyuyo: false, useJinji: false, useHanbai: false,
    useOther: ""
  });
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    if (softwareInfo) {
      const safeGetBool = (camel: keyof SoftwareInfo, snake: string) => {
        const val = softwareInfo[camel] ?? (softwareInfo as any)[snake];
        return val === true || val === 1 || val === "true" || val === "1";
      };

      setFormData({
        useZaimu: safeGetBool("useZaimu", "use_zaimu"),
        useSaimu: safeGetBool("useSaimu", "use_saimu"),
        useSaiken: safeGetBool("useSaiken", "use_saiken"),
        useSisan: safeGetBool("useSisan", "use_sisan"), // 💡 追加
        useKyuyo: safeGetBool("useKyuyo", "use_kyuyo"),
        useJinji: safeGetBool("useJinji", "use_jinji"),
        useHanbai: safeGetBool("useHanbai", "use_hanbai"),
        useOther: softwareInfo.useOther ?? (softwareInfo as any).use_other ?? ""
      });

      let rawDetails = softwareInfo.details;
      if (typeof rawDetails === "string") {
        try { rawDetails = JSON.parse(rawDetails); } catch { rawDetails = []; }
      }
      setTree(Array.isArray(rawDetails) && rawDetails.length > 0 ? rawDetails : [{ id: crypto.randomUUID(), label: "", value: "", isGroup: false }]);
    } else {
      setFormData({ useZaimu: false, useSaimu: false, useSaiken: false, useSisan: false, useKyuyo: false, useJinji: false, useHanbai: false, useOther: "" });
      setTree([{ id: crypto.randomUUID(), label: "", value: "", isGroup: false }]);
    }
  }, [softwareInfo]);

  // 💡 修正：キャンセル時に再取得してリセット
  const handleCancel = () => {
    setIsEditing(false);
    onRefreshRequested(); 
  };

  const updateTree = (nodes: TreeNode[], id: string, updater: (node: TreeNode) => TreeNode | null): TreeNode[] => {
    return nodes.map(node => {
      if (node.id === id) return updater(node);
      if (node.children) {
        const updatedChildren = updateTree(node.children, id, updater).filter(Boolean) as TreeNode[];
        return { ...node, children: updatedChildren };
      }
      return node;
    }).filter(Boolean) as TreeNode[];
  };

  const handleTreeChange = (id: string, field: "label" | "value", value: string) => { setTree(prev => updateTree(prev, id, node => ({ ...node, [field]: value }))); };
  const handleAddSibling = (targetId: string) => {
    const insertSibling = (nodes: TreeNode[]): TreeNode[] => {
      const index = nodes.findIndex(n => n.id === targetId);
      if (index !== -1) {
        const newNodes = [...nodes];
        newNodes.splice(index + 1, 0, { id: crypto.randomUUID(), label: "", value: "", isGroup: false });
        return newNodes;
      }
      return nodes.map(n => ({ ...n, children: n.children ? insertSibling(n.children) : undefined }));
    };
    setTree(prev => insertSibling(prev));
  };
  const handleAddChild = (targetId: string) => {
    setTree(prev => updateTree(prev, targetId, node => ({ ...node, isGroup: true, value: undefined, children: [{ id: crypto.randomUUID(), label: "", value: "", isGroup: false }] })));
  };
  const handleRemove = (targetId: string) => { setTree(prev => updateTree(prev, targetId, () => null)); };

  const handleSave = async () => {
    try {
      await invoke("upsert_software_info", {
        info: {
          clientId: clientId,
          useZaimu: formData.useZaimu, useSaimu: formData.useSaimu, useSaiken: formData.useSaiken,
          useSisan: formData.useSisan, useKyuyo: formData.useKyuyo, useJinji: formData.useJinji, 
          useHanbai: formData.useHanbai, useOther: formData.useOther, details: tree
        }
      });
      alert("保存しました");
      setIsEditing(false);
      onRefreshRequested();
    } catch (err) { alert(`保存エラー: ${err}`); }
  };

  const hasNoData = tree.length === 0 || (tree.length === 1 && !tree[0].label && !tree[0].value && !tree[0].isGroup);
  const treeSummaryText = tree.map(node => node.label).filter(Boolean).join(", ").substring(0, 60);

  return (
    <fieldset className="native-fieldset software-info-form">
      <legend onClick={onToggle} style={{ cursor: "pointer", userSelect: "none" }}>
        {isOpen ? "▼" : "▶"} ソフトウェア運用状況
      </legend>
      
      {isOpen && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            {isEditing ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="native-btn secondary" onClick={handleCancel}>キャンセル</button>
                <button className="native-btn primary" onClick={handleSave}>💾 保存</button>
              </div>
            ) : (
              <button className="native-btn secondary" onClick={() => setIsEditing(true)}>✏️ 編集</button>
            )}
          </div>

          <div className="software-switches-grid">
            {/* 💡 修正：並び順を変更 */}
            {Object.entries({
              useZaimu: "財務", useSaimu: "債務", useSaiken: "債権", useSisan: "資産",
              useKyuyo: "給与", useJinji: "人事", useHanbai: "販売"
            }).map(([key, label]) => (
              <label key={key} className={`software-switch ${formData[key as keyof typeof formData] ? "active" : ""}`}>
                <input type="checkbox" checked={Boolean(formData[key as keyof typeof formData])} disabled={!isEditing} onChange={(e) => setFormData({...formData, [key]: e.target.checked})} />
                {label}
              </label>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label className="form-label">その他ソフトウェア・システム</label>
            <input type="text" className="native-input other-system-input" value={formData.useOther} disabled={!isEditing} onChange={(e) => setFormData({...formData, useOther: e.target.value})} placeholder="MJS以外の主要システム" />
          </div>

          <hr style={{ margin: "20px 0", border: "none", borderTop: "1px dashed #ccc" }} />

          <div className="form-group">
            <label className="form-label">詳細情報</label>
            {isEditing ? (
              <div className="tree-editor-container">
                {tree.map(node => <TreeRow key={node.id} node={node} onChange={handleTreeChange} onAddSibling={handleAddSibling} onAddChild={handleAddChild} onRemove={handleRemove} />)}
              </div>
            ) : (
              <div className="tree-viewer-container">
                {hasNoData ? <p className="no-data-text">登録なし</p> : (
                  <details className="tree-details">
                    <summary className="tree-summary-header"><span className="summary-text">{treeSummaryText || "(詳細)"}</span></summary>
                    <div className="tree-preview-wrapper"><TreePreview nodes={tree} /></div>
                  </details>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </fieldset>
  );
}
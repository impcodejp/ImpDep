import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/core"; // 💡 追加
import './BudgetSetting.css';

const BudgetSetting: React.FC = () => {
  const [formData, setFormData] = useState({
    start_date_of_application: '',
    gross_profit_budget: '',
    new_gross_profit_budget: '', 
    max_load_score: '',          
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 💡 確認ダイアログ（履歴が残るため、念のため）
    if (!window.confirm(`${formData.start_date_of_application} 適用分として保存しますか？`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 💡 Rust 側の save_budget_settings を呼び出し
      // input というキーの中に構造体をラップして渡します
      const response = await invoke<string>('save_budget_settings', {
        input: {
          start_date_of_application: parseInt(formData.start_date_of_application),
          gross_profit_budget: formData.gross_profit_budget,
          new_gross_profit_budget: formData.new_gross_profit_budget,
          max_load_score: formData.max_load_score,
        }
      });

      alert(response); // "予算設定を新規登録しました"
      
      // 保存成功後はダッシュボード（または前の画面）へ戻る
      window.history.back();
      
    } catch (error) {
      console.error('保存失敗:', error);
      alert(`保存に失敗しました: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <header>
        <h1>Fiscal Settings</h1>
        <div className="main-header">
          <h2>予算・負荷指針設定</h2>
        </div>
      </header>

      <div className="budget-container">
        <div className="budget-card">
          <div className="edit-form-title">Budget Entry</div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">適用開始年月</label>
              <input
                type="number"
                className="form-input"
                placeholder="202604"
                value={formData.start_date_of_application}
                onChange={(e) => setFormData({...formData, start_date_of_application: e.target.value})}
                required
                disabled={isSubmitting}
              />
              <p className="info-text">※YYYYMM形式で入力してください</p>
            </div>

            <div className="form-group">
              <label className="form-label">粗利計上予算</label>
              <div className="currency-input-wrapper">
                <input
                  type="number"
                  className="form-input number-align"
                  placeholder="0"
                  value={formData.gross_profit_budget}
                  onChange={(e) => setFormData({...formData, gross_profit_budget: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <span className="currency-unit">¥</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">新規粗利計上予算</label>
              <div className="currency-input-wrapper">
                <input
                  type="number"
                  className="form-input number-align"
                  placeholder="0"
                  value={formData.new_gross_profit_budget}
                  onChange={(e) => setFormData({...formData, new_gross_profit_budget: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <span className="currency-unit">¥</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">1人あたり最大負荷許容スコア</label>
              <div className="currency-input-wrapper">
                <input
                  type="number"
                  className="form-input number-align"
                  placeholder="100"
                  value={formData.max_load_score}
                  onChange={(e) => setFormData({...formData, max_load_score: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <span className="currency-unit">pts</span>
              </div>
              <p className="info-text">※これを超えるアサイン時に警告を表示します</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button 
                type="button" 
                className="retro-btn secondary" 
                style={{ flex: 1 }}
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                BACK
              </button>
              <button 
                type="submit" 
                className="submit-button" 
                style={{ flex: 2, marginTop: 0 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SAVING...' : 'SAVE BUDGET'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default BudgetSetting;
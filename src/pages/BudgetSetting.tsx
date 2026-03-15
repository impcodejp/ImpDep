import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/core";
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
    
    // 💡 適用開始年月がない場合はバリデーション
    if (!formData.start_date_of_application) {
      alert("適用開始年月は必須入力です。");
      return;
    }

    if (!window.confirm(`${formData.start_date_of_application} 適用分として保存しますか？`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 💡 空文字を null に変換するヘルパー関数
      const toNullable = (val: string) => (val.trim() === '' ? null : val);

      const response = await invoke<string>('save_budget_settings', {
        input: {
          start_date_of_application: parseInt(formData.start_date_of_application),
          // 💡 これらは任意入力（Null許容）
          gross_profit_budget: toNullable(formData.gross_profit_budget),
          new_gross_profit_budget: toNullable(formData.new_gross_profit_budget),
          max_load_score: toNullable(formData.max_load_score),
        }
      });

      alert(response);
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
            {/* 適用開始年月：これだけは必須 */}
            <div className="form-group">
              <label className="form-label">適用開始年月 <span style={{color: 'var(--accent-color)'}}>*</span></label>
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

            {/* 以下、任意項目（requiredを外しました） */}
            <div className="form-group">
              <label className="form-label">粗利計上予算</label>
              <div className="currency-input-wrapper">
                <input
                  type="number"
                  className="form-input number-align"
                  placeholder="未設定"
                  value={formData.gross_profit_budget}
                  onChange={(e) => setFormData({...formData, gross_profit_budget: e.target.value})}
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
                  placeholder="未設定"
                  value={formData.new_gross_profit_budget}
                  onChange={(e) => setFormData({...formData, new_gross_profit_budget: e.target.value})}
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
                  placeholder="未設定"
                  value={formData.max_load_score}
                  onChange={(e) => setFormData({...formData, max_load_score: e.target.value})}
                  disabled={isSubmitting}
                />
                <span className="currency-unit">pts</span>
              </div>
              <p className="info-text">※空欄の場合は、最新の設定値が維持されます</p>
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
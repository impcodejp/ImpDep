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
    
    if (!formData.start_date_of_application) {
      alert("適用開始年月は必須入力です。");
      return;
    }

    if (!window.confirm(`${formData.start_date_of_application} 適用分として保存しますか？`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const toNullable = (val: string) => (val.trim() === '' ? null : val);

      const response = await invoke<string>('save_budget_settings', {
        input: {
          start_date_of_application: parseInt(formData.start_date_of_application),
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
    <div className="native-window-container">
      <header className="native-window-header">
        <h1>予算・負荷指針設定</h1>
      </header>

      <div className="native-window-content">
        <form onSubmit={handleSubmit} className="native-form-body">
          <fieldset className="native-fieldset">
            <legend>Fiscal Settings</legend>

            {/* 適用開始年月：必須 */}
            <div className="form-group">
              <label className="form-label">適用開始年月 <span className="required-mark">*</span></label>
              <div className="input-with-note">
                <input
                  type="number"
                  className="native-input"
                  style={{ width: "160px" }}
                  placeholder="例: 202604"
                  value={formData.start_date_of_application}
                  onChange={(e) => setFormData({...formData, start_date_of_application: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <span className="info-text">※YYYYMM形式</span>
              </div>
            </div>

            {/* 以下、任意項目 */}
            <div className="form-group">
              <label className="form-label">粗利計上予算</label>
              <div className="native-currency-wrapper">
                <span className="currency-symbol">¥</span>
                <input
                  type="number"
                  className="native-input text-right"
                  placeholder="未設定"
                  value={formData.gross_profit_budget}
                  onChange={(e) => setFormData({...formData, gross_profit_budget: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">新規粗利計上予算</label>
              <div className="native-currency-wrapper">
                <span className="currency-symbol">¥</span>
                <input
                  type="number"
                  className="native-input text-right"
                  placeholder="未設定"
                  value={formData.new_gross_profit_budget}
                  onChange={(e) => setFormData({...formData, new_gross_profit_budget: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">1人あたり最大負荷許容スコア</label>
              <div className="native-currency-wrapper">
                <input
                  type="number"
                  className="native-input text-right"
                  placeholder="未設定"
                  value={formData.max_load_score}
                  onChange={(e) => setFormData({...formData, max_load_score: e.target.value})}
                  disabled={isSubmitting}
                />
                <span className="currency-unit">pts</span>
              </div>
              <p className="info-text-block">※空欄の場合は、最新の設定値が維持されます</p>
            </div>
          </fieldset>

          <div className="form-actions">
            <button 
              type="submit" 
              className="native-btn primary-save" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SAVING...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetSetting;
-- 1. 金額の変更
-- 既存の amount を売上金額（sales_amount）に変更し、粗利金額（gross_profit_amount）を追加
ALTER TABLE projects RENAME COLUMN amount TO sales_amount;
ALTER TABLE projects ADD COLUMN gross_profit_amount NUMERIC(15, 0) NOT NULL DEFAULT 0;

-- 2. 計上予定日の変更
-- 既存の scheduled_date を当初計上予定（original_scheduled_date）に変更し、現状の計上予定日を追加
ALTER TABLE projects RENAME COLUMN scheduled_date TO original_scheduled_date;
ALTER TABLE projects ADD COLUMN current_scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 3. 計上完了日の追加
-- Nullを許容するため NOT NULL は付けません
ALTER TABLE projects ADD COLUMN completed_date DATE;

-- 4. 負担割合の追加
-- 0〜1の間の小数点を保存。0未満や1より大きい数値が入らないようチェック制約（CHECK）を追加
ALTER TABLE projects ADD COLUMN burden_ratio NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (burden_ratio >= 0 AND burden_ratio <= 1);

-- 5. 負荷値の追加
-- 整数（INTEGER）で保存
ALTER TABLE projects ADD COLUMN load_value INTEGER NOT NULL DEFAULT 0;
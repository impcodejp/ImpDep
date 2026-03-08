-- 割り振り日カラムを追加
ALTER TABLE projects ADD COLUMN assigned_date DATE;

-- 既存データがある場合、とりあえず現在の予定日を入れて埋める（任意）
UPDATE projects SET assigned_date = current_scheduled_date 
WHERE assigned_date IS NULL;
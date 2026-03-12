-- ルート区分を追加
ALTER TABLE projects ADD COLUMN root_type TEXT;

-- 既存データがある場合、とりあえず「N」として埋める（任意）
UPDATE projects SET root_type = 'N' 
WHERE root_type IS NULL;
-- 不要になったカラムを削除
ALTER TABLE clients DROP COLUMN invoice_reg_number;
ALTER TABLE clients DROP COLUMN tax_calc_type;

-- 新しい真偽値（boolean）カラムを追加（デフォルトは false にしておきます）
ALTER TABLE clients ADD COLUMN usegali BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN useml BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN usexro BOOLEAN NOT NULL DEFAULT FALSE;
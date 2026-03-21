CREATE TABLE hard_user_info (
    id SERIAL PRIMARY KEY, -- 主キー(自動採番)
    hard_id INTEGER NOT NULL, -- ハードID(hard_infoとの紐づけ)
    uuid VARCHAR(50), -- UID
    pass VARCHAR(50), -- パスワード
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日時（登録時に現在時刻を自動設定）
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 更新日時（登録時に現在時刻を自動設定）
)
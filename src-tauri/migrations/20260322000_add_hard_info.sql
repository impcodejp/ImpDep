CREATE TABLE hard_info (
    id SERIAL PRIMARY KEY, -- 主キー（自動採番）
    client_id INTEGER NOT NULL, -- 顧客ID（内部コード：clientsテーブルと紐付け）
    hard_kbn INTEGER NOT NULL, -- ハード種別（1:サーバ 2:PC 3:その他ネットワーク機器）
    host_name VARCHAR(50), -- ホスト名（機器によっては不要なためNULL許可）
    ip inet, -- IPアドレス（inet型に変更。/24の有無どちらも対応可能）
    introduction_date DATE, -- 導入日（不明な機器もあるためNULL許可、小文字に統一）
    other_text TEXT, -- 備考（不要な場合もあるためNULL許可）
    status INTEGER DEFAULT 1, -- 稼働ステータス（例: 1:稼働中, 2:予備機, 3:廃棄済み / デフォルトを1に）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日時（登録時に現在時刻を自動設定）
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 更新日時（登録時に現在時刻を自動設定）
);

-- 1. client_code を数値型へ変更
ALTER TABLE clients
ALTER COLUMN client_code TYPE integer USING client_code::integer;

-- 2. my_user を新しく追加
ALTER TABLE clients
ADD COLUMN my_user BOOLEAN NOT NULL DEFAULT FALSE;
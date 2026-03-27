CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id), 
    contact_name VARCHAR(100) NOT NULL,
    tel_num VARCHAR(30),
    e_mail VARCHAR(255),
    bmn_name VARCHAR(100),
    del_kbn BOOLEAN DEFAULT false,
    -- タイムゾーン付きに変更
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
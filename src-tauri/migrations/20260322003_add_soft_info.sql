CREATE TABLE software_info (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL UNIQUE,
    use_zaimu BOOLEAN NOT NULL DEFAULT false,
    use_saimu BOOLEAN NOT NULL DEFAULT false,
    use_saiken BOOLEAN NOT NULL DEFAULT false,
    use_kyuyo BOOLEAN NOT NULL DEFAULT false,
    use_jinji BOOLEAN NOT NULL DEFAULT false,
    use_hanbai BOOLEAN NOT NULL DEFAULT false,
    use_other TEXT,
    details JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 予算マスタ初期値
CREATE TABLE todo (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL, 
    end_date DATE NOT NULL, 
    end_flag BOOLEAN, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) 

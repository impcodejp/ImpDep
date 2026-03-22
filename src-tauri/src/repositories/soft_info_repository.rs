use sqlx::PgPool;
use sqlx::types::Json; // 💡 追加
use crate::models::soft_info::{SoftwareInfo, UpsertSoftwareInfo};

pub async fn get_by_client_id(pool: &PgPool, client_id: i32) -> Result<Option<SoftwareInfo>, sqlx::Error> {
    sqlx::query_as!(
        SoftwareInfo,
        r#"
        SELECT 
            id, client_id, use_zaimu, use_saimu, use_saiken, use_sisan, -- 💡 ここに追加
            use_kyuyo, use_jinji, use_hanbai, use_other, 
            details as "details!: Json<serde_json::Value>"
        FROM software_info
        WHERE client_id = $1
        "#,
        client_id
    )
    .fetch_optional(pool)
    .await
}

pub async fn upsert(pool: &PgPool, info: UpsertSoftwareInfo) -> Result<i32, sqlx::Error> {
    // 💡 追加：DBに渡す前に Json ラッパーで包む
    let details_json = Json(info.details);

    let rec = sqlx::query!(
        r#"
        INSERT INTO software_info (
            client_id, use_zaimu, use_saimu, use_saiken, use_sisan,
            use_kyuyo, use_jinji, use_hanbai, use_other, details
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (client_id) DO UPDATE SET
            use_zaimu = EXCLUDED.use_zaimu,
            use_saimu = EXCLUDED.use_saimu,
            use_saiken = EXCLUDED.use_saiken,
            use_sisan = EXCLUDED.use_sisan,
            use_kyuyo = EXCLUDED.use_kyuyo,
            use_jinji = EXCLUDED.use_jinji,
            use_hanbai = EXCLUDED.use_hanbai,
            use_other = EXCLUDED.use_other,
            details = EXCLUDED.details,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        "#,
        info.client_id,
        info.use_zaimu,
        info.use_saimu,
        info.use_saiken,
        info.use_sisan,
        info.use_kyuyo,
        info.use_jinji,
        info.use_hanbai,
        info.use_other,
        details_json as _
    )
    .fetch_one(pool)
    .await?;

    Ok(rec.id)
}
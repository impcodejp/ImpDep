use sqlx::PgPool;
use crate::models::hard_info::{GetHardInfo, HardUserInfo, InsertHardInfo, InsertHardUserInfo};

pub async fn get_hard_info_by_client_id(pool: &PgPool, client_id: i32) -> Result<Vec<GetHardInfo>, sqlx::Error> {
    let records = sqlx::query_as!(
        GetHardInfo,
        r#"
        SELECT 
            id as "id!", 
            client_id as "client_id!", 
            hard_kbn as "hard_kbn!", 
            host_name, 
            ip::text as "ip?", 
            introduction_date, 
            other_text, 
            status as "status!"
        FROM hard_info
        WHERE client_id = $1
        ORDER BY hard_kbn ASC, id DESC
        "#,
        client_id
    )
    .fetch_all(pool)
    .await?;

    Ok(records)
}

pub async fn get_user_info_by_hard_id(pool: &PgPool, hard_id: i32) -> Result<Vec<HardUserInfo>, sqlx::Error> {
    let records = sqlx::query_as!(
        HardUserInfo,
        r#"
        SELECT id, hard_id, uuid, pass, created_at, updated_at
        FROM hard_user_info
        WHERE hard_id = $1
        ORDER BY id ASC
        "#,
        hard_id
    )
    .fetch_all(pool)
    .await?;

    Ok(records)
}

pub async fn insert_hardware_with_users(
    pool: &PgPool,
    hard: InsertHardInfo,
    users: Vec<InsertHardUserInfo>,
) -> Result<(), sqlx::Error> {
    // トランザクションを開始
    let mut tx = pool.begin().await?;

    // 1. hard_info へのインサート (RETURNING id で採番されたIDを取得)
    // 💡 NULLIF を使って、フロントからの空文字("")をDBのNULLとして処理させます
    let inserted_hard = sqlx::query!(
        r#"
        INSERT INTO hard_info (client_id, hard_kbn, host_name, ip, introduction_date, other_text, status)
        VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, '')::inet, NULLIF($5, '')::date, NULLIF($6, ''), $7)
        RETURNING id
        "#,
        hard.client_id,
        hard.hard_kbn,
        hard.host_name,
        hard.ip,
        hard.introduction_date,
        hard.other_text,
        hard.status
    )
    .fetch_one(&mut *tx)
    .await?;

    // 2. ユーザー情報があれば、取得した hard_id を紐づけてインサート
    for user in users {
        sqlx::query!(
            r#"
            INSERT INTO hard_user_info (hard_id, uuid, pass)
            VALUES ($1, NULLIF($2, ''), NULLIF($3, ''))
            "#,
            inserted_hard.id,
            user.uuid,
            user.pass
        )
        .execute(&mut *tx)
        .await?;
    }

    // すべて成功したらコミット
    tx.commit().await?;
    Ok(())
}
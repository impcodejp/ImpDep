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
    let mut tx = pool.begin().await?;

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

    tx.commit().await?;
    Ok(())
}

pub async fn update_hard_user_info(
    pool: &PgPool,
    hard_id: i32,
    users: Vec<InsertHardUserInfo>,
) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    sqlx::query!(
        "DELETE FROM hard_user_info WHERE hard_id = $1",
        hard_id
    )
    .execute(&mut *tx)
    .await?;
    for user in users {
        sqlx::query!(
            r#"
            INSERT INTO hard_user_info (hard_id, uuid, pass)
            VALUES ($1, NULLIF($2, ''), NULLIF($3, ''))
            "#,
            hard_id,
            user.uuid,
            user.pass
        )
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}

pub async fn update_hardware_basic(
    pool: &PgPool,
    hard: InsertHardInfo,
) -> Result<(), sqlx::Error> {
    let hard_id = hard.id.expect("ID must be present for update");

    sqlx::query!(
        r#"
        UPDATE hard_info 
        SET hard_kbn = $1, host_name = NULLIF($2, ''), ip = NULLIF($3, '')::inet, 
            introduction_date = NULLIF($4, '')::date, other_text = NULLIF($5, ''), status = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        "#,
        hard.hard_kbn, hard.host_name, hard.ip, hard.introduction_date, hard.other_text, hard.status, hard_id
    )
    .execute(pool)
    .await?;
    Ok(())
}
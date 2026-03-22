use sqlx::{Pool, Postgres, Result};
use sqlx::PgPool;
use crate::models::client::{CreateClientInput, ClientResponse, UpdateClientInput};

pub async fn create_client(pool: &Pool<Postgres>, input: CreateClientInput) -> Result<()> {
    // 💡 INSERT文に other_system と $7 を追加
    sqlx::query!(
        r#"
        INSERT INTO clients (client_code, client_name, usegali, useml, usexro, my_user, other_system)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        input.client_code,
        input.client_name,
        input.usegali,
        input.useml,
        input.usexro,
        input.my_user,
        input.other_system,
    )
    .execute(pool)
    .await?;

    Ok(())
}

// 取引先コードで完全に一致するものを1件取得する関数
pub async fn get_client_by_code(pool: &PgPool, code: i32) -> Result<ClientResponse, sqlx::Error> {
    // 💡 SELECT句に other_system を追加
    let client = sqlx::query_as!(
        ClientResponse,
        r#"
        SELECT id, client_code, client_name, usegali, useml, usexro, my_user, other_system
        FROM clients
        WHERE client_code = $1
        "#,
        code
    )
    .fetch_one(pool)
    .await?;

    Ok(client)
}

// 取引先を更新する関数
pub async fn update_client(pool: &PgPool, input: UpdateClientInput) -> Result<(), sqlx::Error> {
    // 💡 SET句に other_system = $7 を追加し、WHERE条件を $8 に変更
    sqlx::query!(
        r#"
        UPDATE clients
        SET client_code = $1, client_name = $2, usegali = $3, useml = $4, usexro = $5, updated_at = CURRENT_TIMESTAMP, my_user = $6, other_system = $7
        WHERE id = $8
        "#,
        input.client_code,
        input.client_name,
        input.usegali,
        input.useml,
        input.usexro,
        input.my_user,
        input.other_system,
        input.id,
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn search_clients_by_name(pool: &PgPool, name: String) -> Result<Vec<ClientResponse>, sqlx::Error> {
    let search_term = format!("%{}%", name);
    
    // 💡 SELECT句に other_system を追加
    let clients = sqlx::query_as!(
        ClientResponse,
        r#"
        SELECT id, client_code, client_name, usegali, useml, usexro, my_user, other_system
        FROM clients
        WHERE client_name LIKE $1
        ORDER BY id
        "#,
        search_term
    )
    .fetch_all(pool)
    .await?;

    Ok(clients)
}

// 取引先を全件取得する関数
pub async fn get_all_clients(pool: &PgPool) -> Result<Vec<ClientResponse>, sqlx::Error> {
    // 💡 SELECT句に other_system を追加
    let clients = sqlx::query_as!(
        ClientResponse,
        r#"
        SELECT id, client_code, client_name, usegali, useml, usexro, my_user, other_system
        FROM clients
        ORDER BY client_code
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(clients)
}
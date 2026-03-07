use sqlx::{Pool, Postgres, Result};
use sqlx::PgPool;
use crate::models::client::{CreateClientInput, ClientResponse, UpdateClientInput};

pub async fn create_client(pool: &Pool<Postgres>, input: CreateClientInput) -> Result<()> {
    // SQLを実行してデータを挿入します
    sqlx::query!(
        r#"
        INSERT INTO clients (client_code, client_name, usegali, useml, usexro)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        input.client_code,
        input.client_name,
        input.usegali,
        input.useml,
        input.usexro
    )
    .execute(pool)
    .await?;

    Ok(())
}

// 取引先コードで完全に一致するものを1件取得する関数
pub async fn get_client_by_code(pool: &PgPool, code: String) -> Result<ClientResponse, sqlx::Error> {
    let client = sqlx::query_as!(
        ClientResponse,
        r#"
        SELECT id, client_code, client_name, usegali, useml, usexro
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
    sqlx::query!(
        r#"
        UPDATE clients
        SET client_code = $1, client_name = $2, usegali = $3, useml = $4, usexro = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        "#,
        input.client_code,
        input.client_name,
        input.usegali,
        input.useml,
        input.usexro,
        input.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn search_clients_by_name(pool: &PgPool, name: String) -> Result<Vec<ClientResponse>, sqlx::Error> {
    // "%" で囲むことで、名前の一部が含まれていればヒットする「部分一致（LIKE検索）」にします
    let search_term = format!("%{}%", name);
    
    let clients = sqlx::query_as!(
        ClientResponse,
        r#"
        SELECT id, client_code, client_name, usegali, useml, usexro
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
    let clients = sqlx::query_as!(
        ClientResponse,
        r#"
        SELECT id, client_code, client_name, usegali, useml, usexro
        FROM clients
        ORDER BY client_code
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(clients)
}
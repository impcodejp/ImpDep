use sqlx::{Pool, Postgres, Result};
use crate::models::client::CreateClientInput;

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
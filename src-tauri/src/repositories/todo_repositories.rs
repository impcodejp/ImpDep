use sqlx::PgPool;
use crate::models::todo::{ AddTodo, EndTodo, GetTodo };

pub async fn get_todo(pool: &PgPool) -> Result<Vec<GetTodo>, sqlx::Error> {
    let rows = sqlx::query_as!(
        GetTodo,
        r#"
        SELECT
            t.id as id,
             t.title as title,
             t.end_date as end_date,
             t.end_flag as "end_flag!",
             t.weight_label as weight_label
        FROM todo t
        WHERE t.end_flag = false
        ORDER BY t.end_date ASC
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(rows)
}

pub async fn add_todo(pool: &PgPool, input: AddTodo) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO todo (title, end_date, weight_label, end_flag)
        VALUES ($1, TO_DATE($2, 'yyyy-mm-dd'), $3, $4)
        "#,
        input.title,
        input.end_date,
        input.weight_label,
        input.end_flag
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn complete_todo(pool: &PgPool, input:EndTodo) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        UPDATE todo
        SET end_flag = true
        WHERE id = $1
        "#,
        input.id
    )
    .execute(pool)
    .await?;

    Ok(())
}
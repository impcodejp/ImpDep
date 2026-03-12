use sqlx::{Pool, Postgres, Result};
use crate::models::project_change_log::CreateProjectChangeLogInput;

pub async fn add_project_change_log(
    pool: &Pool<Postgres>, input: CreateProjectChangeLogInput
) -> Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO schedule_change_logs (project_id, old_scheduled_date, new_scheduled_date, change_reason)
        VALUES ($1, $2, $3, $4)
        "#,
        input.project_id,
        input.old_scheduled_date,
        input.new_scheduled_date,
        input.change_reason
    )
    .execute(pool)
    .await?;

    sqlx::query!(
        r#"
        UPDATE projects
        SET current_scheduled_date = $1
        WHERE id = $2
        "#,
        input.new_scheduled_date,
        input.project_id
    )
    .execute(pool)
    .await?;

    Ok(())
    
}

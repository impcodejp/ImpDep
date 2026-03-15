use sqlx::PgPool;
use crate::models::budget::BudgetInput;

pub async fn create_budget_setting(
    pool: &PgPool,
    input: BudgetInput,
) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO budget (
            start_date_of_application, 
            gross_profit_budget, 
            new_gross_profit_budget, 
            max_load_score
        )
        VALUES ($1, $2, $3, $4)
        "#,
        input.start_date_of_application,
        input.gross_profit_budget,
        input.new_gross_profit_budget,
        input.max_load_score
    )
    .execute(pool)
    .await?;

    Ok(())
}
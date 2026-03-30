use sqlx::PgPool;
use crate::models::budget::{ BudgetInput, GetBudget };

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

pub async fn get_budget_by_period(
    pool: &PgPool,
    target_month: i32, // "20240801" 形式
) -> Result<GetBudget, sqlx::Error> {

    let budget_row = sqlx::query_as!(
        GetBudget,
        r#"
        SELECT 
            (SELECT max_load_score FROM budget 
             WHERE start_date_of_application <= $1 AND max_load_score IS NOT NULL 
             ORDER BY start_date_of_application DESC, id DESC LIMIT 1) as max_load_score,
             
            (SELECT gross_profit_budget FROM budget 
             WHERE start_date_of_application <= $1 AND gross_profit_budget IS NOT NULL 
             ORDER BY start_date_of_application DESC, id DESC LIMIT 1) as gross_profit_budget,
             
            (SELECT new_gross_profit_budget FROM budget 
             WHERE start_date_of_application <= $1 AND new_gross_profit_budget IS NOT NULL 
             ORDER BY start_date_of_application DESC, id DESC LIMIT 1) as new_gross_profit_budget
        "#,
        target_month
    )
    .fetch_one(pool)
    .await?;

    Ok(budget_row)
}


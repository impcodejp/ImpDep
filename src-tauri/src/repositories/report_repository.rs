// src-tauri/src/repositories/report_repository.rs
use sqlx::PgPool;
use crate::models::report::MonthlyLoadSummary;
use chrono::NaiveDate;

pub async fn get_monthly_load_transition(
    pool: &PgPool,
    start_month: &str, // "YYYY-MM"
    end_month: &str,   // "YYYY-MM"
) -> Result<Vec<MonthlyLoadSummary>, sqlx::Error> {
    
    let start_date_str = format!("{}-01", start_month);
    let end_date_str = format!("{}-01", end_month);

    let start_date = NaiveDate::parse_from_str(&start_date_str, "%Y-%m-%d")
        .map_err(|_| sqlx::Error::Decode("開始月の形式が不正です".into()))?;
    let end_date = NaiveDate::parse_from_str(&end_date_str, "%Y-%m-%d")
        .map_err(|_| sqlx::Error::Decode("終了月の形式が不正です".into()))?;

    let summaries = sqlx::query_as!(
        MonthlyLoadSummary,
        r#"
        WITH months AS (
            SELECT generate_series(
                $1::DATE, 
                $2::DATE, 
                '1 month'::interval
            )::DATE as month_start
        )
        SELECT 
            TO_CHAR(m.month_start, 'YYYY-MM') as "year_month!",
            -- 💡 変更：負荷値（load_value）が0より大きい案件のIDだけをカウントする
            COUNT(CASE WHEN p.load_value > 0 THEN p.id END) as "project_count!", 
            COALESCE(SUM(p.load_value * p.burden_ratio), 0) as "total_load!"
        FROM months m
        LEFT JOIN projects p 
            ON p.assigned_date IS NOT NULL 
            AND p.assigned_date < m.month_start + INTERVAL '1 month'
            AND p.current_scheduled_date >= m.month_start
        GROUP BY m.month_start
        ORDER BY m.month_start
        "#,
        start_date, 
        end_date    
    )
    .fetch_all(pool)
    .await?;

    Ok(summaries)
}
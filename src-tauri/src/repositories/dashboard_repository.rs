// src-tauri/src/repositories/dashboard_repository.rs
use chrono::NaiveDate;
use sqlx::PgPool;
use sqlx::types::BigDecimal;
use crate::models::dashboard::DashboardBudget;

pub async fn get_summary_by_period(
    pool: &PgPool,
    start_date: NaiveDate,
    end_date: NaiveDate,
    target_month: String, // "20240801" 形式
) -> Result<DashboardBudget, sqlx::Error> {
    
    // 1. 実績集計はそのまま
    let stats = sqlx::query!(
        r#"
        SELECT 
            COALESCE(SUM(CASE WHEN root_type = 'new' THEN gross_profit_amount ELSE 0 END), 0) as "new_actual_profit!",
            COALESCE(SUM(gross_profit_amount), 0) as "actual_profit!"
        FROM projects
        WHERE completed_date >= $1
          AND completed_date <= $2
        "#,
        start_date,
        end_date
    )
    .fetch_one(pool)
    .await?;

    // 2. 予算取得用の数値変換 (20240801 -> 202408)
    let full_date_val: i32 = target_month.parse().unwrap_or(0);
    let target_yyyymm: i32 = full_date_val / 100;

    // 3. 各項目ごとに「指定月以前で最新の非Null値」を取得する
    // サブクエリを使って、項目ごとにバラバラのタイミングで入った最新値を統合します
    let budget_row = sqlx::query!(
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
        target_yyyymm
    )
    .fetch_one(pool)
    .await?;

    // 4. 計算と詰め込み
    let zero = BigDecimal::from(0);
    let calculate_point = |actual: &BigDecimal, budget: &BigDecimal| {
        if budget == &zero {
            BigDecimal::from(0)
        } else {
            (actual * BigDecimal::from(100)) / budget
        }
    };

    // 全ての項目が1つも存在しない場合を考慮してデフォルト値を設定
    let b_load = budget_row.max_load_score.unwrap_or(BigDecimal::from(100));// 負荷閾値デフォルト 100
    let b_profit = budget_row.gross_profit_budget.unwrap_or_else(|| zero.clone());
    let b_new_profit = budget_row.new_gross_profit_budget.unwrap_or_else(|| zero.clone());

    Ok(DashboardBudget {
        load_point: BigDecimal::from(b_load),
        profit_sum: stats.actual_profit.clone(),
        profit_budget: b_profit.clone(),
        profit_point: calculate_point(&stats.actual_profit, &b_profit),
        new_profit_sum: stats.new_actual_profit.clone(),
        new_profit_budget: b_new_profit.clone(),
        new_profit_point: calculate_point(&stats.new_actual_profit, &b_new_profit),
    })
}
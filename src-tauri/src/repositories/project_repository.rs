use sqlx::PgPool;
use sqlx::{Pool, Postgres};
use crate::models::project::{ ProjectWithClient, ProjectDateHistory, ProjectWithClient2};
use crate::models::dashboard::DashboardSummary;
use sqlx::types::BigDecimal; 
use std::str::FromStr;
use chrono::NaiveDate;

/// 新規案件作成
pub async fn create_project(
    pool: &PgPool,
    name: &str,
    client_id: i32,
    sales_bd: BigDecimal,   // 💡 f64 から BigDecimal に変更
    profit_bd: BigDecimal,  // 💡 f64 から BigDecimal に変更
    date_str: &str,
    ratio: f64,
    load: f64,
    assigned_date_str: &str,
    root_type: &str,
) -> Result<(), sqlx::Error> {
    let date = NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
        .expect("Invalid date format");

    let assigned_date = NaiveDate::parse_from_str(assigned_date_str, "%Y-%m-%d")
        .expect("Invalid assigned date format");

    // 💡 不要になった sales_bd と profit_bd の変換処理を削除しました

    let ratio_bd = BigDecimal::from_str(&ratio.to_string()).unwrap_or_default();
    
    let load_i32 = load as i32; 

    sqlx::query!(
        r#"
        INSERT INTO public.projects (
            project_name, client_id, sales_amount, gross_profit_amount,
            original_scheduled_date, current_scheduled_date,
            status, burden_ratio, load_value, created_at, updated_at, assigned_date, root_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10, $11)
        "#,
        name,
        client_id,
        sales_bd,   // 💡 そのまま渡す
        profit_bd,  // 💡 そのまま渡す
        date,
        date,
        "割振済",
        ratio_bd,
        load_i32,
        assigned_date,
        root_type
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// 案件詳細の更新
pub async fn update_project_details(
    pool: &PgPool,
    id: i32,
    project_name: String,
    sales_amount: BigDecimal,
    gross_profit_amount: BigDecimal,
    status: String,
    root_type: Option<String>,
    burden_ratio: BigDecimal,
    load_value: BigDecimal,
    assigned_date: Option<NaiveDate>,
    completed_date: Option<NaiveDate>,
) -> Result<(), sqlx::Error> {
    let load_i32 = load_value.to_string().parse::<i32>().unwrap_or_default();

    sqlx::query!(
        r#"
        UPDATE projects
        SET 
            project_name = $1,
            sales_amount = $2,
            gross_profit_amount = $3,
            status = $4,
            root_type = $5,
            burden_ratio = $6,
            load_value = $7,
            assigned_date = $8,
            completed_date = $9,
            updated_at = NOW()
        WHERE id = $10
        "#,
        project_name,         // $1
        sales_amount,         // $2
        gross_profit_amount,  // $3
        status,               // $4
        root_type,            // $5
        burden_ratio,         // $6
        load_i32,             // $7
        assigned_date,        // $8
        completed_date,       // $9
        id                    // $10
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// 全案件取得
pub async fn get_all_projects(pool: &PgPool) -> Result<Vec<ProjectWithClient>, sqlx::Error> {
    sqlx::query_as!(
        ProjectWithClient,
        r#"
        SELECT 
            p.id, p.project_name, c.client_name, p.sales_amount, 
            p.gross_profit_amount, p.current_scheduled_date, 
            p.status, p.burden_ratio, p.load_value
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        ORDER BY p.current_scheduled_date ASC
        "#
    )
    .fetch_all(pool)
    .await
}

/// ダッシュボード用集計（変更なし）
pub async fn get_dashboard_summary(
    pool: &PgPool, 
    target_month: &str
) -> Result<DashboardSummary, sqlx::Error> {
    let month_start = format!("{}-01", target_month);

    let stats = sqlx::query!(
        r#"
        SELECT 
            COALESCE(SUM(sales_amount), 0) as "total_plan!",
            COALESCE(SUM(CASE WHEN status IN ('完了') THEN sales_amount ELSE 0 END), 0) as "total_actual!",
            COALESCE(SUM(gross_profit_amount), 0) as "profit_plan!",
            COALESCE(SUM(CASE WHEN status IN ('完了') THEN gross_profit_amount ELSE 0 END), 0) as "profit_actual!"
        FROM projects
        WHERE current_scheduled_date >= TO_DATE($1, 'YYYY-MM-DD')
          AND current_scheduled_date < TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '1 month'
        "#,
        month_start
    )
    .fetch_one(pool)
    .await?;

    let projects = sqlx::query_as!(
        ProjectWithClient,
        r#"
        SELECT 
            p.id, p.project_name, c.client_name, p.sales_amount, 
            p.gross_profit_amount, p.current_scheduled_date,
            p.status, p.burden_ratio, p.load_value
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.current_scheduled_date >= TO_DATE($1, 'YYYY-MM-DD')
          AND p.current_scheduled_date < TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '1 month'
        ORDER BY p.current_scheduled_date ASC
        "#,
        month_start
    )
    .fetch_all(pool)
    .await?;

    let get_sum_load_value = sqlx::query!(
        r#"
        SELECT
            COALESCE(SUM(p.load_value * p.burden_ratio), 0) as "load_value_sum!"
        FROM projects p
        WHERE p.assigned_date IS NOT NULL 
          AND p.assigned_date < TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '1 month'
          AND p.current_scheduled_date >= TO_DATE($1, 'YYYY-MM-DD')
        "#,
        month_start
    )
    .fetch_one(pool)
    .await?;

    Ok(DashboardSummary {
        monthly_sales_plan: stats.total_plan,
        monthly_sales_actual: stats.total_actual,
        monthly_profit_plan: stats.profit_plan,
        monthly_profit_actual: stats.profit_actual,
        upcoming_projects: projects,
        load_value_sum: get_sum_load_value.load_value_sum,
    })
}

/// 変更履歴取得（変更なし）
pub async fn get_project_history(pool: &PgPool, project_id: i32) -> Result<Vec<ProjectDateHistory>, sqlx::Error> {
    let histories = sqlx::query_as!(
        ProjectDateHistory,
        r#"
        SELECT 
            id as "id!", 
            project_id as "project_id!", 
            old_scheduled_date as "old_date", 
            new_scheduled_date as "new_date!", 
            change_reason as "change_reason", 
            created_at as "changed_at!"
        FROM schedule_change_logs 
        WHERE project_id = $1 
        ORDER BY created_at DESC
        "#,
        project_id
    )
    .fetch_all(pool)
    .await?;
    
    Ok(histories)
}

/// ID指定で取得
pub async fn get_project_by_id(pool: &PgPool, id: i32) -> Result<ProjectWithClient2, sqlx::Error> {
    let project = sqlx::query_as!(
        ProjectWithClient2,
        r#"
        SELECT 
            p.id, p.project_name, c.client_name, p.sales_amount, 
            p.gross_profit_amount, p.current_scheduled_date, p.original_scheduled_date,
            p.status, p.root_type, p.burden_ratio, p.load_value, p.assigned_date, p.completed_date
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.id = $1
        "#,
        id
    )
    .fetch_one(pool)
    .await?;
    
    Ok(project)
}

pub async fn delete_project(pool: &Pool<Postgres>, id: i32) -> sqlx::Result<()> {
    sqlx::query!(
        r#"
        DELETE FROM projects
        WHERE id = $1
        "#,
        id
    )
    .execute(pool)
    .await?;

    Ok(())
}
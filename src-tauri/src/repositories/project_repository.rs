use sqlx::PgPool;
use crate::models::project::{ ProjectWithClient};
use crate::models::dashboard::DashboardSummary;
use sqlx::types::BigDecimal; // 💡 追加
use std::str::FromStr;    
    // 💡 追加

pub async fn create_project(
    pool: &PgPool,
    name: &str,
    client_id: i32,
    sales: f64,
    profit: f64,
    date_str: &str,
    ratio: f64,
    load: f64,
) -> Result<(), sqlx::Error> {
    let date = chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
        .expect("Invalid date format");

    // 💡 f64 を BigDecimal に変換（金額の精度を保つため）
 // 金額系は BigDecimal で
    let sales_bd = BigDecimal::from_str(&sales.to_string()).unwrap_or_default();
    let profit_bd = BigDecimal::from_str(&profit.to_string()).unwrap_or_default();
    let ratio_bd = BigDecimal::from_str(&ratio.to_string()).unwrap_or_default();
    
    // 💡 load_value が DB側で INTEGER なら、i32 に変換
    let load_i32 = load as i32; 

    sqlx::query!(
        r#"
        INSERT INTO public.projects (
            project_name, client_id, sales_amount, gross_profit_amount,
            original_scheduled_date, current_scheduled_date,
            status, burden_ratio, load_value, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        "#,
        name,
        client_id,
        sales_bd,
        profit_bd,
        date,
        date,
        "割振済",
        ratio_bd,
        load_i32
    )
    .execute(pool)
    .await?;

    Ok(())
}

// src/repositories/project_repository.rs に追加
pub async fn get_all_projects(pool: &sqlx::PgPool) -> Result<Vec<ProjectWithClient>, sqlx::Error> {
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

pub async fn get_dashboard_summary(pool: &PgPool) -> Result<DashboardSummary, sqlx::Error> {
    // 1. 集計データの取得
    let stats = sqlx::query!(
        r#"
        SELECT 
            COALESCE(SUM(sales_amount), 0) as "total_plan!",
            COALESCE(SUM(CASE WHEN status = '完了' THEN sales_amount ELSE 0 END), 0) as "total_actual!",
            COALESCE(SUM(gross_profit_amount), 0) as "profit_plan!",
            COALESCE(SUM(CASE WHEN status = '完了' THEN gross_profit_amount ELSE 0 END), 0) as "profit_actual!"
        FROM projects
        WHERE current_scheduled_date >= date_trunc('month', CURRENT_DATE)
          AND current_scheduled_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
        "#
    )
    .fetch_one(pool)
    .await?;

    // 2. 案件リストの取得
    // ※ 既存の get_all_projects を流用しても良いですが、ダッシュボード用に条件を絞るならここに書きます
    let projects = sqlx::query_as!(
        ProjectWithClient,
        r#"
        SELECT 
            p.id, p.project_name, c.client_name, p.sales_amount, 
            p.gross_profit_amount, p.current_scheduled_date, 
            p.status, p.burden_ratio, p.load_value
        FROM projects p
        JOIN clients c ON p.client_id = c.id
        WHERE p.current_scheduled_date >= date_trunc('month', CURRENT_DATE)
          AND p.current_scheduled_date < date_trunc('month', CURRENT_DATE) + interval '2 month'
        ORDER BY p.current_scheduled_date ASC
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(DashboardSummary {
        monthly_sales_plan: stats.total_plan,
        monthly_sales_actual: stats.total_actual,
        monthly_profit_plan: stats.profit_plan,
        monthly_profit_actual: stats.profit_actual,
        upcoming_projects: projects,
    })
}
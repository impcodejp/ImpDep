// services/summary_service.rs (既存の構造に合わせる)
use chrono::{Datelike, NaiveDate, Months};
use sqlx::types::BigDecimal;
use sqlx::PgPool;
use crate::models::budget::GetBudget;
use crate::utils::date_utils;
use crate::models::dashboard::DashboardBudget;
use crate::models::project::ActualProfit;
use crate::repositories::{ project_repository, budget_repository };


pub async fn get_dashboard_data_service(pool: &PgPool, input_yyyymmdd: &str) -> Result<DashboardBudget, String> {
    //
    // ダッシュボードのデータを取得するサービス関数
    // 入力された日付を基に、必要な期間のデータを取得し、計算して構造体にまとめる
    // 引数:
    // - pool: データベース接続プール
    // - input_yyyymmdd: ユーザーが入力した日付（YYYYMMDD形式）データ型: String
    
    // 1. 日付の準備
    //  型変換
    let parsed_date: NaiveDate = NaiveDate::parse_from_str(input_yyyymmdd, "%Y%m%d")
    .map_err(|_| format!("日付形式エラー: {} は YYYYMMDD 形式で入力してください", input_yyyymmdd))?;
    
    // その月の初日を取得
    let first_day = NaiveDate::from_ymd_opt(parsed_date.year(), parsed_date.month(), 1).unwrap();
    
    // その月の末日を取得（次の月の初日の前日）
    let target_end_date = first_day.checked_add_months(Months::new(1)).and_then(|d| d.pred_opt()).unwrap();
    
    // その月の初日から見た、期間の開始日を取得(utils_calculate_summary_periodを呼び出す)
    let (start_of_period, _) = date_utils::utils_calculate_summary_period(input_yyyymmdd)?;

    // 数値型のyyyymmを計算（予算取得のため）
    let target_yyyymm: i32 = first_day.year() * 100 + first_day.month() as i32;


    // 2. データの並列/順次取得
    // 期間累計の取得
    let summary: ActualProfit = project_repository::get_profit_sum_by_period(pool, start_of_period, target_end_date)
        .await.map_err(|e| e.to_string())?;

    // 単月実績の取得
    let summary_thismonth:ActualProfit = project_repository::get_profit_sum_by_period(pool, first_day, target_end_date)
        .await.map_err(|e| e.to_string())?;

    // 有効予算の取得
    let budget:GetBudget = budget_repository::get_budget_by_period(pool, target_yyyymm)
        .await.map_err(|e| e.to_string())?;

    // 3. 計算ロジック
    let zero = BigDecimal::from(0);
    let calculate_point = |actual: &BigDecimal, budget_val: &BigDecimal| {
        if budget_val == &zero {
            zero.clone()
        } else {
            (actual * BigDecimal::from(100)) / budget_val
        }
    };

    let b_load = budget.max_load_score.unwrap_or_else(|| BigDecimal::from(100));
    let b_profit = budget.gross_profit_budget.unwrap_or_else(|| zero.clone());
    let b_new_profit = budget.new_gross_profit_budget.unwrap_or_else(|| zero.clone());

    // 4. 構造体の組み立て
    Ok(DashboardBudget {
        load_point: b_load,
        profit_sum: summary.actual_profit_sum.clone(),
        profit_budget: b_profit.clone(),
        profit_point: calculate_point(&summary.actual_profit_sum, &b_profit),
        profit_sum_thismonth: summary_thismonth.actual_profit_sum.clone(),
        profit_point_thismonth: calculate_point(&summary_thismonth.actual_profit_sum, &b_profit),
        new_profit_sum: summary.new_actual_profit_sum.clone(),
        new_profit_budget: b_new_profit.clone(),
        new_profit_point: calculate_point(&summary.new_actual_profit_sum, &b_new_profit),
        new_profit_sum_thismonth: summary_thismonth.new_actual_profit_sum.clone(),
        new_profit_point_thismonth: calculate_point(&summary_thismonth.new_actual_profit_sum, &b_new_profit),
    })
}
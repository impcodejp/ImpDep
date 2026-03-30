// services/summary_service.rs (既存の構造に合わせる)
use chrono::{Datelike, NaiveDate};

/// 入力されたyyyymmddから、年度・半期の開始日と終了日を計算する（ロジックのみ）
pub fn utils_calculate_summary_period(input_yyyymmdd: &str) -> Result<(NaiveDate, NaiveDate), String> {
    let date = NaiveDate::parse_from_str(input_yyyymmdd, "%Y%m%d")
        .map_err(|_| "日付形式が正しくありません".to_string())?;

    let year = date.year();
    let month = date.month();

    let range = match month {
        4..=9 => (
            NaiveDate::from_ymd_opt(year, 4, 1).unwrap(),
            NaiveDate::from_ymd_opt(year, 9, 30).unwrap(),
        ),
        10..=12 => (
            NaiveDate::from_ymd_opt(year, 10, 1).unwrap(),
            NaiveDate::from_ymd_opt(year + 1, 3, 31).unwrap(),
        ),
        1..=3 => (
            NaiveDate::from_ymd_opt(year - 1, 10, 1).unwrap(),
            NaiveDate::from_ymd_opt(year, 3, 31).unwrap(),
        ),
        _ => unreachable!(),
    };

    Ok(range)
}

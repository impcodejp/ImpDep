use sqlx::PgPool;
use crate::models::contacts::{ContactInfo, AddAndUpdateContactInfo};

pub async fn get_contacts_info_by_client_id(
    pool: &PgPool,
    client_id: i32
) -> Result<Vec<ContactInfo>, sqlx::Error> {
    // 💡 修正点: query_as! の第1引数を戻り値と同じ型に変更
    let records = sqlx::query_as!(
        ContactInfo, 
        r#"
        SELECT 
            id,
            client_id,
            contact_name as name,       -- SQLのカラム名と構造体のフィールド名を一致させてください
            tel_num as tel_number, 
            e_mail,
            bmn_name,
            del_kbn
        FROM contacts
        WHERE client_id = $1 AND del_kbn = false
        "#,
        client_id
    )
    .fetch_all(pool)
    .await?;

    Ok(records) // 💡 修正点: records をそのまま返す
}

pub async fn upsert(pool: &PgPool, info: AddAndUpdateContactInfo) -> Result<String, sqlx::Error> {
    sqlx::query!(
        r#"
        INSERT INTO contacts (
            id,
            client_id,
            contact_name,
            tel_num,
            e_mail,
            bmn_name
        )
        VALUES (
            COALESCE($1, nextval('contacts_id_seq')),
            $2, $3, $4, $5, $6
        )
        ON CONFLICT (id) DO UPDATE SET
            client_id = EXCLUDED.client_id,
            contact_name = EXCLUDED.contact_name,
            tel_num = EXCLUDED.tel_num,
            e_mail = EXCLUDED.e_mail,
            bmn_name = EXCLUDED.bmn_name
        "#,
        info.id,          // $1
        info.client_id,   // $2
        info.name,        // $3 (構造体のフィールド名は name でOK)
        info.tel_number,  // $4 (構造体のフィールド名は tel_number でOK)
        info.e_mail,      // $5
        info.bmn_name     // $6
    )
    .execute(pool)
    .await?;

    Ok("保存が完了しました".into())
}
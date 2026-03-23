import "./ContactInfoSection.css"

export interface ContactInfo {
  id: number;
  clientId: number;
  name: string;
  telNumber: string;
  eMail: string;
  bmnName: string;
}

interface ContactInfoSectionProps {
  clientId: number;
  contactList: ContactInfo[];
  isLoading: boolean;
  onRefreshRequested: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ContactInfoSection({ 
  clientId, 
  contactList, 
  isLoading, 
  onRefreshRequested, // 必要に応じてお使いくださいね
  isOpen,
  onToggle
}: ContactInfoSectionProps) {

  return (
    <fieldset className="contact-info-section" data-client-id={clientId}>
      {/* 💡 親から渡された onToggle を実行します */}
      <legend 
        className="contact-info-section__legend"
        onClick={onToggle} 
      >
        <span className="contact-info-section__icon">{isOpen ? "▼" : "▶"}</span> 担当者情報
      </legend>
      
      {/* 💡 親から渡された isOpen で表示を切り替えます */}
      {isOpen && (
        <div className="contact-info-section__content">
          {isLoading ? (
            <p className="contact-info-section__message">読み込み中...</p>
          ) : (
            <>
              {/* 追加ボタン */}
              <div className="contact-info-section__header">
                <button 
                  className="contact-info-btn contact-info-btn--primary" 
                  onClick={() => console.log(`担当者追加パネルを開く (顧客ID: ${clientId})`)}
                >
                  ＋ 追加
                </button>
              </div>

              {/* データがない場合とある場合の表示 */}
              {contactList.length === 0 ? (
                <div className="contact-info-section__empty">
                  <p>担当者情報はありません。（対象顧客ID: {clientId}）</p>
                </div>
              ) : (
                <div className="contact-info-table-wrapper">
                  <table className="contact-info-table">
                    <thead>
                      <tr>
                        <th className="contact-info-table__th contact-info-table__th--name">名前</th>
                        <th className="contact-info-table__th">電話番号</th>
                        <th className="contact-info-table__th">メールアドレス</th>
                        <th className="contact-info-table__th">所属</th>
                      </tr>
                    </thead>
                    {/* 💡 tbodyの中でtrを回すように修正し、keyを追加しました */}
                    <tbody>
                      {contactList.map(contact => (
                        <tr className="contact-info-table__row" key={contact.id}>
                          <td className="contact-info-table__td">{contact.name}</td>
                          <td className="contact-info-table__td">{contact.telNumber}</td>
                          <td className="contact-info-table__td">{contact.eMail}</td>
                          <td className="contact-info-table__td">{contact.bmnName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </fieldset>
  );
}
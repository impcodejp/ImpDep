import "./SidePanel.css";

export function SidePanel({ projects, onDoubleClick }: { projects: any[], onDoubleClick: (id: number) => void }) {
  return (
    <div className="side-panel-wrapper">
      <h3 className="side-panel-header">SCHEDULE</h3>
      <div className="side-panel-scroll">
        <table className="side-retro-table">
          <thead>
            <tr><th>DATE</th><th>PROJECT</th><th className="text-right">AMT</th></tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} onDoubleClick={() => onDoubleClick(p.id)} className={p.status === '完了' ? 'is-done' : ''}>
                <td className="cell-date">{p.currentScheduledDate.slice(5)}</td>
                <td>
                  <div className="cell-pname">{p.projectName}</div>
                  <div className="cell-cname">{p.clientName}</div>
                </td>
                <td className="text-right">{(Number(p.salesAmount) / 10000).toFixed(1)}w</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
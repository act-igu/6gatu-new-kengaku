import type { StatusCode } from '../types';
import { ACTIVE_STATUSES } from '../types';
import type { Candidate } from '../types';

interface StatusPaneProps {
  selectedStatus: StatusCode;
  candidates: Candidate[];
  onSelectStatus: (code: StatusCode) => void;
}

export function StatusPane({
  selectedStatus,
  candidates,
  onSelectStatus,
}: StatusPaneProps) {
  const countByStatus = (code: StatusCode) =>
    candidates.filter((c) => c.status === code).length;

  return (
    <aside className="pane pane-status">
      <h2 className="pane-title">進捗ステータス</h2>
      <nav className="status-nav">
        <ul>
          {ACTIVE_STATUSES.map((status) => (
            <li key={status.code}>
              <button
                type="button"
                className={`status-item${selectedStatus === status.code ? ' active' : ''}`}
                onClick={() => onSelectStatus(status.code)}
              >
                <span>{status.label}</span>
                <span className="badge">{countByStatus(status.code)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="status-divider" />
        <div className="archive-section">
          <span className="archive-label">アーカイブ</span>
          <button type="button" className="status-item archive-item">
            <span>終了レコード</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

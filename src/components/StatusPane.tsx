import type { StatusCode } from '../types';
import { ACTIVE_STATUSES, ARCHIVED_STATUSES, isArchivedStatus } from '../types';
import type { Candidate } from '../types';

interface StatusPaneProps {
  selectedStatus: StatusCode;
  globalSearch: boolean;
  candidates: Candidate[];
  onSelectStatus: (code: StatusCode) => void;
}

export function StatusPane({
  selectedStatus,
  globalSearch,
  candidates,
  onSelectStatus,
}: StatusPaneProps) {
  const countByStatus = (code: StatusCode) =>
    candidates.filter((c) => c.status === code).length;

  const archivedTotal = ARCHIVED_STATUSES.reduce(
    (sum, s) => sum + countByStatus(s.code),
    0,
  );

  const viewingArchive = isArchivedStatus(selectedStatus);

  return (
    <aside className="pane pane-status">
      <h2 className="pane-title">進捗ステータス</h2>
      {globalSearch && (
        <p className="status-hint">全体検索モード（全ステータス対象）</p>
      )}
      <nav className="status-nav">
        <ul>
          {ACTIVE_STATUSES.map((status) => (
            <li key={status.code}>
              <button
                type="button"
                className={`status-item${
                  !globalSearch && selectedStatus === status.code ? ' active' : ''
                }`}
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
          {ARCHIVED_STATUSES.map((status) => (
            <button
              key={status.code}
              type="button"
              className={`status-item archive-item${
                !globalSearch && selectedStatus === status.code ? ' active' : ''
              }`}
              onClick={() => onSelectStatus(status.code)}
            >
              <span>{status.label}</span>
              <span className="badge archive-badge">
                {countByStatus(status.code)}
              </span>
            </button>
          ))}
          {archivedTotal > 0 && !viewingArchive && (
            <p className="archive-summary">終了計 {archivedTotal} 件</p>
          )}
        </div>
      </nav>
    </aside>
  );
}

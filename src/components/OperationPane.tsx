import { useEffect, useState } from 'react';
import type { Candidate, Role, StatusCode } from '../types';
import {
  ARCHIVED_STATUSES,
  DOCUMENT_CHECKLIST_STATUSES,
  getPreviousActiveStatus,
  getRecommendedNext,
  getStatusLabel,
  isArchivedStatus,
} from '../types';
import {
  countCheckedDocuments,
  documentDefinitions,
  formatDateTime,
  holdReasons,
  resolveDocumentLabel,
  resolveHoldReasonLabel,
  resolveStaffName,
  staffList,
} from '../data/mockData';
import { maskMemoBody } from '../utils/masking';
import { DuplicateBanner, ViewerNotice } from './SharedAlerts';

interface OperationPaneProps {
  candidate: Candidate | null;
  allCandidates: Candidate[];
  role: Role;
  onSave: (candidate: Candidate) => void;
  onStatusChange: (id: string, status: StatusCode) => void;
  onAppendMemo: (id: string, body: string) => void;
  onSelectDuplicate: (id: string) => void;
}

export function OperationPane({
  candidate,
  allCandidates,
  role,
  onSave,
  onStatusChange,
  onAppendMemo,
  onSelectDuplicate,
}: OperationPaneProps) {
  const [memoDraft, setMemoDraft] = useState('');
  const [showOtherStatuses, setShowOtherStatuses] = useState(false);
  const [showArchiveMenu, setShowArchiveMenu] = useState(false);
  const [followDraft, setFollowDraft] = useState<Candidate['follow_up'] | null>(
    null,
  );
  const [holdDraft, setHoldDraft] = useState<Candidate['hold'] | null>(null);
  const [docsDraft, setDocsDraft] = useState<Candidate['documents'] | null>(
    null,
  );
  const [followDirty, setFollowDirty] = useState(false);
  const isViewer = role === 'viewer';

  useEffect(() => {
    if (candidate) {
      setFollowDraft({ ...candidate.follow_up });
      setHoldDraft({ ...candidate.hold });
      setDocsDraft(structuredClone(candidate.documents));
      setFollowDirty(false);
      setMemoDraft('');
    } else {
      setFollowDraft(null);
      setHoldDraft(null);
      setDocsDraft(null);
      setFollowDirty(false);
    }
  }, [candidate?.id, candidate?.updated_at]);

  if (!candidate || !followDraft || !holdDraft || !docsDraft) {
    return (
      <section className="pane pane-operation">
        <h2 className="pane-title">運用</h2>
        <p className="empty-message">候補者を選択してください</p>
      </section>
    );
  }

  const recommended = getRecommendedNext(candidate.status);
  const previous = getPreviousActiveStatus(candidate.status);
  const isArchived = isArchivedStatus(candidate.status);
  const showDocuments = DOCUMENT_CHECKLIST_STATUSES.includes(candidate.status);
  const docsChecked = countCheckedDocuments(docsDraft);
  const docsTotal = docsDraft.length;

  const handleSaveFollowHold = () => {
    onSave({
      ...candidate,
      follow_up: followDraft,
      hold: holdDraft,
      documents: docsDraft,
    });
    setFollowDirty(false);
  };

  const toggleHold = () => {
    if (isViewer) return;
    setHoldDraft((prev) =>
      prev
        ? {
            ...prev,
            active: !prev.active,
            reason_code: !prev.active
              ? (prev.reason_code ?? 'WAIT_FAMILY')
              : prev.reason_code,
          }
        : prev,
    );
    setFollowDirty(true);
  };

  const toggleDocument = (code: string) => {
    if (isViewer) return;
    setDocsDraft((prev) =>
      prev
        ? prev.map((d) =>
            d.code === code
              ? {
                  ...d,
                  checked: !d.checked,
                  checked_at: !d.checked ? new Date().toISOString() : null,
                }
              : d,
          )
        : prev,
    );
    setFollowDirty(true);
  };

  return (
    <section className="pane pane-operation">
      <h2 className="pane-title">運用</h2>

      <ViewerNotice role={role} />
      <DuplicateBanner
        candidate={candidate}
        allCandidates={allCandidates}
        onSelectDuplicate={onSelectDuplicate}
      />

      <div className="op-section">
        <h3 className="section-title">ステータス操作</h3>
        <p className="current-status">
          現在のステータス: <strong>{getStatusLabel(candidate.status)}</strong>
        </p>
        {!isArchived && !isViewer && recommended && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onStatusChange(candidate.id, recommended)}
          >
            推奨: {getStatusLabel(recommended)}
          </button>
        )}
        {!isArchived && !isViewer && (
          <div className="other-status">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowOtherStatuses(!showOtherStatuses);
                setShowArchiveMenu(false);
              }}
            >
              他へ進む ▾
            </button>
            {showOtherStatuses && (
              <div className="dropdown-menu">
                {previous && (
                  <button
                    type="button"
                    onClick={() => {
                      onStatusChange(candidate.id, previous);
                      setShowOtherStatuses(false);
                    }}
                  >
                    前のステータスへ戻す（{getStatusLabel(previous)}）
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowArchiveMenu(!showArchiveMenu)}
                >
                  終了（アーカイブ）▸
                </button>
                {showArchiveMenu && (
                  <div className="dropdown-submenu">
                    {ARCHIVED_STATUSES.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => {
                          onStatusChange(candidate.id, s.code);
                          setShowOtherStatuses(false);
                          setShowArchiveMenu(false);
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {isViewer && !isArchived && (
          <p className="viewer-restricted">ステータス変更は編集者のみ可能です</p>
        )}
        {isArchived && (
          <p className="archived-notice">この候補者は終了済みです</p>
        )}
      </div>

      {showDocuments && (
        <div className="op-section">
          <div className="op-section-header">
            <h3 className="section-title">
              書類チェックリスト（{docsChecked}/{docsTotal}）
            </h3>
            {!isViewer && (
              <button
                type="button"
                className="btn-save-small"
                disabled={!followDirty}
                onClick={handleSaveFollowHold}
              >
                保存
              </button>
            )}
          </div>
          <ul className="document-checklist">
            {docsDraft.map((doc) => (
              <li key={doc.code} className="document-item">
                <label className="document-label">
                  <input
                    type="checkbox"
                    checked={doc.checked}
                    onChange={() => toggleDocument(doc.code)}
                    disabled={isViewer}
                  />
                  <span>{resolveDocumentLabel(doc.code)}</span>
                </label>
                {doc.checked && doc.checked_at && (
                  <span className="document-checked-at">
                    ✓ {formatDateTime(doc.checked_at)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {docsChecked < docsTotal && (
            <p className="document-hint">
              未回収:{' '}
              {docsDraft
                .filter((d) => !d.checked)
                .map((d) => documentDefinitions.find((x) => x.code === d.code)?.label)
                .join('、')}
            </p>
          )}
        </div>
      )}

      <div className="op-section">
        <div className="op-section-header">
          <h3 className="section-title">次回対応</h3>
          {!isViewer && (
            <button
              type="button"
              className="btn-save-small"
              disabled={!followDirty}
              onClick={handleSaveFollowHold}
            >
              保存
            </button>
          )}
        </div>
        <div className="field-row compact">
          <label className="field-label">次回対応日</label>
          <input
            type="date"
            value={followDraft.next_date ?? ''}
            onChange={(e) => {
              setFollowDraft((prev) =>
                prev
                  ? { ...prev, next_date: e.target.value || null }
                  : prev,
              );
              setFollowDirty(true);
            }}
            disabled={isViewer}
          />
        </div>
        <div className="field-row compact">
          <label className="field-label">メモ</label>
          <input
            type="text"
            placeholder="未設定"
            value={followDraft.next_note ?? ''}
            onChange={(e) => {
              setFollowDraft((prev) =>
                prev ? { ...prev, next_note: e.target.value || null } : prev,
              );
              setFollowDirty(true);
            }}
            disabled={isViewer}
          />
        </div>
        <div className="field-row compact">
          <label className="field-label">フォロー担当</label>
          <select
            value={followDraft.owner_staff_id ?? ''}
            onChange={(e) => {
              setFollowDraft((prev) =>
                prev
                  ? { ...prev, owner_staff_id: e.target.value || null }
                  : prev,
              );
              setFollowDirty(true);
            }}
            disabled={isViewer}
          >
            <option value="">未設定</option>
            {staffList
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.staff_id} value={s.staff_id}>
                  {s.display_name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="op-section">
        <h3 className="section-title">保留</h3>
        <div className="hold-control">
          <span className="hold-state">
            {holdDraft.active ? '保留中' : '保留なし'}
            {holdDraft.active && holdDraft.reason_code && (
              <span className="hold-reason-label">
                （{resolveHoldReasonLabel(holdDraft.reason_code)}）
              </span>
            )}
          </span>
          {!isViewer && (
            <button type="button" className="btn-outline" onClick={toggleHold}>
              {holdDraft.active ? '保留解除' : '保留にする'}
            </button>
          )}
        </div>
        {holdDraft.active && (
          <>
            <div className="field-row compact">
              <label className="field-label">保留理由</label>
              <select
                value={holdDraft.reason_code ?? ''}
                onChange={(e) => {
                  setHoldDraft((prev) =>
                    prev
                      ? { ...prev, reason_code: e.target.value || null }
                      : prev,
                  );
                  setFollowDirty(true);
                }}
                disabled={isViewer}
              >
                <option value="">選択してください</option>
                {holdReasons.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-row compact">
              <label className="field-label">保留メモ</label>
              <input
                type="text"
                placeholder="補足メモ"
                value={holdDraft.note ?? ''}
                onChange={(e) => {
                  setHoldDraft((prev) =>
                    prev ? { ...prev, note: e.target.value || null } : prev,
                  );
                  setFollowDirty(true);
                }}
                disabled={isViewer}
              />
            </div>
          </>
        )}
      </div>

      <div className="op-section memo-section">
        <h3 className="section-title">面談記録（追記のみ）</h3>
        <div className="memo-log">
          {candidate.memos.length === 0 && (
            <p className="memo-empty">記録はまだありません</p>
          )}
          {candidate.memos.map((memo) => (
            <div key={memo.entry_id} className="memo-entry">
              <span className="memo-meta">
                {formatDateTime(memo.occurred_at)}・
                {memo.contact_date && `接触日 ${memo.contact_date}・`}
                {resolveStaffName(memo.author_staff_id)}
              </span>
              <p className="memo-body">
                {maskMemoBody(memo.body, role)}
              </p>
            </div>
          ))}
        </div>
        {!isViewer && (
          <>
            <textarea
              className="memo-input"
              placeholder="追記メモ（内部用）"
              rows={3}
              value={memoDraft}
              onChange={(e) => setMemoDraft(e.target.value)}
            />
            <button
              type="button"
              className="btn-append"
              disabled={!memoDraft.trim()}
              onClick={() => {
                onAppendMemo(candidate.id, memoDraft.trim());
                setMemoDraft('');
              }}
            >
              追記する
            </button>
          </>
        )}
        {isViewer && (
          <p className="viewer-restricted">面談記録の追記は編集者のみ可能です</p>
        )}
      </div>

      <footer className="op-footer">
        <p>最終更新: {formatDateTime(candidate.updated_at)}（自動）</p>
        <p className="audit-note">
          ステータス変更・メモ追記・次回日更新は監査ログに記録されます
        </p>
      </footer>
    </section>
  );
}

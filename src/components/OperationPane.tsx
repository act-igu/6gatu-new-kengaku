import { useState } from 'react';
import type { Candidate } from '../types';
import { getRecommendedNext, getStatusLabel } from '../types';
import { formatDateTime, resolveStaffName } from '../data/mockData';

interface OperationPaneProps {
  candidate: Candidate | null;
}

export function OperationPane({ candidate }: OperationPaneProps) {
  const [memoDraft, setMemoDraft] = useState('');
  const [showOtherStatuses, setShowOtherStatuses] = useState(false);

  if (!candidate) {
    return (
      <section className="pane pane-operation">
        <h2 className="pane-title">第4ペイン — 運用</h2>
        <p className="empty-message">候補者を選択してください</p>
      </section>
    );
  }

  const recommended = getRecommendedNext(candidate.status);

  return (
    <section className="pane pane-operation">
      <h2 className="pane-title">第4ペイン — 運用</h2>

      <div className="op-section">
        <h3 className="section-title">ステータス操作</h3>
        <p className="current-status">
          現在のステータス: <strong>{getStatusLabel(candidate.status)}</strong>
        </p>
        {recommended && (
          <button type="button" className="btn-primary">
            推奨: {getStatusLabel(recommended)}
          </button>
        )}
        <div className="other-status">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowOtherStatuses(!showOtherStatuses)}
          >
            他へ進む ▾
          </button>
          {showOtherStatuses && (
            <div className="dropdown-menu">
              <button type="button">前のステータスへ戻す</button>
              <button type="button">終了（アーカイブ）</button>
            </div>
          )}
        </div>
      </div>

      <div className="op-section">
        <h3 className="section-title">次回対応</h3>
        <div className="field-row compact">
          <label className="field-label">次回対応日</label>
          <input
            type="date"
            defaultValue={candidate.follow_up.next_date ?? ''}
          />
        </div>
        <div className="field-row compact">
          <label className="field-label">メモ</label>
          <input
            type="text"
            placeholder="未設定"
            defaultValue={candidate.follow_up.next_note ?? ''}
          />
        </div>
        <div className="field-row compact">
          <label className="field-label">フォロー担当</label>
          <select defaultValue={candidate.follow_up.owner_staff_id ?? ''}>
            <option value="">未設定</option>
            <option value="7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60">
              山田（相談）
            </option>
          </select>
        </div>
      </div>

      <div className="op-section">
        <h3 className="section-title">保留</h3>
        <div className="hold-control">
          <span className="hold-state">
            {candidate.hold.active ? '保留中' : '保留なし'}
          </span>
          <button type="button" className="btn-outline">
            切り替え
          </button>
        </div>
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
                {resolveStaffName(memo.author_staff_id)}
              </span>
              <p className="memo-body">{memo.body}</p>
            </div>
          ))}
        </div>
        <textarea
          className="memo-input"
          placeholder="追記メモ（内部用）"
          rows={3}
          value={memoDraft}
          onChange={(e) => setMemoDraft(e.target.value)}
        />
        <button type="button" className="btn-append" disabled={!memoDraft.trim()}>
          追記する
        </button>
      </div>

      <footer className="op-footer">
        <p>
          最終更新: {formatDateTime(candidate.updated_at)}（自動）
        </p>
        <p className="audit-note">
          ステータス変更・メモ追記・次回日更新は監査ログに記録されます
        </p>
      </footer>
    </section>
  );
}

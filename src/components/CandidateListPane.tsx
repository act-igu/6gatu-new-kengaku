import { useState } from 'react';
import type { Candidate, FollowUpFilter, StatusCode } from '../types';
import { getStatusLabel, isArchivedStatus } from '../types';
import {
  CURRENT_STAFF_ID,
  formatDate,
  isOverdue,
  isToday,
  matchesSearchQuery,
  resolveHoldReasonLabel,
  resolveSiteTagLabels,
  resolveStaffName,
  resolveSupportCategoryLabel,
  siteTags,
} from '../data/mockData';
import { hasActiveDuplicateWarning } from '../utils/duplicates';

interface CandidateListPaneProps {
  selectedStatus: StatusCode;
  globalSearch: boolean;
  candidates: Candidate[];
  selectedId: string | null;
  onSelectCandidate: (id: string) => void;
}

const FILTERS: { key: FollowUpFilter; label: string }[] = [
  { key: 'hold', label: '保留のみ' },
  { key: 'today', label: '今日' },
  { key: 'overdue', label: '超過' },
  { key: 'unset', label: '未設定' },
  { key: 'mine', label: '自分担当' },
];

function matchesFilter(
  candidate: Candidate,
  filter: FollowUpFilter,
): boolean {
  switch (filter) {
    case 'hold':
      return candidate.hold.active;
    case 'today':
      return isToday(candidate.follow_up.next_date);
    case 'overdue':
      return isOverdue(candidate.follow_up.next_date);
    case 'unset':
      return !candidate.follow_up.next_date;
    case 'mine':
      return candidate.follow_up.owner_staff_id === CURRENT_STAFF_ID;
  }
}

export function CandidateListPane({
  selectedStatus,
  globalSearch,
  candidates,
  selectedId,
  onSelectCandidate,
}: CandidateListPaneProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FollowUpFilter>>(
    new Set(),
  );
  const [siteFilter, setSiteFilter] = useState<string | null>(null);

  const toggleFilter = (key: FollowUpFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const listTitle = globalSearch
    ? '候補者リスト（全体）'
    : '候補者リスト';

  const filtered = candidates
    .filter((c) => globalSearch || c.status === selectedStatus)
    .filter((c) => matchesSearchQuery(c, search))
    .filter((c) => !siteFilter || c.site_tags.includes(siteFilter))
    .filter((c) => {
      if (activeFilters.size === 0) return true;
      return [...activeFilters].every((f) => matchesFilter(c, f));
    })
    .sort((a, b) => {
      const dateA = a.follow_up.next_date ?? '9999-12-31';
      const dateB = b.follow_up.next_date ?? '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      if (a.hold.active !== b.hold.active) return a.hold.active ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });

  return (
    <section className="pane pane-list">
      <header className="pane-header">
        <h2 className="pane-title">{listTitle}</h2>
        {!globalSearch && (
          <span className="status-chip">{getStatusLabel(selectedStatus)}</span>
        )}
      </header>

      <div className="search-bar">
        <span className="search-icon" aria-hidden>
          🔍
        </span>
        <input
          type="search"
          placeholder="名前・電話・相談支援事業所で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`chip${activeFilters.has(key) ? ' active' : ''}`}
            onClick={() => toggleFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filter-chips site-filter">
        <span className="filter-group-label">拠点</span>
        <button
          type="button"
          className={`chip${siteFilter === null ? ' active' : ''}`}
          onClick={() => setSiteFilter(null)}
        >
          すべて
        </button>
        {siteTags.map((tag) => (
          <button
            key={tag.code}
            type="button"
            className={`chip${siteFilter === tag.code ? ' active' : ''}`}
            onClick={() => setSiteFilter(tag.code)}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <ul className="candidate-list">
        {filtered.map((candidate) => {
          const overdue = isOverdue(candidate.follow_up.next_date);
          const holdLabel = resolveHoldReasonLabel(candidate.hold.reason_code);
          const isDuplicate = hasActiveDuplicateWarning(candidate, candidates);
          return (
            <li key={candidate.id}>
              <button
                type="button"
                className={`candidate-card${selectedId === candidate.id ? ' selected' : ''}${isDuplicate ? ' has-duplicate' : ''}`}
                onClick={() => onSelectCandidate(candidate.id)}
              >
                <div className="card-top">
                  <span className="card-name">{candidate.pane3.display_name}</span>
                  {isDuplicate && (
                    <span className="badge-duplicate">重複?</span>
                  )}
                  {globalSearch && (
                    <span className="badge-status">
                      {getStatusLabel(candidate.status)}
                    </span>
                  )}
                  {candidate.follow_up.next_date && (
                    <span className="card-date">
                      📅 {candidate.follow_up.next_date}
                    </span>
                  )}
                  {overdue && <span className="badge-overdue">超過</span>}
                </div>
                <div className="card-meta">
                  受付: {formatDate(candidate.created_at)}・担当:{' '}
                  {resolveStaffName(candidate.follow_up.owner_staff_id)}・
                  {resolveSiteTagLabels(candidate.site_tags)}
                </div>
                <div className="card-footer">
                  区分:{' '}
                  {resolveSupportCategoryLabel(candidate.pane3.support_category)}
                  {candidate.hold.active && (
                    <span className="badge-hold">
                      保留{holdLabel ? `（${holdLabel}）` : ''}
                    </span>
                  )}
                  {isArchivedStatus(candidate.status) && (
                    <span className="badge-archived">終了</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="empty-message">該当する候補者がいません</li>
        )}
      </ul>
    </section>
  );
}

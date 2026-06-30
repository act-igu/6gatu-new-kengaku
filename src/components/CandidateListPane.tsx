import { useState } from 'react';
import type { Candidate, FollowUpFilter, StatusCode } from '../types';
import { getStatusLabel } from '../types';
import {
  isOverdue,
  isToday,
  resolveSiteTagLabels,
  resolveStaffName,
  resolveSupportCategoryLabel,
} from '../data/mockData';

interface CandidateListPaneProps {
  selectedStatus: StatusCode;
  candidates: Candidate[];
  selectedId: string | null;
  onSelectCandidate: (id: string) => void;
}

const FILTERS: { key: FollowUpFilter; label: string }[] = [
  { key: 'hold', label: '保留のみ' },
  { key: 'today', label: '今日' },
  { key: 'overdue', label: '超過' },
  { key: 'unset', label: '未設定' },
];

function matchesFilter(candidate: Candidate, filter: FollowUpFilter): boolean {
  switch (filter) {
    case 'hold':
      return candidate.hold.active;
    case 'today':
      return isToday(candidate.follow_up.next_date);
    case 'overdue':
      return isOverdue(candidate.follow_up.next_date);
    case 'unset':
      return !candidate.follow_up.next_date;
  }
}

export function CandidateListPane({
  selectedStatus,
  candidates,
  selectedId,
  onSelectCandidate,
}: CandidateListPaneProps) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FollowUpFilter>>(
    new Set(),
  );

  const toggleFilter = (key: FollowUpFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = candidates
    .filter((c) => c.status === selectedStatus)
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.pane3.display_name.toLowerCase().includes(q) ||
        c.pane3.phone_primary.includes(q)
      );
    })
    .filter((c) => {
      if (activeFilters.size === 0) return true;
      return [...activeFilters].every((f) => matchesFilter(c, f));
    })
    .sort((a, b) => {
      const dateA = a.follow_up.next_date ?? '9999-12-31';
      const dateB = b.follow_up.next_date ?? '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      if (a.hold.active !== b.hold.active) return a.hold.active ? -1 : 1;
      return a.updated_at.localeCompare(b.updated_at);
    });

  return (
    <section className="pane pane-list">
      <header className="pane-header">
        <h2 className="pane-title">候補者リスト</h2>
        <span className="status-chip">{getStatusLabel(selectedStatus)}</span>
      </header>

      <div className="search-bar">
        <span className="search-icon" aria-hidden>
          🔍
        </span>
        <input
          type="search"
          placeholder="表示名・電話で検索"
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

      <ul className="candidate-list">
        {filtered.map((candidate) => {
          const overdue = isOverdue(candidate.follow_up.next_date);
          return (
            <li key={candidate.id}>
              <button
                type="button"
                className={`candidate-card${selectedId === candidate.id ? ' selected' : ''}`}
                onClick={() => onSelectCandidate(candidate.id)}
              >
                <div className="card-top">
                  <span className="card-name">{candidate.pane3.display_name}</span>
                  {candidate.follow_up.next_date && (
                    <span className="card-date">
                      📅 {candidate.follow_up.next_date}
                    </span>
                  )}
                  {overdue && <span className="badge-overdue">超過</span>}
                </div>
                <div className="card-meta">
                  担当: {resolveStaffName(candidate.follow_up.owner_staff_id)}・
                  {resolveSiteTagLabels(candidate.site_tags)}
                </div>
                <div className="card-footer">
                  区分: {resolveSupportCategoryLabel(candidate.pane3.support_category)}
                  {candidate.hold.active && (
                    <span className="badge-hold">保留</span>
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

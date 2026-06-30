import type { Candidate, Role, Staff } from '../types';
import { findDuplicateCandidates } from '../utils/duplicates';

interface DuplicateBannerProps {
  candidate: Candidate;
  allCandidates: Candidate[];
  onSelectDuplicate: (id: string) => void;
}

export function DuplicateBanner({
  candidate,
  allCandidates,
  onSelectDuplicate,
}: DuplicateBannerProps) {
  const duplicates = findDuplicateCandidates(candidate, allCandidates);
  if (duplicates.length === 0) return null;

  return (
    <div className="duplicate-banner" role="alert">
      <strong>⚠ 重複の可能性</strong>
      <p className="duplicate-banner-text">
        同一電話番号の候補者が {duplicates.length} 件見つかりました。
      </p>
      <ul className="duplicate-list">
        {duplicates.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className="duplicate-link"
              onClick={() => onSelectDuplicate(d.id)}
            >
              {d.display_name}（{d.status}）
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ViewerNoticeProps {
  role: Role;
}

export function ViewerNotice({ role }: ViewerNoticeProps) {
  if (role === 'editor') return null;
  return (
    <div className="viewer-notice">
      閲覧者モード：個人情報はマスキング表示されています
    </div>
  );
}

interface RoleBadgeProps {
  staff: Staff;
}

export function RoleBadge({ staff }: RoleBadgeProps) {
  return (
    <span className={`role-badge role-${staff.role}`}>
      {staff.role === 'editor' ? '編集者' : '閲覧者'}
    </span>
  );
}

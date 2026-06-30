export type Role = 'editor' | 'viewer';

export type StatusCode =
  | 'NEW'
  | 'TOUR_SCHEDULING'
  | 'TOUR_SCHEDULED'
  | 'TOUR_DONE'
  | 'TRIAL_SCHEDULING'
  | 'TRIAL_ACTIVE'
  | 'CONTRACTING'
  | 'PRE_MOVE_IN'
  | 'DONE'
  | 'DECLINED'
  | 'PASSED'
  | 'DUP'
  | 'CLOSED_OTHER';

export type FollowUpFilter = 'hold' | 'today' | 'overdue' | 'unset';

export interface StatusDefinition {
  code: StatusCode;
  label: string;
  order: number;
  archived?: boolean;
}

export interface SiteTag {
  code: string;
  label: string;
}

export interface SupportCategory {
  code: string;
  label: string;
}

export interface Staff {
  staff_id: string;
  login_id: string;
  display_name: string;
  role: Role;
  active: boolean;
  default_site_tags: string[];
}

export interface HoldInfo {
  active: boolean;
  reason_code: string | null;
  note: string | null;
}

export interface FollowUpInfo {
  next_date: string | null;
  next_note: string | null;
  owner_staff_id: string | null;
}

export interface MemoEntry {
  entry_id: string;
  occurred_at: string;
  contact_date: string | null;
  author_staff_id: string;
  body: string;
}

export interface CandidatePane3 {
  display_name: string;
  phone_primary: string;
  support_category: string;
  official_name: string;
  address_situation: string;
  specialist_name: string;
  specialist_office: string;
  specialist_phone: string;
  specialist_email: string;
  referral_route: string;
  follow_owner_staff_id: string | null;
}

export interface Candidate {
  id: string;
  status: StatusCode;
  site_tags: string[];
  hold: HoldInfo;
  follow_up: FollowUpInfo;
  pane3: CandidatePane3;
  memos: MemoEntry[];
  updated_at: string;
}

export const ACTIVE_STATUSES: StatusDefinition[] = [
  { code: 'NEW', label: '新規受付', order: 10 },
  { code: 'TOUR_SCHEDULING', label: '見学調整中', order: 20 },
  { code: 'TOUR_SCHEDULED', label: '見学予定', order: 30 },
  { code: 'TOUR_DONE', label: '見学済・検討中', order: 40 },
  { code: 'TRIAL_SCHEDULING', label: '体験入居調整中', order: 50 },
  { code: 'TRIAL_ACTIVE', label: '体験入居中', order: 60 },
  { code: 'CONTRACTING', label: '契約手続中', order: 70 },
  { code: 'PRE_MOVE_IN', label: '入居前準備', order: 80 },
];

export const ARCHIVED_STATUSES: StatusDefinition[] = [
  { code: 'DONE', label: '契約完了・入居済', order: 90, archived: true },
  { code: 'DECLINED', label: '辞退（本人・家族）', order: 91, archived: true },
  { code: 'PASSED', label: '見送り（事業者側）', order: 92, archived: true },
  { code: 'DUP', label: '重複・誤登録', order: 93, archived: true },
  { code: 'CLOSED_OTHER', label: 'その他終了', order: 94, archived: true },
];

export const RECOMMENDED_NEXT: Partial<Record<StatusCode, StatusCode>> = {
  NEW: 'TOUR_SCHEDULING',
  TOUR_SCHEDULING: 'TOUR_SCHEDULED',
  TOUR_SCHEDULED: 'TOUR_DONE',
  TOUR_DONE: 'TRIAL_SCHEDULING',
  TRIAL_SCHEDULING: 'TRIAL_ACTIVE',
  TRIAL_ACTIVE: 'CONTRACTING',
  CONTRACTING: 'PRE_MOVE_IN',
  PRE_MOVE_IN: 'DONE',
};

export function getStatusLabel(code: StatusCode): string {
  const all = [...ACTIVE_STATUSES, ...ARCHIVED_STATUSES];
  return all.find((s) => s.code === code)?.label ?? code;
}

export function getRecommendedNext(code: StatusCode): StatusCode | null {
  return RECOMMENDED_NEXT[code] ?? null;
}

import type { Candidate, SiteTag, Staff, SupportCategory } from '../types';

export const siteTags: SiteTag[] = [
  { code: 'AREA_EAST', label: 'エリア東' },
  { code: 'BLDG_A', label: 'A棟' },
  { code: 'BLDG_B', label: 'B棟' },
];

export const supportCategories: SupportCategory[] = [
  { code: 'CAT1', label: '区分1' },
  { code: 'CAT2', label: '区分2' },
  { code: 'CAT3', label: '区分3' },
  { code: 'CAT4', label: '区分4' },
  { code: 'CAT5', label: '区分5' },
  { code: 'CAT6', label: '区分6' },
  { code: 'UNKNOWN', label: '確認中' },
  { code: 'NONE', label: '未取得' },
];

export const staffList: Staff[] = [
  {
    staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
    login_id: 'yamada@example.org',
    display_name: '山田（相談）',
    role: 'editor',
    active: true,
    default_site_tags: ['AREA_EAST', 'BLDG_A'],
  },
  {
    staff_id: '91de4c3b-2a10-4f9e-8c7d-6b5a40392817',
    login_id: 'sato@example.org',
    display_name: '佐藤（事務）',
    role: 'viewer',
    active: true,
    default_site_tags: [],
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: 'cand-001',
    status: 'NEW',
    site_tags: ['AREA_EAST', 'BLDG_A'],
    hold: { active: false, reason_code: null, note: null },
    follow_up: {
      next_date: '2026-05-16',
      next_note: null,
      owner_staff_id: null,
    },
    pane3: {
      display_name: '鈴木（仮）',
      phone_primary: '090-1234-5678',
      support_category: 'UNKNOWN',
      official_name: '',
      address_situation: '',
      specialist_name: '高橋',
      specialist_office: '○○相談支援',
      specialist_phone: '03-0000-1111',
      specialist_email: '',
      referral_route: '計画相談支援からの紹介',
      follow_owner_staff_id: null,
    },
    memos: [
      {
        entry_id: 'memo-001',
        occurred_at: '2026-05-12T10:00:00',
        contact_date: '2026-05-12',
        author_staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
        body: '初回電話。居室タイプの希望をヒアリング。',
      },
    ],
    updated_at: '2026-05-12T10:00:00',
  },
  {
    id: 'cand-002',
    status: 'NEW',
    site_tags: ['AREA_EAST', 'BLDG_B'],
    hold: { active: true, reason_code: 'WAIT_FAMILY', note: '家族と相談中' },
    follow_up: {
      next_date: '2026-06-30',
      next_note: '家族面談後に連絡',
      owner_staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
    },
    pane3: {
      display_name: '田中（仮）',
      phone_primary: '080-9876-5432',
      support_category: 'CAT2',
      official_name: '田中 一郎',
      address_situation: '実家暮らし',
      specialist_name: '',
      specialist_office: '',
      specialist_phone: '',
      specialist_email: '',
      referral_route: 'Web問い合わせ',
      follow_owner_staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
    },
    memos: [],
    updated_at: '2026-06-28T14:30:00',
  },
  {
    id: 'cand-003',
    status: 'TOUR_SCHEDULING',
    site_tags: ['BLDG_A'],
    hold: { active: false, reason_code: null, note: null },
    follow_up: {
      next_date: null,
      next_note: null,
      owner_staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
    },
    pane3: {
      display_name: '佐々木（仮）',
      phone_primary: '070-1111-2222',
      support_category: 'CAT3',
      official_name: '',
      address_situation: '',
      specialist_name: '伊藤',
      specialist_office: '△△相談支援',
      specialist_phone: '03-2222-3333',
      specialist_email: 'ito@example.org',
      referral_route: '相談支援事業所紹介',
      follow_owner_staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
    },
    memos: [
      {
        entry_id: 'memo-002',
        occurred_at: '2026-06-29T09:00:00',
        contact_date: '2026-06-29',
        author_staff_id: '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60',
        body: '見学候補日を3案提示。返答待ち。',
      },
    ],
    updated_at: '2026-06-29T09:00:00',
  },
];

export function resolveSiteTagLabels(codes: string[]): string {
  return codes
    .map((code) => siteTags.find((t) => t.code === code)?.label ?? code)
    .join('・');
}

export function resolveSupportCategoryLabel(code: string): string {
  return supportCategories.find((c) => c.code === code)?.label ?? code;
}

export function resolveStaffName(staffId: string | null): string {
  if (!staffId) return '未設定';
  return staffList.find((s) => s.staff_id === staffId)?.display_name ?? '未設定';
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return target.getTime() === today.getTime();
}

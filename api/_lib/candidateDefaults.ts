import type { Candidate } from './types';
import { createDefaultAcceptance } from './types';
import { createDefaultDocuments } from './constants';

export function createEmptyCandidate(ownerStaffId: string): Candidate {
  const now = new Date().toISOString();
  return {
    id: `cand-${crypto.randomUUID().slice(0, 8)}`,
    status: 'NEW',
    created_at: now,
    site_tags: ['AREA_EAST'],
    hold: { active: false, reason_code: null, note: null },
    follow_up: {
      next_date: null,
      next_note: null,
      owner_staff_id: ownerStaffId,
    },
    schedule: {
      tour_datetime: null,
      move_in_planned_date: null,
    },
    acceptance: createDefaultAcceptance(),
    documents: createDefaultDocuments(),
    pane3: {
      display_name: '新規（仮）',
      phone_primary: '',
      phone_secondary: '',
      contact_secondary_name: '',
      gender: 'UNKNOWN',
      date_of_birth: null,
      support_category: 'UNKNOWN',
      official_name: '',
      address_situation: '',
      specialist_name: '',
      specialist_office: '',
      specialist_phone: '',
      specialist_email: '',
      referral_route: '',
    },
    memos: [],
    updated_at: now,
  };
}

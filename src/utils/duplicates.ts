import type { Candidate } from '../types';
import { getStatusLabel, isArchivedStatus } from '../types';

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export interface DuplicateMatch {
  id: string;
  display_name: string;
  status: string;
  phone: string;
}

export function findDuplicateCandidates(
  candidate: Candidate,
  allCandidates: Candidate[],
): DuplicateMatch[] {
  const phone = normalizePhone(candidate.pane3.phone_primary);
  if (phone.length < 8) return [];

  return allCandidates
    .filter((c) => c.id !== candidate.id)
    .filter((c) => normalizePhone(c.pane3.phone_primary) === phone)
    .filter((c) => c.status !== 'DUP')
    .map((c) => ({
      id: c.id,
      display_name: c.pane3.display_name,
      status: getStatusLabel(c.status),
      phone: c.pane3.phone_primary,
    }));
}

export function hasActiveDuplicateWarning(
  candidate: Candidate,
  allCandidates: Candidate[],
): boolean {
  return findDuplicateCandidates(candidate, allCandidates).some(
    (d) => {
      const match = allCandidates.find((c) => c.id === d.id);
      return match && !isArchivedStatus(match.status);
    },
  );
}

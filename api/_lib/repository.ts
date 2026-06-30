import type { Candidate, MemoEntry, Staff, StatusCode } from './types';
import { getSql } from './db';

interface CandidateRow {
  id: string;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
  site_tags: string[];
  hold: Candidate['hold'];
  follow_up: Candidate['follow_up'];
  schedule: Candidate['schedule'];
  acceptance: Candidate['acceptance'];
  pane3: Candidate['pane3'];
  documents: Candidate['documents'];
}

interface MemoRow {
  entry_id: string;
  candidate_id: string;
  occurred_at: Date | string;
  contact_date: string | null;
  author_staff_id: string;
  body: string;
}

interface StaffRow {
  staff_id: string;
  login_id: string;
  display_name: string;
  role: Staff['role'];
  active: boolean;
  default_site_tags: string[];
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toDateString(value: Date | string | null): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function rowToCandidate(row: CandidateRow, memos: MemoEntry[]): Candidate {
  return {
    id: row.id,
    status: row.status as StatusCode,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    site_tags: row.site_tags ?? [],
    hold: row.hold,
    follow_up: row.follow_up,
    schedule: row.schedule,
    acceptance: row.acceptance,
    pane3: row.pane3,
    documents: row.documents ?? [],
    memos,
  };
}

function rowToMemo(row: MemoRow): MemoEntry {
  return {
    entry_id: row.entry_id,
    occurred_at: toIso(row.occurred_at),
    contact_date: toDateString(row.contact_date),
    author_staff_id: row.author_staff_id,
    body: row.body,
  };
}

function rowToStaff(row: StaffRow): Staff {
  return {
    staff_id: row.staff_id,
    login_id: row.login_id,
    display_name: row.display_name,
    role: row.role,
    active: row.active,
    default_site_tags: row.default_site_tags ?? [],
  };
}

export async function listStaff(): Promise<Staff[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT staff_id, login_id, display_name, role, active, default_site_tags
    FROM staff
    WHERE active = true
    ORDER BY display_name
  `;
  return (rows as StaffRow[]).map(rowToStaff);
}

export async function listCandidates(): Promise<Candidate[]> {
  const sql = getSql();
  const candidateRows = await sql`
    SELECT id, status, created_at, updated_at, site_tags, hold, follow_up,
           schedule, acceptance, pane3, documents
    FROM candidates
    ORDER BY updated_at DESC
  `;
  const memoRows = await sql`
    SELECT entry_id, candidate_id, occurred_at, contact_date, author_staff_id, body
    FROM memos
    ORDER BY occurred_at DESC
  `;

  const memosByCandidate = new Map<string, MemoEntry[]>();
  for (const row of memoRows as MemoRow[]) {
    const memo = rowToMemo(row);
    const list = memosByCandidate.get(row.candidate_id) ?? [];
    list.push(memo);
    memosByCandidate.set(row.candidate_id, list);
  }

  return (candidateRows as CandidateRow[]).map((row) =>
    rowToCandidate(row, memosByCandidate.get(row.id) ?? []),
  );
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, status, created_at, updated_at, site_tags, hold, follow_up,
           schedule, acceptance, pane3, documents
    FROM candidates
    WHERE id = ${id}
  `;
  if (rows.length === 0) return null;

  const memoRows = await sql`
    SELECT entry_id, candidate_id, occurred_at, contact_date, author_staff_id, body
    FROM memos
    WHERE candidate_id = ${id}
    ORDER BY occurred_at DESC
  `;

  return rowToCandidate(
    rows[0] as CandidateRow,
    (memoRows as MemoRow[]).map(rowToMemo),
  );
}

export async function insertCandidate(candidate: Candidate): Promise<Candidate> {
  const sql = getSql();
  await sql`
    INSERT INTO candidates (
      id, status, created_at, updated_at, site_tags,
      hold, follow_up, schedule, acceptance, pane3, documents
    ) VALUES (
      ${candidate.id},
      ${candidate.status},
      ${candidate.created_at},
      ${candidate.updated_at},
      ${candidate.site_tags},
      ${JSON.stringify(candidate.hold)}::jsonb,
      ${JSON.stringify(candidate.follow_up)}::jsonb,
      ${JSON.stringify(candidate.schedule)}::jsonb,
      ${JSON.stringify(candidate.acceptance)}::jsonb,
      ${JSON.stringify(candidate.pane3)}::jsonb,
      ${JSON.stringify(candidate.documents)}::jsonb
    )
  `;
  return { ...candidate, memos: [] };
}

export async function updateCandidate(candidate: Candidate): Promise<Candidate> {
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    UPDATE candidates SET
      status = ${candidate.status},
      updated_at = ${now},
      site_tags = ${candidate.site_tags},
      hold = ${JSON.stringify(candidate.hold)}::jsonb,
      follow_up = ${JSON.stringify(candidate.follow_up)}::jsonb,
      schedule = ${JSON.stringify(candidate.schedule)}::jsonb,
      acceptance = ${JSON.stringify(candidate.acceptance)}::jsonb,
      pane3 = ${JSON.stringify(candidate.pane3)}::jsonb,
      documents = ${JSON.stringify(candidate.documents)}::jsonb
    WHERE id = ${candidate.id}
  `;
  const existing = await getCandidateById(candidate.id);
  return existing ?? { ...candidate, updated_at: now };
}

export async function updateCandidateStatus(
  id: string,
  status: StatusCode,
): Promise<Candidate | null> {
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    UPDATE candidates SET status = ${status}, updated_at = ${now}
    WHERE id = ${id}
  `;
  return getCandidateById(id);
}

export async function appendMemo(
  candidateId: string,
  body: string,
  authorStaffId: string,
): Promise<Candidate | null> {
  const sql = getSql();
  const now = new Date();
  const entryId = `memo-${crypto.randomUUID().slice(0, 8)}`;
  const contactDate = now.toISOString().slice(0, 10);

  await sql`
    INSERT INTO memos (entry_id, candidate_id, occurred_at, contact_date, author_staff_id, body)
    VALUES (
      ${entryId},
      ${candidateId},
      ${now.toISOString()},
      ${contactDate},
      ${authorStaffId}::uuid,
      ${body}
    )
  `;
  await sql`
    UPDATE candidates SET updated_at = ${now.toISOString()}
    WHERE id = ${candidateId}
  `;
  return getCandidateById(candidateId);
}

export async function seedStaff(staff: Staff[]): Promise<void> {
  const sql = getSql();
  for (const s of staff) {
    await sql`
      INSERT INTO staff (staff_id, login_id, display_name, role, active, default_site_tags)
      VALUES (
        ${s.staff_id}::uuid,
        ${s.login_id},
        ${s.display_name},
        ${s.role},
        ${s.active},
        ${s.default_site_tags}
      )
      ON CONFLICT (staff_id) DO UPDATE SET
        login_id = EXCLUDED.login_id,
        display_name = EXCLUDED.display_name,
        role = EXCLUDED.role,
        active = EXCLUDED.active,
        default_site_tags = EXCLUDED.default_site_tags
    `;
  }
}

export async function seedCandidates(candidates: Candidate[]): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM memos`;
  await sql`DELETE FROM candidates`;

  for (const c of candidates) {
    await sql`
      INSERT INTO candidates (
        id, status, created_at, updated_at, site_tags,
        hold, follow_up, schedule, acceptance, pane3, documents
      ) VALUES (
        ${c.id},
        ${c.status},
        ${c.created_at},
        ${c.updated_at},
        ${c.site_tags},
        ${JSON.stringify(c.hold)}::jsonb,
        ${JSON.stringify(c.follow_up)}::jsonb,
        ${JSON.stringify(c.schedule)}::jsonb,
        ${JSON.stringify(c.acceptance)}::jsonb,
        ${JSON.stringify(c.pane3)}::jsonb,
        ${JSON.stringify(c.documents)}::jsonb
      )
    `;
    for (const memo of c.memos) {
      await sql`
        INSERT INTO memos (entry_id, candidate_id, occurred_at, contact_date, author_staff_id, body)
        VALUES (
          ${memo.entry_id},
          ${c.id},
          ${memo.occurred_at},
          ${memo.contact_date},
          ${memo.author_staff_id}::uuid,
          ${memo.body}
        )
      `;
    }
  }
}

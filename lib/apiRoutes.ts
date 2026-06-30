import type { Candidate, StatusCode } from '../shared/types';
import { createEmptyCandidate } from './candidateDefaults';
import { checkDbConnection } from './db';
import {
  appendMemo,
  getCandidateById,
  insertCandidate,
  listCandidates,
  listStaff,
  updateCandidate,
  updateCandidateStatus,
} from './repository';
import { CURRENT_STAFF_ID } from './constants';

export type ApiSuccess = { ok: true; status: number; data: unknown };
export type ApiFailure = { ok: false; status: number; error: string };
export type ApiResult = ApiSuccess | ApiFailure;

function fail(status: number, error: string): ApiFailure {
  return { ok: false, status, error };
}

function succeed(status: number, data: unknown): ApiSuccess {
  return { ok: true, status, data };
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export async function routeHealth(): Promise<ApiResult> {
  try {
    await checkDbConnection();
    return succeed(200, { ok: true, message: 'データベース接続 OK' });
  } catch (err) {
    return fail(500, errorMessage(err, '接続エラー'));
  }
}

export async function routeStaff(): Promise<ApiResult> {
  try {
    const staff = await listStaff();
    return succeed(200, staff);
  } catch (err) {
    return fail(500, errorMessage(err, '取得に失敗しました'));
  }
}

export async function routeListCandidates(): Promise<ApiResult> {
  try {
    const candidates = await listCandidates();
    return succeed(200, candidates);
  } catch (err) {
    return fail(500, errorMessage(err, '処理に失敗しました'));
  }
}

export async function routeCreateCandidate(body: {
  owner_staff_id?: string;
}): Promise<ApiResult> {
  try {
    const ownerId = body.owner_staff_id ?? CURRENT_STAFF_ID;
    const candidate = createEmptyCandidate(ownerId);
    const created = await insertCandidate(candidate);
    return succeed(201, created);
  } catch (err) {
    return fail(500, errorMessage(err, '処理に失敗しました'));
  }
}

export async function routeGetCandidate(id: string): Promise<ApiResult> {
  try {
    const candidate = await getCandidateById(id);
    if (!candidate) return fail(404, '候補者が見つかりません');
    return succeed(200, candidate);
  } catch (err) {
    return fail(500, errorMessage(err, '処理に失敗しました'));
  }
}

export async function routePatchCandidate(
  id: string,
  body: Partial<Candidate> & { status?: StatusCode },
): Promise<ApiResult> {
  try {
    if (body.status && Object.keys(body).length === 1) {
      const updated = await updateCandidateStatus(id, body.status);
      if (!updated) return fail(404, '候補者が見つかりません');
      return succeed(200, updated);
    }

    const existing = await getCandidateById(id);
    if (!existing) return fail(404, '候補者が見つかりません');

    const merged: Candidate = {
      ...existing,
      ...body,
      id: existing.id,
      created_at: existing.created_at,
      memos: existing.memos,
      pane3: { ...existing.pane3, ...body.pane3 },
      hold: body.hold ?? existing.hold,
      follow_up: body.follow_up ?? existing.follow_up,
      schedule: body.schedule ?? existing.schedule,
      acceptance: body.acceptance ?? existing.acceptance,
      documents: body.documents ?? existing.documents,
      site_tags: body.site_tags ?? existing.site_tags,
    };

    const updated = await updateCandidate(merged);
    return succeed(200, updated);
  } catch (err) {
    return fail(500, errorMessage(err, '処理に失敗しました'));
  }
}

export async function routeAppendMemo(
  id: string,
  body: { body?: string; author_staff_id?: string },
): Promise<ApiResult> {
  try {
    if (!body.body?.trim()) return fail(400, 'body が必要です');
    const authorId = body.author_staff_id ?? CURRENT_STAFF_ID;
    const updated = await appendMemo(id, body.body.trim(), authorId);
    if (!updated) return fail(404, '候補者が見つかりません');
    return succeed(200, updated);
  } catch (err) {
    return fail(500, errorMessage(err, '処理に失敗しました'));
  }
}

export async function handleApiRequest(
  method: string,
  pathname: string,
  body?: unknown,
): Promise<ApiResult> {
  if (pathname === '/api/health') {
    if (method !== 'GET') return fail(405, 'Method not allowed');
    return routeHealth();
  }

  if (pathname === '/api/staff') {
    if (method !== 'GET') return fail(405, 'Method not allowed');
    return routeStaff();
  }

  if (pathname === '/api/candidates') {
    if (method === 'GET') return routeListCandidates();
    if (method === 'POST') {
      return routeCreateCandidate(
        (body ?? {}) as { owner_staff_id?: string },
      );
    }
    return fail(405, 'Method not allowed');
  }

  const memoMatch = pathname.match(/^\/api\/candidates\/([^/]+)\/memos$/);
  if (memoMatch) {
    if (method !== 'POST') return fail(405, 'Method not allowed');
    return routeAppendMemo(
      memoMatch[1],
      (body ?? {}) as { body?: string; author_staff_id?: string },
    );
  }

  const candidateMatch = pathname.match(/^\/api\/candidates\/([^/]+)$/);
  if (candidateMatch) {
    const id = candidateMatch[1];
    if (method === 'GET') return routeGetCandidate(id);
    if (method === 'PATCH') {
      return routePatchCandidate(
        id,
        (body ?? {}) as Partial<Candidate> & { status?: StatusCode },
      );
    }
    return fail(405, 'Method not allowed');
  }

  return fail(404, 'Not found');
}

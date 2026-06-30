import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createEmptyCandidate } from '../lib/candidateDefaults';
import {
  handleOptions,
  readJsonBody,
  sendError,
  sendJson,
} from '../lib/apiHelpers';
import { insertCandidate, listCandidates } from '../lib/repository';
import { CURRENT_STAFF_ID } from '../src/data/mockData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    if (req.method === 'GET') {
      const candidates = await listCandidates();
      sendJson(res, 200, candidates);
      return;
    }

    if (req.method === 'POST') {
      const body = await readJsonBody<{ owner_staff_id?: string }>(req);
      const ownerId = body.owner_staff_id ?? CURRENT_STAFF_ID;
      const candidate = createEmptyCandidate(ownerId);
      const created = await insertCandidate(candidate);
      sendJson(res, 201, created);
      return;
    }

    sendError(res, 405, 'Method not allowed');
  } catch (err) {
    const message = err instanceof Error ? err.message : '処理に失敗しました';
    sendError(res, 500, message);
  }
}

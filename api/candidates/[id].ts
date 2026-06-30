import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Candidate, StatusCode } from '../../src/types';
import {
  handleOptions,
  readJsonBody,
  sendError,
  sendJson,
} from '../../lib/apiHelpers';
import {
  getCandidateById,
  updateCandidate,
  updateCandidateStatus,
} from '../../lib/repository';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const id = req.query.id as string | undefined;
  if (!id) {
    sendError(res, 400, 'id が必要です');
    return;
  }

  try {
    if (req.method === 'GET') {
      const candidate = await getCandidateById(id);
      if (!candidate) {
        sendError(res, 404, '候補者が見つかりません');
        return;
      }
      sendJson(res, 200, candidate);
      return;
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody<
        Partial<Candidate> & { status?: StatusCode }
      >(req);

      if (body.status && Object.keys(body).length === 1) {
        const updated = await updateCandidateStatus(id, body.status);
        if (!updated) {
          sendError(res, 404, '候補者が見つかりません');
          return;
        }
        sendJson(res, 200, updated);
        return;
      }

      const existing = await getCandidateById(id);
      if (!existing) {
        sendError(res, 404, '候補者が見つかりません');
        return;
      }

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
      sendJson(res, 200, updated);
      return;
    }

    sendError(res, 405, 'Method not allowed');
  } catch (err) {
    const message = err instanceof Error ? err.message : '処理に失敗しました';
    sendError(res, 500, message);
  }
}

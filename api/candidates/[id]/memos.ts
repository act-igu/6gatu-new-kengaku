import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleOptions,
  readJsonBody,
  sendError,
  sendJson,
} from '../../lib/apiHelpers';
import { appendMemo } from '../../lib/repository';
import { CURRENT_STAFF_ID } from '../../src/data/mockData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const id = req.query.id as string | undefined;
  if (!id) {
    sendError(res, 400, 'id が必要です');
    return;
  }

  if (req.method !== 'POST') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    const body = await readJsonBody<{
      body?: string;
      author_staff_id?: string;
    }>(req);

    if (!body.body?.trim()) {
      sendError(res, 400, 'body が必要です');
      return;
    }

    const authorId = body.author_staff_id ?? CURRENT_STAFF_ID;
    const updated = await appendMemo(id, body.body.trim(), authorId);
    if (!updated) {
      sendError(res, 404, '候補者が見つかりません');
      return;
    }
    sendJson(res, 200, updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : '処理に失敗しました';
    sendError(res, 500, message);
  }
}

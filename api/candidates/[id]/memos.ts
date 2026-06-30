import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleOptions,
  readJsonBody,
  sendError,
  sendJson,
} from '../../../lib/apiHelpers';
import { handleApiRequest } from '../../../lib/apiRoutes';

function applyResult(
  res: VercelResponse,
  result: Awaited<ReturnType<typeof handleApiRequest>>,
) {
  if (result.ok) {
    sendJson(res, result.status, result.data);
  } else {
    sendError(res, result.status, result.error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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

    const body = await readJsonBody<unknown>(req);
    applyResult(
      res,
      await handleApiRequest('POST', `/api/candidates/${id}/memos`, body),
    );
  } catch (err) {
    console.error('[api/candidates/[id]/memos]', err);
    sendError(res, 500, err instanceof Error ? err.message : 'サーバーエラー');
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, sendError, sendJson } from '../lib/apiHelpers';
import { handleApiRequest } from '../lib/apiRoutes';

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

    if (req.method !== 'GET') {
      sendError(res, 405, 'Method not allowed');
      return;
    }

    applyResult(res, await handleApiRequest('GET', '/api/staff'));
  } catch (err) {
    console.error('[api/staff]', err);
    sendError(res, 500, err instanceof Error ? err.message : 'サーバーエラー');
  }
}

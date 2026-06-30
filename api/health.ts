import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, readJsonBody, sendError, sendJson } from '../lib/apiHelpers';
import { handleApiRequest } from '../lib/apiRoutes';

function applyResult(res: VercelResponse, result: Awaited<ReturnType<typeof handleApiRequest>>) {
  if (result.ok) {
    sendJson(res, result.status, result.data);
  } else {
    sendError(res, result.status, result.error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const pathname = '/api/health';
  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  applyResult(res, await handleApiRequest(req.method ?? 'GET', pathname));
}

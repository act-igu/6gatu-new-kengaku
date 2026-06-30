import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleOptions,
  readJsonBody,
  sendError,
  sendJson,
} from '../../lib/apiHelpers';
import { handleApiRequest } from '../../lib/apiRoutes';

function applyResult(res: VercelResponse, result: Awaited<ReturnType<typeof handleApiRequest>>) {
  if (result.ok) {
    sendJson(res, result.status, result.data);
  } else {
    sendError(res, result.status, result.error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const method = req.method ?? 'GET';
  const body =
    method === 'POST' ? await readJsonBody<unknown>(req) : undefined;

  applyResult(res, await handleApiRequest(method, '/api/candidates', body));
}

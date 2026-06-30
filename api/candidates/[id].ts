import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleOptions,
  readJsonBody,
  sendError,
  sendJson,
} from '../../lib/apiHelpers';
import { handleApiRequest } from '../../lib/apiRoutes';

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

    const method = req.method ?? 'GET';
    const body =
      method === 'PATCH' ? await readJsonBody<unknown>(req) : undefined;

    applyResult(
      res,
      await handleApiRequest(method, `/api/candidates/${id}`, body),
    );
  } catch (err) {
    console.error('[api/candidates/[id]]', err);
    sendError(res, 500, err instanceof Error ? err.message : 'サーバーエラー');
  }
}

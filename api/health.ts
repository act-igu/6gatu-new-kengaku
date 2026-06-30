import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkDbConnection } from '../lib/db';
import { handleOptions, sendError, sendJson } from '../lib/apiHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    await checkDbConnection();
    sendJson(res, 200, { ok: true, message: 'データベース接続 OK' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '接続エラー';
    sendError(res, 500, message);
  }
}

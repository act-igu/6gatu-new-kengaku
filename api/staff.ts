import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, sendError, sendJson } from '../lib/apiHelpers';
import { listStaff } from '../lib/repository';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  try {
    const staff = await listStaff();
    sendJson(res, 200, staff);
  } catch (err) {
    const message = err instanceof Error ? err.message : '取得に失敗しました';
    sendError(res, 500, message);
  }
}

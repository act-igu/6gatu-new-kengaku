import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkDbConnection } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    await checkDbConnection();
    res.status(200).json({ ok: true, message: 'データベース接続 OK' });
  } catch (err) {
    console.error('[api/health]', err);
    const message = err instanceof Error ? err.message : '接続エラー';
    res.status(500).json({ error: message });
  }
}

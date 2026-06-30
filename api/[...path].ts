import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApiRequest, type ApiResult } from './_lib/apiRoutes';

export const config = {
  runtime: 'nodejs20.x',
};

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendResult(res: VercelResponse, result: ApiResult) {
  setCors(res);
  if (result.ok) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json({ error: result.error });
  }
}

function buildPathname(segments: string | string[] | undefined): string {
  if (!segments) return '/api';
  const parts = Array.isArray(segments) ? segments : [segments];
  return `/api/${parts.join('/')}`;
}

function readBody(req: VercelRequest): unknown {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length > 0) {
    return JSON.parse(req.body) as unknown;
  }
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const pathname = buildPathname(req.query.path as string | string[] | undefined);
    const body =
      req.method === 'POST' || req.method === 'PATCH' ? readBody(req) : undefined;

    const result = await handleApiRequest(req.method ?? 'GET', pathname, body);
    sendResult(res, result);
  } catch (err) {
    console.error('[api]', err);
    const message = err instanceof Error ? err.message : 'サーバーエラー';
    res.status(500).json({ error: message });
  }
}

/**
 * ローカル開発用 API サーバー（ポート 3001）
 * Vite の proxy 経由で /api/* をここに転送します。
 * 本番（Vercel）では api/ フォルダの Serverless Functions が使われます。
 */
import { createServer, type IncomingMessage } from 'node:http';
import { config } from 'dotenv';
import { handleApiRequest, type ApiResult } from '../lib/apiRoutes';

config({ path: '.env.local' });
config({ path: '.env' });

const PORT = 3001;

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  return JSON.parse(text) as unknown;
}

function send(res: import('node:http').ServerResponse, result: ApiResult) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (result.ok) {
    res.statusCode = result.status;
    res.end(JSON.stringify(result.data));
  } else {
    res.statusCode = result.status;
    res.end(JSON.stringify({ error: result.error }));
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const body =
      req.method === 'POST' || req.method === 'PATCH'
        ? await readJsonBody(req)
        : undefined;
    const result = await handleApiRequest(req.method ?? 'GET', pathname, body);
    send(res, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'サーバーエラー';
    send(res, { ok: false, status: 500, error: message });
  }
});

server.listen(PORT, () => {
  console.log(`✅ ローカル API サーバー: http://localhost:${PORT}/api/health`);
});

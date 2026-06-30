import { handleApiRequest, type ApiResult } from './_lib/apiRoutes';

export const config = {
  runtime: 'edge',
};

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(result: ApiResult): Response {
  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
  if (result.ok) {
    return new Response(JSON.stringify(result.data), {
      status: result.status,
      headers,
    });
  }
  return new Response(JSON.stringify({ error: result.error }), {
    status: result.status,
    headers,
  });
}

/** rewrite 先が /api/index でも、クライアントが叩いたパスを使う */
function resolvePathname(req: Request): string {
  const url = new URL(req.url);
  if (url.pathname !== '/api/index' && url.pathname !== '/api') {
    return url.pathname;
  }
  const original =
    req.headers.get('x-vercel-original-path') ??
    req.headers.get('x-invoke-path') ??
    req.headers.get('x-matched-path');
  if (original) {
    return original.split('?')[0];
  }
  return url.pathname;
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const pathname = resolvePathname(req);

    let body: unknown;
    if (req.method === 'POST' || req.method === 'PATCH') {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }

    const result = await handleApiRequest(req.method, pathname, body);
    return jsonResponse(result);
  } catch (err) {
    console.error('[api]', err);
    const message = err instanceof Error ? err.message : 'サーバーエラー';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

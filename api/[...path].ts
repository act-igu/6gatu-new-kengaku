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

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const pathname = url.pathname;

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

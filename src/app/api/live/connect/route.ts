import { NextRequest, NextResponse } from 'next/server';
import { liveHub } from '@/lib/server/liveHub';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token || 'streamer-demo');
    const action = String(body.action || 'connect');

    if (action === 'disconnect') {
      const state = liveHub.disconnectTikTok(token);
      return NextResponse.json({ ok: true, state }, { headers: CORS_HEADERS });
    }

    if (action === 'toggle_bots') {
      const enabled = Boolean(body.enabled);
      const gameSlug = typeof body.gameSlug === 'string' ? body.gameSlug : undefined;
      const state = liveHub.toggleBots(token, enabled, gameSlug);
      return NextResponse.json({ ok: true, state }, { headers: CORS_HEADERS });
    }

    const username = String(body.username || '');
    const state = await liveHub.connectTikTok(token, username);
    return NextResponse.json({ ok: state.connectionStatus === 'connected', state }, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Bad request' },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

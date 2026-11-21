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
    const type = String(body.type || 'chat');
    const externalId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : undefined;

    if (typeof body.viewerCount === 'number' && Number.isFinite(body.viewerCount) && body.viewerCount > 0) {
      liveHub.updateViewerCount(token, body.viewerCount);
    }

    if (type === 'viewer_count') {
      return NextResponse.json({ ok: true, state: liveHub.getState(token) }, { headers: CORS_HEADERS });
    }

    if (type === 'chat') {
      const username = String(body.username || 'Зритель');
      const message = String(body.message || '');
      const avatar = typeof body.avatar === 'string' ? body.avatar : undefined;
      const result = liveHub.pushChatEvent(
        token,
        username,
        message,
        avatar,
        externalId,
        Boolean(externalId)
      );
      return NextResponse.json(
        { ok: result.accepted, event: result.event, state: liveHub.getState(token) },
        { headers: CORS_HEADERS }
      );
    }

    if (type === 'gift') {
      const username = String(body.username || 'Донатер');
      const giftName = String(body.giftName || 'Роза');
      const coins = Number(body.coins || 1);
      const giftEmoji = typeof body.giftEmoji === 'string' ? body.giftEmoji : '🌹';
      const avatar = typeof body.avatar === 'string' ? body.avatar : undefined;
      const event = liveHub.pushGiftEvent(
        token,
        username,
        giftName,
        coins,
        giftEmoji,
        avatar,
        externalId,
        Boolean(externalId)
      );
      return NextResponse.json(
        { ok: Boolean(event), event, state: liveHub.getState(token) },
        { headers: CORS_HEADERS }
      );
    }

    if (type === 'like') {
      const username = String(body.username || 'Зритель');
      const likeCount = Number(body.likeCount || 1);
      const event = liveHub.pushLikeEvent(token, username, likeCount, externalId);
      return NextResponse.json(
        { ok: Boolean(event), event, state: liveHub.getState(token) },
        { headers: CORS_HEADERS }
      );
    }

    if (type === 'control') {
      const action = String(body.action || '');
      const payload = typeof body.payload === 'object' && body.payload ? body.payload : {};
      const state = liveHub.pushControlEvent(token, action, payload);
      return NextResponse.json({ ok: true, state }, { headers: CORS_HEADERS });
    }

    return NextResponse.json({ ok: false, error: 'Unsupported event type' }, { status: 400, headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Bad request' },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { liveHub } from '@/lib/server/liveHub';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token || 'streamer-demo');
    const type = String(body.type || 'chat');

    if (type === 'chat') {
      const username = String(body.username || 'Зритель');
      const message = String(body.message || '');
      const avatar = typeof body.avatar === 'string' ? body.avatar : undefined;
      const result = liveHub.pushChatEvent(token, username, message, avatar);
      return NextResponse.json({ ok: result.accepted, event: result.event, state: liveHub.getState(token) });
    }

    if (type === 'gift') {
      const username = String(body.username || 'Донатер');
      const giftName = String(body.giftName || 'Роза');
      const coins = Number(body.coins || 1);
      const giftEmoji = typeof body.giftEmoji === 'string' ? body.giftEmoji : '🌹';
      const event = liveHub.pushGiftEvent(token, username, giftName, coins, giftEmoji);
      return NextResponse.json({ ok: true, event, state: liveHub.getState(token) });
    }

    if (type === 'control') {
      const action = String(body.action || '');
      const payload = typeof body.payload === 'object' && body.payload ? body.payload : {};
      const state = liveHub.pushControlEvent(token, action, payload);
      return NextResponse.json({ ok: true, state });
    }

    return NextResponse.json({ ok: false, error: 'Unsupported event type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Bad request' },
      { status: 400 }
    );
  }
}

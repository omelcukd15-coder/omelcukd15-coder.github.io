import { NextRequest, NextResponse } from 'next/server';
import { liveHub } from '@/lib/server/liveHub';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || 'streamer-demo';
  const mode = req.nextUrl.searchParams.get('mode') || 'sse';

  if (mode === 'json') {
    return NextResponse.json({ ok: true, state: liveHub.getState(token) });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let keepAlive: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Stream closed
        }
      };

      send({ state: liveHub.getState(token) });

      unsubscribe = liveHub.subscribe(token, (payload) => {
        send(payload);
      });

      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          if (keepAlive) clearInterval(keepAlive);
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (keepAlive) clearInterval(keepAlive);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

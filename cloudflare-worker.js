const rooms = new Map();

function getRoom(token) {
  const key = (token || 'streamer-demo').trim();
  if (!rooms.has(key)) {
    rooms.set(key, {
      token: key,
      tiktokUsername: '',
      connectionStatus: 'disconnected',
      connectionError: null,
      botsEnabled: false,
      viewerCount: 1,
      peakViewers: 1,
      totalMessages: 0,
      totalGifts: 0,
      totalLikes: 0,
      activeGameSlug: 'contexto',
      giftPreset: 'light',
      moderation: {
        profanityOn: true,
        antiFloodSec: 1,
        stopWords: ['спам', 'скам'],
        bannedUsers: [],
        mutedUsers: [],
      },
      skin: {
        accentColor: '#7C3AED',
        backgroundMode: 'neon',
        ballShape: 'circle',
        fontFamily: 'Manrope',
        logoText: 'VibePlay LIVE',
      },
      playlist: {
        autopilot: false,
        rotateBy: 'rounds',
        rotateInterval: 3,
        queueSlugs: ['contexto', 'flag-quiz', 'ball-royale', 'secret-word'],
      },
      scores: {
        artem_gg: { username: 'artem_gg', avatar: '🧑‍💻', points: 14, wins: 3 },
        lera_fox: { username: 'lera_fox', avatar: '🦊', points: 11, wins: 2 },
        max_turbo: { username: 'max_turbo', avatar: '⚡', points: 8, wins: 1 },
      },
      recentEvents: [],
      customItems: [],
    });
  }
  return rooms.get(key);
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (pathname === '/') {
      return Response.redirect(url.origin + '/ru', 307);
    }

    // API: /api/live/stream
    if (pathname === '/api/live/stream' && request.method === 'GET') {
      const token = url.searchParams.get('token') || 'streamer-demo';
      const mode = url.searchParams.get('mode') || 'sse';
      const state = getRoom(token);
      if (mode === 'json') {
        return jsonResponse({ ok: true, state });
      }
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ state }) + '\n\n'));
          const timer = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(': ping\n\n'));
            } catch {
              clearInterval(timer);
            }
          }, 15000);
        },
      });
      return new Response(body, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          ...CORS_HEADERS,
        },
      });
    }

    // API: /api/live/connect
    if (pathname === '/api/live/connect' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = String(body.token || 'streamer-demo');
        const action = String(body.action || 'connect');
        const state = getRoom(token);

        if (action === 'disconnect') {
          state.connectionStatus = 'disconnected';
          state.connectionError = null;
          return jsonResponse({ ok: true, state });
        }

        if (action === 'toggle_bots') {
          state.botsEnabled = Boolean(body.enabled);
          if (typeof body.gameSlug === 'string') state.activeGameSlug = body.gameSlug;
          return jsonResponse({ ok: true, state });
        }

        const username = String(body.username || '').replace(/^@/, '').trim();
        if (!username) {
          state.tiktokUsername = '';
          state.connectionStatus = 'disconnected';
          state.connectionError = null;
          return jsonResponse({ ok: false, state });
        }

        state.tiktokUsername = username;
        try {
          const ttRes = await fetch('https://www.tiktok.com/@' + encodeURIComponent(username) + '/live', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          const html = await ttRes.text();
          const isLive = ttRes.ok && (html.includes('"status":2') || html.includes('room_id'));
          if (isLive) {
            state.connectionStatus = 'connected';
            state.connectionError = null;
            return jsonResponse({ ok: true, state });
          }
          state.connectionStatus = 'error';
          state.connectionError = 'Эфир @' + username + ' сейчас оффлайн на TikTok или закрыт регион-ограничением Edge. Вы можете тестировать игру с кнопкой «Боты чата».';
          return jsonResponse({ ok: false, state });
        } catch {
          state.connectionStatus = 'error';
          state.connectionError = 'Не удалось проверить комнату @' + username + '. Включите «Боты чата» для проверки или проверьте статус эфира.';
          return jsonResponse({ ok: false, state });
        }
      } catch (err) {
        return jsonResponse({ ok: false, error: 'Bad request' }, 400);
      }
    }

    // API: /api/live/event
    if (pathname === '/api/live/event' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = String(body.token || 'streamer-demo');
        const type = String(body.type || 'chat');
        const state = getRoom(token);

        if (type === 'chat') {
          const username = String(body.username || 'Зритель').replace(/^@/, '').trim();
          const message = String(body.message || '').trim();
          if (!message) return jsonResponse({ ok: false, state });

          const lowerMsg = message.toLowerCase();
          const lowerUser = username.toLowerCase();
          if (state.moderation.bannedUsers.some((u) => u.toLowerCase() === lowerUser)) {
            return jsonResponse({ ok: false, state });
          }
          if (state.moderation.stopWords.some((w) => w && lowerMsg.includes(w.toLowerCase()))) {
            return jsonResponse({ ok: false, state });
          }

          state.totalMessages += 1;
          if (!state.scores[username]) {
            state.scores[username] = { username, avatar: '🎮', points: 0, wins: 0 };
          }
          const ev = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            type: 'chat',
            timestamp: Date.now(),
            username,
            message,
          };
          state.recentEvents = [ev, ...state.recentEvents].slice(0, 60);
          return jsonResponse({ ok: true, event: ev, state });
        }

        if (type === 'gift') {
          const username = String(body.username || 'Донатер').replace(/^@/, '').trim();
          const giftName = String(body.giftName || 'Роза');
          const coins = Number(body.coins || 1);
          const giftEmoji = typeof body.giftEmoji === 'string' ? body.giftEmoji : '🌹';
          state.totalGifts += 1;
          if (!state.scores[username]) {
            state.scores[username] = { username, avatar: '💎', points: 0, wins: 0 };
          }
          state.scores[username].points += Math.max(1, Math.min(10, Math.round(coins / 2)));
          const ev = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            type: 'gift',
            timestamp: Date.now(),
            username,
            giftName,
            giftEmoji,
            coins,
          };
          state.recentEvents = [ev, ...state.recentEvents].slice(0, 60);
          return jsonResponse({ ok: true, event: ev, state });
        }

        if (type === 'control') {
          const action = String(body.action || '');
          const payload = body.payload || {};
          if (action === 'set_game' && typeof payload.slug === 'string') state.activeGameSlug = payload.slug;
          if (action === 'reset_scores') state.scores = {};
          if (action === 'award_point' && typeof payload.username === 'string') {
            const u = payload.username;
            if (!state.scores[u]) state.scores[u] = { username: u, avatar: '🏆', points: 0, wins: 0 };
            state.scores[u].points += Number(payload.points || 1);
            if (payload.win) state.scores[u].wins += 1;
          }
          if (action === 'update_skin' && payload.skin) state.skin = { ...state.skin, ...payload.skin };
          if (action === 'update_moderation' && payload.moderation) state.moderation = { ...state.moderation, ...payload.moderation };
          if (action === 'update_playlist' && payload.playlist) state.playlist = { ...state.playlist, ...payload.playlist };
          if (action === 'set_gift_preset' && typeof payload.preset === 'string') state.giftPreset = payload.preset;
          if (action === 'add_custom_content' && Array.isArray(payload.items)) {
            state.customItems = [...payload.items, ...state.customItems].slice(0, 200);
          }
          const ev = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            type: 'control',
            timestamp: Date.now(),
            username: 'Streamer',
            controlAction: action,
            payload,
          };
          state.recentEvents = [ev, ...state.recentEvents].slice(0, 60);
          return jsonResponse({ ok: true, event: ev, state });
        }

        return jsonResponse({ ok: false, error: 'Unsupported type' }, 400);
      } catch {
        return jsonResponse({ ok: false, error: 'Bad request' }, 400);
      }
    }

    // Dynamic fallback for any /play/[token]/[slug] -> serve pre-rendered /play/streamer-demo/[slug]
    const playMatch = pathname.match(/^\/play\/[^/]+\/([^/]+)\/?$/);
    if (playMatch && playMatch[1]) {
      const targetUrl = new URL('/play/streamer-demo/' + playMatch[1], url.origin);
      const assetRes = await env.ASSETS.fetch(new Request(targetUrl.toString(), request));
      if (assetRes.ok) {
        return new Response(assetRes.body, {
          status: 200,
          headers: assetRes.headers,
        });
      }
    }

    // Try exact asset or clean .html route
    let res = await env.ASSETS.fetch(request);
    if (res.status === 404 && !pathname.includes('.')) {
      const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
      const htmlReq = new Request(url.origin + cleanPath + '.html', request);
      const htmlRes = await env.ASSETS.fetch(htmlReq);
      if (htmlRes.ok) return htmlRes;
    }

    return res;
  },
};

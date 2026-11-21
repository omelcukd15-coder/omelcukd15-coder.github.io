import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'cloudflare-dist');
const nextAppDir = path.join(root, '.next', 'server', 'app');
const nextStaticDir = path.join(root, '.next', 'static');
const publicDir = path.join(root, 'public');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy public/ assets
copyDir(publicDir, outDir);

// 2. Copy .next/static -> _next/static
copyDir(nextStaticDir, path.join(outDir, '_next', 'static'));

// 3. Copy generated .html pages from .next/server/app -> cloudflare-dist
function copyHtmlPages(src, baseOut) {
  if (!fs.existsSync(src)) return;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    if (entry.isDirectory()) {
      copyHtmlPages(srcPath, path.join(baseOut, entry.name));
    } else if (entry.name.endsWith('.html')) {
      fs.mkdirSync(baseOut, { recursive: true });
      const targetName = entry.name === '_not-found.html' ? '404.html' : entry.name;
      fs.copyFileSync(srcPath, path.join(baseOut, targetName));
    }
  }
}

copyHtmlPages(nextAppDir, outDir);

// 3b. Ensure .nojekyll and root index.html redirect for GitHub Pages compatibility
fs.writeFileSync(path.join(outDir, '.nojekyll'), '', 'utf8');
fs.writeFileSync(
  path.join(outDir, 'index.html'),
  '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/ru"><script>location.replace("/ru");</script><title>VibePlay LIVE</title></head><body><a href="/ru">Перейти к VibePlay LIVE</a></body></html>',
  'utf8'
);

// 4. Write Cloudflare Worker with compact @bufbuild/protobuf/wire reader + TikTok room resolver
const workerCode = `import { BinaryReader } from './node_modules/@bufbuild/protobuf/dist/esm/wire/index.js';

const rooms = new Map();
const seenMsgIds = new Map();

function normalizeUsername(raw) {
  let s = String(raw || '').trim();
  const m = s.match(/tiktok\\.com\\/@([^/?#]+)/i);
  if (m && m[1]) s = m[1];
  return s.replace(/^@/, '').replace(/\\/.*$/, '').trim();
}

function getRoom(token) {
  const key = (token || 'streamer-demo').trim();
  if (!rooms.has(key)) {
    rooms.set(key, {
      state: {
        token: key,
        tiktokUsername: '',
        roomId: '',
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
          antiFloodSec: 0,
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
      },
      roomId: '',
      cursor: '',
      lastConnectAttempt: 0,
      eulerBlocked: false,
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

function pushEvent(room, ev) {
  if (ev.id) {
    let set = seenMsgIds.get(room.state.token);
    if (!set) {
      set = new Set();
      seenMsgIds.set(room.state.token, set);
    }
    if (set.has(ev.id)) return false;
    set.add(ev.id);
    if (set.size > 500) {
      const first = set.values().next().value;
      if (first) set.delete(first);
    }
  }
  room.state.recentEvents = [ev, ...room.state.recentEvents].slice(0, 60);
  return true;
}

function decodeImageFirstUrl(bytes) {
  const r = new BinaryReader(bytes);
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) return r.string();
    r.skip(wire);
  }
  return undefined;
}

function decodeUserMinimal(bytes) {
  const r = new BinaryReader(bytes);
  let displayId = '';
  let nickname = '';
  let avatar;
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 3 && wire === 2) nickname = r.string();
    else if (field === 9 && wire === 2) {
      const b = r.bytes();
      if (!avatar) avatar = decodeImageFirstUrl(b);
    } else if (field === 38 && wire === 2) displayId = r.string();
    else r.skip(wire);
  }
  return { displayId, nickname, avatar };
}

function decodeGiftMinimal(bytes) {
  const r = new BinaryReader(bytes);
  let name = '';
  let diamondCount = 1;
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 12 && wire === 0) diamondCount = r.int32();
    else if (field === 16 && wire === 2) name = r.string();
    else r.skip(wire);
  }
  return { name, diamondCount };
}

function decodeBaseProtoMessage(bytes) {
  const r = new BinaryReader(bytes);
  let method = '';
  let payload = new Uint8Array(0);
  let msgId = '';
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) method = r.string();
    else if (field === 2 && wire === 2) payload = r.bytes();
    else if (field === 3 && wire === 0) msgId = r.int64().toString();
    else r.skip(wire);
  }
  return { method, payload, msgId };
}

function decodePartialProtoFetchResult(buf) {
  const br = new BinaryReader(buf);
  const events = [];
  let cursor = '';
  let viewerCount;
  const now = Date.now();
  const td = new TextDecoder();

  try {
    while (br.pos < br.len) {
      const tag = br.uint32();
      const fieldNo = tag >>> 3;
      const wireType = tag & 7;
      if (wireType === 2) {
        const len = br.uint32();
        if (br.pos + len > br.len) break;
        const slice = buf.subarray(br.pos, br.pos + len);
        br.pos += len;

        if (fieldNo === 1) {
          try {
            const msg = decodeBaseProtoMessage(slice);
            if (!msg.payload || msg.payload.length === 0) continue;
            if (msg.method === 'WebcastChatMessage') {
              const r = new BinaryReader(msg.payload);
              let user = { displayId: '', nickname: '' };
              let content = '';
              while (r.pos < r.len) {
                const t = r.uint32();
                const f = t >>> 3;
                const w = t & 7;
                if (f === 2 && w === 2) user = decodeUserMinimal(r.bytes());
                else if (f === 3 && w === 2) content = r.string();
                else r.skip(w);
              }
              const text = content.trim();
              if (text) {
                events.push({
                  id: msg.msgId || 'tt-' + now + '-' + Math.random().toString(36).slice(2, 6),
                  type: 'chat',
                  timestamp: now,
                  username: user.displayId || user.nickname || 'viewer',
                  avatar: user.avatar,
                  message: text,
                });
              }
            } else if (msg.method === 'WebcastGiftMessage') {
              const r = new BinaryReader(msg.payload);
              let repeatCount = 1;
              let comboCount = 1;
              let repeatEnd = 0;
              let user = { displayId: '', nickname: '' };
              let giftInfo = { name: '', diamondCount: 1 };
              while (r.pos < r.len) {
                const t = r.uint32();
                const f = t >>> 3;
                const w = t & 7;
                if (f === 5 && w === 0) repeatCount = r.int32();
                else if (f === 6 && w === 0) comboCount = r.int32();
                else if (f === 7 && w === 2) user = decodeUserMinimal(r.bytes());
                else if (f === 9 && w === 0) repeatEnd = r.int32();
                else if (f === 15 && w === 2) giftInfo = decodeGiftMinimal(r.bytes());
                else r.skip(w);
              }
              if (!(repeatEnd === 1 && comboCount > 1)) {
                const coins = Math.max(1, giftInfo.diamondCount || 1) * Math.max(1, repeatCount || comboCount || 1);
                events.push({
                  id: msg.msgId || 'ttg-' + now + '-' + Math.random().toString(36).slice(2, 6),
                  type: 'gift',
                  timestamp: now,
                  username: user.displayId || user.nickname || 'supporter',
                  avatar: user.avatar,
                  giftName: giftInfo.name || 'Подарок',
                  giftEmoji: coins >= 100 ? '🦁' : coins >= 30 ? '🍩' : '🌹',
                  coins,
                });
              }
            } else if (msg.method === 'WebcastLikeMessage') {
              const r = new BinaryReader(msg.payload);
              let count = 1;
              let user = { displayId: '', nickname: '' };
              while (r.pos < r.len) {
                const t = r.uint32();
                const f = t >>> 3;
                const w = t & 7;
                if (f === 2 && w === 0) count = r.int32();
                else if (f === 5 && w === 2) user = decodeUserMinimal(r.bytes());
                else r.skip(w);
              }
              events.push({
                id: msg.msgId || 'ttl-' + now + '-' + Math.random().toString(36).slice(2, 6),
                type: 'like',
                timestamp: now,
                username: user.displayId || user.nickname || 'viewer',
                likeCount: Math.max(1, count || 1),
              });
            } else if (msg.method === 'WebcastRoomUserSeqMessage') {
              const r = new BinaryReader(msg.payload);
              while (r.pos < r.len) {
                const t = r.uint32();
                const f = t >>> 3;
                const w = t & 7;
                if (f === 3 && w === 0) {
                  viewerCount = Number(r.int64());
                  break;
                }
                r.skip(w);
              }
            }
          } catch {
            // skip single message decode error
          }
        } else if (fieldNo === 2) {
          cursor = td.decode(slice);
        }
      } else {
        br.skip(wireType);
      }
    }
  } catch {
    // ignore partial trailing tail
  }
  return { cursor, viewerCount, events };
}

async function fetchWebcastBatchFast(roomId, cursor, chunkIdleMs = 750) {
  const url =
    'https://api.eulerstream.com/webcast/rooms/' +
    encodeURIComponent(roomId) +
    '/connect?client=ttlive-node&client_enter=true&platform=web' +
    (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
  const ctrl = new AbortController();
  const maxTimer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/protobuf,application/json' },
      signal: ctrl.signal,
    });
    if (!res.ok || !res.body) {
      clearTimeout(maxTimer);
      return { status: res.status, cursor: cursor || '', events: [] };
    }
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const step = await Promise.race([
        reader.read(),
        new Promise((resolve) => setTimeout(() => resolve({ idleTimeout: true }), chunkIdleMs)),
      ]);
      if (step.idleTimeout || step.done) break;
      if (step.value && step.value.byteLength > 0) {
        chunks.push(step.value);
        total += step.value.byteLength;
      }
    }
    try { await reader.cancel(); } catch {}
    clearTimeout(maxTimer);

    const buf = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      buf.set(c, offset);
      offset += c.byteLength;
    }
    const decoded = decodePartialProtoFetchResult(buf);
    return {
      status: res.status,
      cursor: decoded.cursor || cursor || '',
      viewerCount: decoded.viewerCount,
      events: decoded.events,
    };
  } catch {
    clearTimeout(maxTimer);
    return { status: 0, cursor: cursor || '', events: [] };
  }
}

async function resolveTikTokRoom(username) {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
  try {
    const params = new URLSearchParams({
      aid: '1988',
      app_language: 'en',
      app_name: 'tiktok_web',
      browser_language: 'en-US',
      browser_name: 'Mozilla',
      browser_online: 'true',
      browser_platform: 'Win32',
      browser_version: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      cookie_enabled: 'true',
      device_platform: 'web_pc',
      focus_state: 'true',
      from_page: 'user',
      history_len: '10',
      is_fullscreen: 'false',
      is_page_visible: 'true',
      screen_height: '1080',
      screen_width: '1920',
      tz_name: 'Europe/Berlin',
      referer: 'https://www.tiktok.com/',
      root_referer: 'https://www.tiktok.com/',
      channel: 'tiktok_web',
      data_collection_enabled: 'true',
      os: 'windows',
      priority_region: 'US',
      region: 'US',
      user_is_login: 'true',
      webcast_language: 'en',
      device_id: '7382910492837465192',
      uniqueId: username,
      sourceType: '54',
    });
    const apiRes = await fetch('https://www.tiktok.com/api-live/user/room/?' + params.toString(), {
      headers: { 'User-Agent': ua, Referer: 'https://www.tiktok.com/' },
    });
    if (apiRes.ok) {
      const text = await apiRes.text();
      if (text) {
        const json = JSON.parse(text);
        const rid = json?.data?.user?.roomId;
        const status = json?.data?.liveRoom?.status;
        const viewerCount = Number(json?.data?.liveRoom?.liveRoomStats?.userCount || 0);
        if (rid) return { roomId: String(rid), isOnline: status === 2, viewerCount: Number.isFinite(viewerCount) ? viewerCount : 0 };
      }
    }
  } catch {
    // fallback to HTML
  }

  try {
    const htmlRes = await fetch('https://www.tiktok.com/@' + encodeURIComponent(username) + '/live', {
      headers: { 'User-Agent': ua },
    });
    const html = await htmlRes.text();
    const m = html.match(/"roomId":"(\\d+)"/) || html.match(/"room_id":"(\\d+)"/);
    const online = html.includes('"status":2');
    if (m && m[1]) return { roomId: m[1], isOnline: online, viewerCount: 0 };
  } catch {
    // ignore
  }
  return { roomId: '', isOnline: false, viewerCount: 0 };
}

function ingestEventsIntoRoom(room, events, viewerCount) {
  if (typeof viewerCount === 'number' && Number.isFinite(viewerCount) && viewerCount > 0) {
    room.state.viewerCount = viewerCount;
    if (viewerCount > room.state.peakViewers) room.state.peakViewers = viewerCount;
  }
  for (const ev of events || []) {
    if (ev.type === 'chat' && ev.message) {
      const lowerUser = String(ev.username || '').toLowerCase();
      const lowerText = String(ev.message || '').toLowerCase();
      if (room.state.moderation.bannedUsers.some((u) => u.toLowerCase() === lowerUser)) continue;
      if (room.state.moderation.stopWords.some((w) => w && lowerText.includes(w.toLowerCase()))) continue;
      if (pushEvent(room, ev)) {
        room.state.totalMessages += 1;
        if (!room.state.scores[ev.username]) {
          room.state.scores[ev.username] = { username: ev.username, avatar: ev.avatar || '🎮', points: 0, wins: 0 };
        }
      }
    } else if (ev.type === 'gift') {
      if (pushEvent(room, ev)) {
        room.state.totalGifts += 1;
        const coins = Number(ev.coins || 1);
        if (!room.state.scores[ev.username]) {
          room.state.scores[ev.username] = { username: ev.username, avatar: ev.avatar || '💎', points: 0, wins: 0 };
        }
        room.state.scores[ev.username].points += Math.max(1, Math.min(10, Math.round(coins / 2)));
      }
    } else if (ev.type === 'like') {
      if (pushEvent(room, ev)) {
        room.state.totalLikes += Number(ev.likeCount || 1);
      }
    }
  }
}

async function connectRoomTikTok(room, rawUsername, forceRefresh = false) {
  const username = normalizeUsername(rawUsername);
  if (!username) {
    room.state.tiktokUsername = '';
    room.state.roomId = '';
    room.state.connectionStatus = 'disconnected';
    room.state.connectionError = null;
    return room.state;
  }

  const now = Date.now();
  if (!forceRefresh && room.state.tiktokUsername.toLowerCase() === username.toLowerCase() && room.state.connectionStatus === 'connected' && room.state.roomId) {
    if (!room.eulerBlocked && now - room.lastConnectAttempt >= 2500) {
      room.lastConnectAttempt = now;
      const batch = await fetchWebcastBatchFast(room.state.roomId, room.cursor, 750);
      if (batch.status === 200) {
        if (batch.cursor) room.cursor = batch.cursor;
        ingestEventsIntoRoom(room, batch.events, batch.viewerCount);
      } else if (batch.status === 401 || batch.status === 403 || batch.status === 429) {
        room.eulerBlocked = true;
      }
    }
    return room.state;
  }
  if (!forceRefresh && now - room.lastConnectAttempt < 2500) {
    return room.state;
  }
  room.lastConnectAttempt = now;
  room.state.tiktokUsername = username;

  const { roomId, isOnline, viewerCount } = await resolveTikTokRoom(username);
  if (!roomId || !isOnline) {
    room.roomId = '';
    room.state.roomId = '';
    room.state.connectionStatus = 'error';
    room.state.connectionError = 'Эфир @' + username + ' сейчас оффлайн на TikTok или ещё не запущен.';
    return room.state;
  }

  room.roomId = roomId;
  room.state.roomId = roomId;
  room.cursor = '';
  room.eulerBlocked = false;
  if (viewerCount > 0) {
    room.state.viewerCount = viewerCount;
    if (viewerCount > room.state.peakViewers) room.state.peakViewers = viewerCount;
  }
  room.state.connectionStatus = 'connected';
  room.state.connectionError = null;

  const batch = await fetchWebcastBatchFast(roomId, '', 750);
  if (batch.status === 200) {
    if (batch.cursor) room.cursor = batch.cursor;
    ingestEventsIntoRoom(room, batch.events, batch.viewerCount);
  } else if (batch.status === 401 || batch.status === 403 || batch.status === 429) {
    // EulerStream blocks Worker datacenter IPs; keep room connected so browser CORS reader streams events
    room.eulerBlocked = true;
  }

  return room.state;
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
      const qUser = url.searchParams.get('username') || '';
      const room = getRoom(token);

      if (qUser.trim()) {
        await connectRoomTikTok(room, qUser, false);
      }

      if (mode === 'json') {
        return jsonResponse({ ok: true, state: room.state });
      }
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: ' + JSON.stringify({ state: room.state }) + '\\n\\n'));
          const timer = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(': ping\\n\\n'));
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
        const room = getRoom(token);

        if (action === 'disconnect') {
          room.roomId = '';
          room.state.roomId = '';
          room.state.connectionStatus = 'disconnected';
          room.state.connectionError = null;
          return jsonResponse({ ok: true, state: room.state });
        }

        if (action === 'toggle_bots') {
          room.state.botsEnabled = Boolean(body.enabled);
          if (typeof body.gameSlug === 'string') room.state.activeGameSlug = body.gameSlug;
          return jsonResponse({ ok: true, state: room.state });
        }

        const state = await connectRoomTikTok(room, String(body.username || ''), true);
        return jsonResponse({ ok: state.connectionStatus === 'connected', state });
      } catch {
        return jsonResponse({ ok: false, error: 'Bad request' }, 400);
      }
    }

    // API: /api/live/event
    if (pathname === '/api/live/event' && request.method === 'POST') {
      try {
        const body = await request.json();
        const token = String(body.token || 'streamer-demo');
        const type = String(body.type || 'chat');
        const externalId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : '';
        const room = getRoom(token);
        const state = room.state;

        if (typeof body.viewerCount === 'number' && Number.isFinite(body.viewerCount) && body.viewerCount > 0) {
          state.viewerCount = body.viewerCount;
          if (body.viewerCount > state.peakViewers) state.peakViewers = body.viewerCount;
        }

        if (type === 'viewer_count') {
          return jsonResponse({ ok: true, state });
        }

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

          const ev = {
            id: externalId || Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            type: 'chat',
            timestamp: Date.now(),
            username,
            avatar: typeof body.avatar === 'string' ? body.avatar : undefined,
            message,
          };
          if (!pushEvent(room, ev)) {
            return jsonResponse({ ok: false, state });
          }
          state.totalMessages += 1;
          if (!state.scores[username]) {
            state.scores[username] = { username, avatar: '🎮', points: 0, wins: 0 };
          }
          return jsonResponse({ ok: true, event: ev, state });
        }

        if (type === 'gift') {
          const username = String(body.username || 'Донатер').replace(/^@/, '').trim();
          const giftName = String(body.giftName || 'Роза');
          const coins = Number(body.coins || 1);
          const giftEmoji = typeof body.giftEmoji === 'string' ? body.giftEmoji : '🌹';
          const ev = {
            id: externalId || Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            type: 'gift',
            timestamp: Date.now(),
            username,
            avatar: typeof body.avatar === 'string' ? body.avatar : undefined,
            giftName,
            giftEmoji,
            coins,
          };
          if (!pushEvent(room, ev)) {
            return jsonResponse({ ok: false, state });
          }
          state.totalGifts += 1;
          if (!state.scores[username]) {
            state.scores[username] = { username, avatar: '💎', points: 0, wins: 0 };
          }
          state.scores[username].points += Math.max(1, Math.min(10, Math.round(coins / 2)));
          return jsonResponse({ ok: true, event: ev, state });
        }

        if (type === 'like') {
          const username = String(body.username || 'Зритель').replace(/^@/, '').trim();
          const likeCount = Math.max(1, Number(body.likeCount || 1));
          const ev = {
            id: externalId || Date.now() + '-like-' + Math.random().toString(36).slice(2, 6),
            type: 'like',
            timestamp: Date.now(),
            username,
            likeCount,
          };
          if (!pushEvent(room, ev)) {
            return jsonResponse({ ok: false, state });
          }
          state.totalLikes += likeCount;
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
          pushEvent(room, ev);
          return jsonResponse({ ok: true, event: ev, state });
        }

        return jsonResponse({ ok: false, error: 'Unsupported type' }, 400);
      } catch {
        return jsonResponse({ ok: false, error: 'Bad request' }, 400);
      }
    }

    // Dynamic fallback for any /play/[token]/[slug] -> serve pre-rendered /play/streamer-demo/[slug]
    const playMatch = pathname.match(/^\\/play\\/[^/]+\\/([^/]+)\\/?$/);
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
`;

fs.writeFileSync(path.join(root, 'cloudflare-worker.js'), workerCode, 'utf8');
console.log('Prepared cloudflare-dist/ and cloudflare-worker.js successfully.');

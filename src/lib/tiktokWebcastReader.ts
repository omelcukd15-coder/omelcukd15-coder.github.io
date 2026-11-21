import { BinaryReader } from '@bufbuild/protobuf/wire';

export interface FastWebcastEvent {
  id: string;
  type: 'chat' | 'gift' | 'like';
  timestamp: number;
  username: string;
  avatar?: string;
  message?: string;
  giftName?: string;
  giftEmoji?: string;
  coins?: number;
  likeCount?: number;
}

export interface FastWebcastBatch {
  status: number;
  cursor: string;
  viewerCount?: number;
  events: FastWebcastEvent[];
}

export interface TikTokRoomInfo {
  roomId: string;
  isOnline: boolean;
  viewerCount: number;
}

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

export function buildTikTokApiParams(username: string): URLSearchParams {
  return new URLSearchParams({
    aid: '1988',
    app_language: 'en',
    app_name: 'tiktok_web',
    browser_language: 'en-US',
    browser_name: 'Mozilla',
    browser_online: 'true',
    browser_platform: 'Win32',
    browser_version:
      '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
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
}

/**
 * Resolves TikTok roomId, live online state (status === 2), and current viewer count
 * for server / Worker environments where tiktok.com API requests are permitted.
 */
export async function resolveTikTokRoomInfo(username: string): Promise<TikTokRoomInfo> {
  const clean = username.trim().replace(/^@+/, '');
  if (!clean) return { roomId: '', isOnline: false, viewerCount: 0 };

  try {
    const params = buildTikTokApiParams(clean);
    const res = await fetch(`https://www.tiktok.com/api-live/user/room/?${params.toString()}`, {
      headers: {
        'User-Agent': DEFAULT_UA,
        Referer: 'https://www.tiktok.com/',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const text = await res.text();
      if (text) {
        const json = JSON.parse(text);
        const rid = json?.data?.user?.roomId;
        const status = json?.data?.liveRoom?.status;
        const userCount = Number(json?.data?.liveRoom?.liveRoomStats?.userCount || 0);
        if (rid) {
          return {
            roomId: String(rid),
            isOnline: status === 2,
            viewerCount: Number.isFinite(userCount) ? userCount : 0,
          };
        }
      }
    }
  } catch {
    // Fallback to HTML extraction below
  }

  try {
    const htmlRes = await fetch(`https://www.tiktok.com/@${encodeURIComponent(clean)}/live`, {
      headers: { 'User-Agent': DEFAULT_UA },
      signal: AbortSignal.timeout(6000),
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const m = html.match(/"roomId":"(\d+)"/) || html.match(/"room_id":"(\d+)"/);
      const isOnline = html.includes('"status":2');
      if (m && m[1]) {
        return { roomId: m[1], isOnline, viewerCount: 0 };
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return { roomId: '', isOnline: false, viewerCount: 0 };
}

function decodeImageFirstUrl(bytes: Uint8Array): string | undefined {
  const r = new BinaryReader(bytes);
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      return r.string();
    }
    r.skip(wire);
  }
  return undefined;
}

function decodeUserMinimal(bytes: Uint8Array): { displayId: string; nickname: string; avatar?: string } {
  const r = new BinaryReader(bytes);
  let displayId = '';
  let nickname = '';
  let avatar: string | undefined;
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 3 && wire === 2) {
      nickname = r.string();
    } else if (field === 9 && wire === 2) {
      const imgBytes = r.bytes();
      if (!avatar) avatar = decodeImageFirstUrl(imgBytes);
    } else if (field === 38 && wire === 2) {
      displayId = r.string();
    } else {
      r.skip(wire);
    }
  }
  return { displayId, nickname, avatar };
}

function decodeGiftMinimal(bytes: Uint8Array): { name: string; diamondCount: number } {
  const r = new BinaryReader(bytes);
  let name = '';
  let diamondCount = 1;
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 12 && wire === 0) {
      diamondCount = r.int32();
    } else if (field === 16 && wire === 2) {
      name = r.string();
    } else {
      r.skip(wire);
    }
  }
  return { name, diamondCount };
}

function decodeBaseProtoMessage(bytes: Uint8Array): { method: string; payload: Uint8Array; msgId: string } {
  const r = new BinaryReader(bytes);
  let method = '';
  let payload: Uint8Array = new Uint8Array(0);
  let msgId = '';
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 1 && wire === 2) {
      method = r.string();
    } else if (field === 2 && wire === 2) {
      payload = r.bytes();
    } else if (field === 3 && wire === 0) {
      msgId = r.int64().toString();
    } else {
      r.skip(wire);
    }
  }
  return { method, payload, msgId };
}

function decodeChatPayload(payload: Uint8Array, msgId: string, now: number): FastWebcastEvent | null {
  const r = new BinaryReader(payload);
  let user: { displayId: string; nickname: string; avatar?: string } = { displayId: '', nickname: '' };
  let content = '';
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 2 && wire === 2) {
      user = decodeUserMinimal(r.bytes());
    } else if (field === 3 && wire === 2) {
      content = r.string();
    } else {
      r.skip(wire);
    }
  }
  const text = content.trim();
  if (!text) return null;
  return {
    id: msgId || `chat-${now}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'chat',
    timestamp: now,
    username: user.displayId || user.nickname || 'viewer',
    avatar: user.avatar,
    message: text,
  };
}

function decodeGiftPayload(payload: Uint8Array, msgId: string, now: number): FastWebcastEvent | null {
  const r = new BinaryReader(payload);
  let giftId = '0';
  let repeatCount = 1;
  let comboCount = 1;
  let repeatEnd = 0;
  let user: { displayId: string; nickname: string; avatar?: string } = { displayId: '', nickname: '' };
  let giftInfo: { name: string; diamondCount: number } = { name: '', diamondCount: 1 };

  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 2 && wire === 0) {
      giftId = r.int64().toString();
    } else if (field === 5 && wire === 0) {
      repeatCount = r.int32();
    } else if (field === 6 && wire === 0) {
      comboCount = r.int32();
    } else if (field === 7 && wire === 2) {
      user = decodeUserMinimal(r.bytes());
    } else if (field === 9 && wire === 0) {
      repeatEnd = r.int32();
    } else if (field === 15 && wire === 2) {
      giftInfo = decodeGiftMinimal(r.bytes());
    } else {
      r.skip(wire);
    }
  }

  // Avoid noisy final combo-end summary duplicate when comboCount > 1 and repeatEnd === 1
  if (repeatEnd === 1 && comboCount > 1) {
    return null;
  }

  const count = Math.max(1, repeatCount || comboCount || 1);
  const coins = Math.max(1, giftInfo.diamondCount || 1) * count;
  return {
    id: msgId || `gift-${giftId}-${now}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'gift',
    timestamp: now,
    username: user.displayId || user.nickname || 'viewer',
    avatar: user.avatar,
    giftName: giftInfo.name || 'Gift',
    giftEmoji: coins >= 100 ? '🦁' : coins >= 30 ? '🍩' : '🌹',
    coins,
  };
}

function decodeLikePayload(payload: Uint8Array, msgId: string, now: number): FastWebcastEvent {
  const r = new BinaryReader(payload);
  let count = 1;
  let user: { displayId: string; nickname: string; avatar?: string } = { displayId: '', nickname: '' };
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 2 && wire === 0) {
      count = r.int32();
    } else if (field === 5 && wire === 2) {
      user = decodeUserMinimal(r.bytes());
    } else {
      r.skip(wire);
    }
  }
  return {
    id: msgId || `like-${now}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'like',
    timestamp: now,
    username: user.displayId || user.nickname || 'viewer',
    avatar: user.avatar,
    likeCount: Math.max(1, count || 1),
  };
}

function decodeViewerCountPayload(payload: Uint8Array): number | undefined {
  const r = new BinaryReader(payload);
  while (r.pos < r.len) {
    const tag = r.uint32();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 3 && wire === 0) {
      const total = Number(r.int64());
      return Number.isFinite(total) && total >= 0 ? total : undefined;
    }
    r.skip(wire);
  }
  return undefined;
}

/**
 * Decodes top-level fields of ProtoMessageFetchResult safely from a partial chunked stream.
 * If the trailing protobuf field was truncated by the idle deadline, stops cleanly without throwing.
 */
export function decodePartialProtoFetchResult(buf: Uint8Array): {
  cursor: string;
  viewerCount?: number;
  events: FastWebcastEvent[];
} {
  const br = new BinaryReader(buf);
  const events: FastWebcastEvent[] = [];
  let cursor = '';
  let viewerCount: number | undefined;
  const now = Date.now();
  const textDecoder = new TextDecoder();

  try {
    while (br.pos < br.len) {
      const tag = br.uint32();
      const fieldNo = tag >>> 3;
      const wireType = tag & 7;
      if (wireType === 2) {
        const len = br.uint32();
        if (br.pos + len > br.len) {
          break;
        }
        const slice = buf.subarray(br.pos, br.pos + len);
        br.pos += len;

        if (fieldNo === 1) {
          try {
            const msg = decodeBaseProtoMessage(slice);
            if (!msg.payload || msg.payload.length === 0) continue;
            if (msg.method === 'WebcastChatMessage') {
              const ev = decodeChatPayload(msg.payload, msg.msgId, now);
              if (ev) events.push(ev);
            } else if (msg.method === 'WebcastGiftMessage') {
              const ev = decodeGiftPayload(msg.payload, msg.msgId, now);
              if (ev) events.push(ev);
            } else if (msg.method === 'WebcastLikeMessage') {
              events.push(decodeLikePayload(msg.payload, msg.msgId, now));
            } else if (msg.method === 'WebcastRoomUserSeqMessage') {
              const vc = decodeViewerCountPayload(msg.payload);
              if (vc !== undefined) viewerCount = vc;
            }
          } catch {
            // Skip malformed single message
          }
        } else if (fieldNo === 2) {
          cursor = textDecoder.decode(slice);
        }
      } else {
        br.skip(wireType);
      }
    }
  } catch {
    // Gracefully keep all complete messages decoded before EOF
  }

  return { cursor, viewerCount, events };
}

/**
 * Fetches a live message batch from EulerStream Webcast endpoint using an idle-chunk
 * stream reader (~1.5-2.5s latency instead of waiting 15s for trailing keepalive stall).
 * Works directly in browsers (CORS enabled on EulerStream) and Node.js.
 */
export async function fetchWebcastBatchFast(
  roomId: string,
  cursor?: string,
  chunkIdleMs = 750
): Promise<FastWebcastBatch> {
  if (!roomId) return { status: 400, cursor: cursor || '', events: [] };

  const url =
    `https://api.eulerstream.com/webcast/rooms/${encodeURIComponent(roomId)}/connect?client=ttlive-node&client_enter=true&platform=web` +
    (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');

  const controller = new AbortController();
  const maxBudgetTimer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/protobuf,application/json' },
      signal: controller.signal,
    });

    if (!res.ok || !res.body) {
      clearTimeout(maxBudgetTimer);
      return { status: res.status, cursor: cursor || '', events: [] };
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const step = await Promise.race([
        reader.read(),
        new Promise<{ idleTimeout: true }>((resolve) =>
          setTimeout(() => resolve({ idleTimeout: true }), chunkIdleMs)
        ),
      ]);
      if (!('done' in step)) {
        break;
      }
      if (step.done) break;
      if (step.value && step.value.byteLength > 0) {
        chunks.push(step.value);
        total += step.value.byteLength;
      }
    }

    try {
      await reader.cancel();
    } catch {
      // ignore cancel errors
    }
    clearTimeout(maxBudgetTimer);

    const buf = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      buf.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const decoded = decodePartialProtoFetchResult(buf);
    return {
      status: res.status,
      cursor: decoded.cursor || cursor || '',
      viewerCount: decoded.viewerCount,
      events: decoded.events,
    };
  } catch {
    clearTimeout(maxBudgetTimer);
    return { status: 0, cursor: cursor || '', events: [] };
  }
}

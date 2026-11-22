export interface StreamerProfile {
  token: string;
  email: string;
  tiktokUsername: string;
  displayName: string;
}

const USER_KEY = 'vp_user';
const NICK_KEY = 'vp_tiktok_nick';

export function normalizeNick(raw: string): string {
  let s = String(raw || '').trim();
  const m = s.match(/tiktok\.com\/@([^/?#]+)/i);
  if (m && m[1]) s = m[1];
  return s.replace(/^@+/, '').replace(/\/.*$/, '').trim();
}

function generateRoomToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `vp_${suffix}`;
}

export function getOrCreateStreamerProfile(): StreamerProfile {
  if (typeof window === 'undefined') {
    return {
      token: 'live',
      email: '',
      tiktokUsername: '',
      displayName: 'Стример',
    };
  }

  let stored: Partial<StreamerProfile> = {};
  let savedNick = '';

  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      stored = JSON.parse(raw) as Partial<StreamerProfile>;
    }
    savedNick = normalizeNick(localStorage.getItem(NICK_KEY) || '');
  } catch {
    // ignore storage read errors
  }

  const cleanNick = normalizeNick(stored.tiktokUsername || savedNick || '');
  const rawToken = typeof stored.token === 'string' ? stored.token.trim() : '';
  const isLegacyToken = !rawToken || rawToken === 'streamer-demo' || rawToken === 'live';
  const token = isLegacyToken ? generateRoomToken() : rawToken;

  const rawEmail = typeof stored.email === 'string' ? stored.email.trim() : '';
  const email = rawEmail && rawEmail !== 'demo@vibeplay.live' ? rawEmail : '';

  const rawDisplay = typeof stored.displayName === 'string' ? stored.displayName.trim() : '';
  const displayName =
    rawDisplay && rawDisplay !== 'Демо-стример'
      ? rawDisplay
      : cleanNick
      ? `@${cleanNick}`
      : email || 'Стример';

  const profile: StreamerProfile = {
    token,
    email,
    tiktokUsername: cleanNick,
    displayName,
  };

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    if (cleanNick) {
      localStorage.setItem(NICK_KEY, cleanNick);
    }
  } catch {
    // ignore storage write errors
  }

  return profile;
}

export function saveStreamerProfile(patch: Partial<StreamerProfile>): StreamerProfile {
  const current = getOrCreateStreamerProfile();
  const nextNick =
    patch.tiktokUsername !== undefined ? normalizeNick(patch.tiktokUsername) : current.tiktokUsername;
  const nextEmail = patch.email !== undefined ? patch.email.trim() : current.email;
  const nextToken = patch.token && patch.token.trim() && patch.token !== 'streamer-demo'
    ? patch.token.trim()
    : current.token;

  const nextDisplay =
    patch.displayName !== undefined && patch.displayName.trim()
      ? patch.displayName.trim()
      : nextNick
      ? `@${nextNick}`
      : nextEmail || current.displayName || 'Стример';

  const updated: StreamerProfile = {
    token: nextToken,
    email: nextEmail,
    tiktokUsername: nextNick,
    displayName: nextDisplay,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      if (nextNick) {
        localStorage.setItem(NICK_KEY, nextNick);
      }
    } catch {
      // ignore storage write errors
    }
  }

  return updated;
}

export function getStreamerToken(): string {
  return getOrCreateStreamerProfile().token;
}

export function buildLivePlayUrl(
  origin: string,
  slug: string,
  roomToken: string,
  tiktokNick?: string,
  obsClean = false
): string {
  const cleanOrigin = (origin || '').replace(/\/$/, '');
  const cleanNick = normalizeNick(tiktokNick || '');
  const cleanRoom = (roomToken || 'live').trim();
  const params = new URLSearchParams();
  params.set('room', cleanRoom);
  if (cleanNick) params.set('u', cleanNick);
  if (obsClean) params.set('obs', '1');
  const path = `/play/live/${slug}?${params.toString()}`;
  return cleanOrigin ? `${cleanOrigin}${path}` : path;
}

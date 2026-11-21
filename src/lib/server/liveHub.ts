import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import { fetchWebcastBatchFast, resolveTikTokRoomInfo, type FastWebcastEvent } from '@/lib/tiktokWebcastReader';

export type LiveEventType = 'chat' | 'gift' | 'like' | 'control' | 'status';

export interface LiveEvent {
  id: string;
  type: LiveEventType;
  timestamp: number;
  username: string;
  avatar?: string;
  message?: string;
  giftName?: string;
  giftEmoji?: string;
  coins?: number;
  likeCount?: number;
  controlAction?: string;
  payload?: Record<string, unknown>;
}

export interface ModerationConfigState {
  profanityOn: boolean;
  antiFloodSec: number;
  stopWords: string[];
  bannedUsers: string[];
  mutedUsers: string[];
}

export interface SkinConfigState {
  accentColor: string;
  backgroundMode: 'light' | 'neon' | 'sunset' | 'dark';
  ballShape: 'circle' | 'hex' | 'square';
  fontFamily: 'Manrope' | 'Unbounded';
  logoText: string;
}

export interface PlaylistConfigState {
  autopilot: boolean;
  rotateBy: 'rounds' | 'minutes';
  rotateInterval: number;
  queueSlugs: string[];
}

export interface SessionState {
  token: string;
  tiktokUsername: string;
  roomId?: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionError: string | null;
  botsEnabled: boolean;
  viewerCount: number;
  peakViewers: number;
  totalMessages: number;
  totalGifts: number;
  totalLikes: number;
  activeGameSlug: string;
  giftPreset: 'light' | 'hardcore' | 'donate';
  moderation: ModerationConfigState;
  skin: SkinConfigState;
  playlist: PlaylistConfigState;
  scores: Record<string, { username: string; avatar: string; points: number; wins: number }>;
  recentEvents: LiveEvent[];
  customItems: { id: string; gameSlug: string; text: string; answer: string }[];
}

interface InternalRoom {
  state: SessionState;
  tiktokConn: TikTokLiveConnection | null;
  subscribers: Set<(payload: { event?: LiveEvent; state: SessionState }) => void>;
  lastMessageAt: Map<string, number>;
  botTimer: ReturnType<typeof setInterval> | null;
  seenMsgIds: Set<string>;
  recentDedupeMap: Map<string, number>;
  webcastPollTimer: ReturnType<typeof setInterval> | null;
  webcastCursor: string;
}

const DEFAULT_PROFANITY = ['спам', 'реклама', 'http://', 'https://'];

const BOT_PLAYERS = [
  { username: 'artem_gg', avatar: '🧑‍💻' },
  { username: 'lera_fox', avatar: '🦊' },
  { username: 'max_turbo', avatar: '⚡' },
  { username: 'nika_star', avatar: '🌟' },
  { username: 'den_play', avatar: '🎮' },
  { username: 'sasha_win', avatar: '🏆' },
];

const BOT_MESSAGES_BY_GAME: Record<string, string[]> = {
  contexto: ['планета', 'звезда', 'луна', 'небо', 'ракета', 'галактика', 'вселенная', 'космос', 'море', 'волна', 'океан', 'песня', 'гитара', 'музыка', 'экран', 'телефон'],
  'flag-quiz': ['бразилия', 'япония', 'франция', 'турция', 'индонезия', 'германия', 'италия', 'корея', 'аргентина', 'канада'],
  'word-reveal': ['трансляция', 'микрофон', 'алгоритм', 'галактика', 'челлендж', 'стрим'],
  'doodle-guess': ['кот', 'дом', 'ракета', 'корона', 'пицца'],
  'logo-quiz': ['tiktok', 'youtube', 'twitch', 'telegram', 'spotify'],
  'spot-the-country': ['япония', 'франция', 'египет', 'сша'],
  'would-you-rather': ['1', '2', '1', '2'],
  'would-you-rather-vs': ['1', '2', '2', '1'],
  trivia: ['1', '2', '3', '4', 'аватар', 'fortnite', 'юпитер'],
  'ball-royale': ['вперёд!', 'го!', 'я здесь', 'победа!', 'атака', 'буст'],
  'land-grab': ['1', '2', '3', '4'],
  'secret-word': ['ОКЕАН', 'СТРИМ', 'МЕЧТА', 'ВИДЕО', 'ГОЛОС', 'ЗАМОК', 'ПЛАМЯ', 'ТИТАН'],
  snake: ['ням', 'яблоко!', 'расти', 'ещё!', 'топ'],
  'fortress-battle': ['1', '2', 'в атаку!', 'за наших!'],
  guesstimate: ['86400', '2017', '330', '206', '200', '300', '85000', '2018'],
  'emoji-quiz': ['король лев', 'человек паук', 'титаник', 'гарри поттер'],
  'ege-oge': ['1', '2', '3', '4'],
};

class LiveHub {
  private rooms = new Map<string, InternalRoom>();

  private getOrCreateRoom(token: string): InternalRoom {
    const cleanToken = (token || 'streamer-demo').trim();
    let room = this.rooms.get(cleanToken);
    if (!room) {
      room = {
        state: {
          token: cleanToken,
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
        tiktokConn: null,
        subscribers: new Set(),
        lastMessageAt: new Map(),
        botTimer: null,
        seenMsgIds: new Set(),
        recentDedupeMap: new Map(),
        webcastPollTimer: null,
        webcastCursor: '',
      };
      this.rooms.set(cleanToken, room);
    }
    return room;
  }

  getState(token: string): SessionState {
    return this.getOrCreateRoom(token).state;
  }

  subscribe(token: string, listener: (payload: { event?: LiveEvent; state: SessionState }) => void): () => void {
    const room = this.getOrCreateRoom(token);
    room.subscribers.add(listener);
    return () => {
      room.subscribers.delete(listener);
    };
  }

  private broadcast(room: InternalRoom, event?: LiveEvent) {
    if (event) {
      room.state.recentEvents = [event, ...room.state.recentEvents].slice(0, 80);
    }
    const snapshot: SessionState = { ...room.state };
    room.subscribers.forEach((cb) => {
      try {
        cb({ event, state: snapshot });
      } catch {
        // Ignore stale SSE connections
      }
    });
  }

  private isBlockedByModeration(room: InternalRoom, username: string, message?: string): boolean {
    const lowerUser = username.toLowerCase();
    const { bannedUsers, mutedUsers, stopWords, profanityOn, antiFloodSec } = room.state.moderation;
    if (bannedUsers.some((u) => u.toLowerCase() === lowerUser)) return true;
    if (mutedUsers.some((u) => u.toLowerCase() === lowerUser)) return true;

    const now = Date.now();
    const prev = room.lastMessageAt.get(lowerUser) || 0;
    if (antiFloodSec > 0 && now - prev < antiFloodSec * 1000) {
      return true;
    }
    room.lastMessageAt.set(lowerUser, now);

    if (message) {
      const lowerMsg = message.toLowerCase();
      if (stopWords.some((w) => w && lowerMsg.includes(w.toLowerCase()))) return true;
      if (profanityOn && DEFAULT_PROFANITY.some((w) => lowerMsg.includes(w))) return true;
    }
    return false;
  }

  private isDuplicateExternal(room: InternalRoom, externalId?: string, contentKey?: string): boolean {
    if (externalId) {
      if (room.seenMsgIds.has(externalId)) return true;
      room.seenMsgIds.add(externalId);
      if (room.seenMsgIds.size > 500) {
        const first = room.seenMsgIds.values().next().value;
        if (first) room.seenMsgIds.delete(first);
      }
    }
    if (contentKey) {
      const now = Date.now();
      const prev = room.recentDedupeMap.get(contentKey);
      if (prev !== undefined && now - prev < 4000) {
        return true;
      }
      room.recentDedupeMap.set(contentKey, now);
      if (room.recentDedupeMap.size > 250) {
        const firstKey = room.recentDedupeMap.keys().next().value;
        if (firstKey) room.recentDedupeMap.delete(firstKey);
      }
    }
    return false;
  }

  updateViewerCount(token: string, viewers: number) {
    if (!Number.isFinite(viewers) || viewers < 1) return;
    const room = this.getOrCreateRoom(token);
    room.state.viewerCount = viewers;
    if (viewers > room.state.peakViewers) {
      room.state.peakViewers = viewers;
    }
    this.broadcast(room);
  }

  ingestExternalEvents(
    token: string,
    events: Array<FastWebcastEvent | Partial<LiveEvent>>,
    viewerCount?: number
  ) {
    const room = this.getOrCreateRoom(token);
    let updatedViewers = false;
    if (typeof viewerCount === 'number' && Number.isFinite(viewerCount) && viewerCount > 0) {
      room.state.viewerCount = viewerCount;
      if (viewerCount > room.state.peakViewers) {
        room.state.peakViewers = viewerCount;
      }
      updatedViewers = true;
    }

    for (const ev of events) {
      if (ev.type === 'chat' && ev.message) {
        this.pushChatEvent(token, ev.username || 'viewer', ev.message, ev.avatar, ev.id, true);
      } else if (ev.type === 'gift') {
        this.pushGiftEvent(
          token,
          ev.username || 'supporter',
          ev.giftName || 'Роза',
          Number(ev.coins || 1),
          ev.giftEmoji || '🌹',
          ev.avatar,
          ev.id,
          true
        );
      } else if (ev.type === 'like') {
        this.pushLikeEvent(token, ev.username || 'viewer', Number(ev.likeCount || 1), ev.id);
      }
    }

    if (updatedViewers && events.length === 0) {
      this.broadcast(room);
    }
  }

  pushChatEvent(
    token: string,
    username: string,
    message: string,
    avatar?: string,
    externalId?: string,
    dedupeContent = false
  ): { accepted: boolean; event?: LiveEvent } {
    const room = this.getOrCreateRoom(token);
    const cleanUser = username.replace(/^@/, '').trim() || 'viewer';
    const cleanMsg = message.trim();
    if (!cleanMsg) return { accepted: false };
    if (
      (externalId || dedupeContent) &&
      this.isDuplicateExternal(
        room,
        externalId,
        dedupeContent ? `chat:${cleanUser.toLowerCase()}:${cleanMsg.toLowerCase()}` : undefined
      )
    ) {
      return { accepted: false };
    }
    if (this.isBlockedByModeration(room, cleanUser, cleanMsg)) {
      return { accepted: false };
    }

    room.state.totalMessages += 1;
    if (!room.state.scores[cleanUser]) {
      room.state.scores[cleanUser] = {
        username: cleanUser,
        avatar: avatar || '🎮',
        points: 0,
        wins: 0,
      };
    }

    const event: LiveEvent = {
      id: externalId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'chat',
      timestamp: Date.now(),
      username: cleanUser,
      avatar: avatar || room.state.scores[cleanUser].avatar,
      message: cleanMsg,
    };
    this.broadcast(room, event);
    return { accepted: true, event };
  }

  pushGiftEvent(
    token: string,
    username: string,
    giftName: string,
    coins: number,
    giftEmoji?: string,
    avatar?: string,
    externalId?: string,
    dedupeContent = false
  ): LiveEvent | null {
    const room = this.getOrCreateRoom(token);
    const cleanUser = username.replace(/^@/, '').trim() || 'supporter';
    if (
      (externalId || dedupeContent) &&
      this.isDuplicateExternal(
        room,
        externalId,
        dedupeContent ? `gift:${cleanUser.toLowerCase()}:${giftName}:${coins}` : undefined
      )
    ) {
      return null;
    }
    room.state.totalGifts += 1;

    if (!room.state.scores[cleanUser]) {
      room.state.scores[cleanUser] = { username: cleanUser, avatar: avatar || '💎', points: 0, wins: 0 };
    }
    room.state.scores[cleanUser].points += Math.max(1, Math.min(10, Math.round(coins / 2)));

    const event: LiveEvent = {
      id: externalId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'gift',
      timestamp: Date.now(),
      username: cleanUser,
      avatar: avatar || '💎',
      giftName,
      giftEmoji: giftEmoji || '🌹',
      coins,
    };
    this.broadcast(room, event);
    return event;
  }

  pushLikeEvent(token: string, username: string, likes: number, externalId?: string): LiveEvent | null {
    const room = this.getOrCreateRoom(token);
    const cleanUser = username.replace(/^@/, '').trim() || 'viewer';
    if (externalId && this.isDuplicateExternal(room, externalId)) {
      return null;
    }
    room.state.totalLikes += Math.max(1, likes || 1);
    const event: LiveEvent = {
      id: externalId || `${Date.now()}-like`,
      type: 'like',
      timestamp: Date.now(),
      username: cleanUser,
      likeCount: Math.max(1, likes || 1),
    };
    this.broadcast(room, event);
    return event;
  }

  pushControlEvent(token: string, action: string, payload?: Record<string, unknown>): SessionState {
    const room = this.getOrCreateRoom(token);

    if (action === 'set_game' && typeof payload?.slug === 'string') {
      room.state.activeGameSlug = payload.slug;
    } else if (action === 'award_point' && typeof payload?.username === 'string') {
      const uname = payload.username;
      const pts = typeof payload.points === 'number' ? payload.points : 1;
      const isWin = Boolean(payload.win);
      if (!room.state.scores[uname]) {
        room.state.scores[uname] = { username: uname, avatar: '🏆', points: 0, wins: 0 };
      }
      room.state.scores[uname].points += pts;
      if (isWin) room.state.scores[uname].wins += 1;
    } else if (action === 'reset_scores') {
      room.state.scores = {};
    } else if (action === 'update_skin' && payload?.skin) {
      room.state.skin = { ...room.state.skin, ...(payload.skin as Partial<SkinConfigState>) };
    } else if (action === 'update_moderation' && payload?.moderation) {
      room.state.moderation = { ...room.state.moderation, ...(payload.moderation as Partial<ModerationConfigState>) };
    } else if (action === 'update_playlist' && payload?.playlist) {
      room.state.playlist = { ...room.state.playlist, ...(payload.playlist as Partial<PlaylistConfigState>) };
    } else if (action === 'set_gift_preset' && typeof payload?.preset === 'string') {
      room.state.giftPreset = payload.preset as 'light' | 'hardcore' | 'donate';
    } else if (action === 'add_custom_content' && Array.isArray(payload?.items)) {
      const incoming = payload.items as { id: string; gameSlug: string; text: string; answer: string }[];
      room.state.customItems = [...incoming, ...room.state.customItems].slice(0, 200);
    }

    const event: LiveEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'control',
      timestamp: Date.now(),
      username: 'Streamer',
      controlAction: action,
      payload,
    };
    this.broadcast(room, event);
    return room.state;
  }

  toggleBots(token: string, enabled: boolean, gameSlug?: string): SessionState {
    const room = this.getOrCreateRoom(token);
    if (gameSlug) room.state.activeGameSlug = gameSlug;
    room.state.botsEnabled = enabled;

    if (room.botTimer) {
      clearInterval(room.botTimer);
      room.botTimer = null;
    }

    if (enabled) {
      room.botTimer = setInterval(() => {
        const currentRoom = this.rooms.get(room.state.token);
        if (!currentRoom || !currentRoom.state.botsEnabled) return;

        const bot = BOT_PLAYERS[Math.floor(Math.random() * BOT_PLAYERS.length)];
        const pool = BOT_MESSAGES_BY_GAME[currentRoom.state.activeGameSlug] || BOT_MESSAGES_BY_GAME.contexto;
        const msg = pool[Math.floor(Math.random() * pool.length)];

        if (Math.random() < 0.14) {
          const gifts = [
            { name: 'Роза', emoji: '🌹', coins: 1 },
            { name: 'Сердце-палец', emoji: '🫰', coins: 5 },
            { name: 'Мороженое', emoji: '🍦', coins: 10 },
          ];
          const g = gifts[Math.floor(Math.random() * gifts.length)];
          this.pushGiftEvent(currentRoom.state.token, bot.username, g.name, g.coins, g.emoji, bot.avatar);
        } else {
          this.pushChatEvent(currentRoom.state.token, bot.username, msg, bot.avatar);
        }
      }, 1700);
    }

    this.broadcast(room, {
      id: `${Date.now()}-bot-toggle`,
      type: 'status',
      timestamp: Date.now(),
      username: 'System',
      message: enabled ? 'Симулятор живого чата включён' : 'Симулятор чата выключен',
    });

    return room.state;
  }

  private normalizeTikTokUsername(raw: string): string {
    let s = (raw || '').trim();
    const match = s.match(/tiktok\.com\/@([^/?#]+)/i);
    if (match && match[1]) s = match[1];
    return s.replace(/^@/, '').replace(/\/.*$/, '').trim();
  }

  async ensureConnected(token: string, rawUsername: string): Promise<SessionState> {
    const room = this.getOrCreateRoom(token);
    const username = this.normalizeTikTokUsername(rawUsername);
    if (!username) return room.state;
    if (
      room.state.tiktokUsername.toLowerCase() === username.toLowerCase() &&
      (room.state.connectionStatus === 'connected' || room.state.connectionStatus === 'connecting')
    ) {
      return room.state;
    }
    return this.connectTikTok(token, username);
  }

  async connectTikTok(token: string, rawUsername: string): Promise<SessionState> {
    const room = this.getOrCreateRoom(token);
    const username = this.normalizeTikTokUsername(rawUsername);

    if (room.webcastPollTimer) {
      clearInterval(room.webcastPollTimer);
      room.webcastPollTimer = null;
    }

    if (room.tiktokConn) {
      try {
        await room.tiktokConn.disconnect();
      } catch {
        // ignore
      }
      room.tiktokConn = null;
    }

    if (!username) {
      room.state.tiktokUsername = '';
      room.state.roomId = '';
      room.state.connectionStatus = 'disconnected';
      room.state.connectionError = null;
      this.broadcast(room);
      return room.state;
    }

    room.state.tiktokUsername = username;
    room.state.connectionStatus = 'connecting';
    room.state.connectionError = null;
    this.broadcast(room);

    try {
      const info = await resolveTikTokRoomInfo(username);
      if (!info.roomId || !info.isOnline) {
        room.state.roomId = '';
        room.state.connectionStatus = 'error';
        room.state.connectionError = `Эфир @${username} сейчас оффлайн на TikTok или ещё не запущен.`;
        this.broadcast(room);
        return room.state;
      }

      room.state.roomId = info.roomId;
      room.webcastCursor = '';
      room.state.viewerCount = Math.max(1, info.viewerCount || 1);
      if (room.state.viewerCount > room.state.peakViewers) {
        room.state.peakViewers = room.state.viewerCount;
      }
      room.state.connectionStatus = 'connected';
      room.state.connectionError = null;
      this.broadcast(room, {
        id: `${Date.now()}-connected`,
        type: 'status',
        timestamp: Date.now(),
        username: 'TikTok LIVE',
        message: `Подключено к эфиру @${username}`,
      });

      // Immediately pull fast batch (~1.5-2.5s) so live chat events appear right away
      const firstBatch = await fetchWebcastBatchFast(info.roomId, '', 750);
      if (firstBatch.cursor) room.webcastCursor = firstBatch.cursor;
      this.ingestExternalEvents(token, firstBatch.events, firstBatch.viewerCount);

      // Continuous fast polling every 3s as resilient transport alongside WebSocket
      const activeRoomId = info.roomId;
      room.webcastPollTimer = setInterval(async () => {
        if (room.state.connectionStatus !== 'connected' || room.state.roomId !== activeRoomId) return;
        const batch = await fetchWebcastBatchFast(activeRoomId, room.webcastCursor, 750);
        if (batch.cursor) room.webcastCursor = batch.cursor;
        this.ingestExternalEvents(token, batch.events, batch.viewerCount);
      }, 3000);

      // Background WebSocket connection for sub-second push when available
      const conn = new TikTokLiveConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: false,
        fetchRoomInfoOnConnect: true,
        wsClientOptions: { handshakeTimeout: 8000 },
      });

      conn.on(WebcastEvent.CHAT, (data) => {
        const raw = data as unknown as Record<string, unknown>;
        const msgId = String((raw.common as { msgId?: string })?.msgId || '');
        const uid = data.user?.displayId || (raw.user as { uniqueId?: string })?.uniqueId || data.user?.nickname || 'viewer';
        const text = data.content || (typeof raw.comment === 'string' ? raw.comment : '');
        const avatar = data.user?.avatarThumb?.urlList?.[0];
        if (text) {
          this.pushChatEvent(token, uid, text, avatar, msgId || undefined, true);
        }
      });

      conn.on(WebcastEvent.GIFT, (data) => {
        const raw = data as unknown as {
          common?: { msgId?: string };
          giftDetails?: { giftType?: number; diamondCount?: number; giftName?: string };
          gift?: { type?: number; diamondCount?: number; name?: string };
          extendedGiftInfo?: { type?: number; diamond_count?: number; name?: string };
          user?: { displayId?: string; uniqueId?: string; nickname?: string };
        };
        const giftType = raw.giftDetails?.giftType ?? raw.gift?.type ?? raw.extendedGiftInfo?.type;
        if (giftType === 1 && !data.repeatEnd) return;
        const msgId = String(raw.common?.msgId || '');
        const count = Number(data.repeatCount || 1);
        const diamonds = Number(raw.giftDetails?.diamondCount ?? raw.gift?.diamondCount ?? raw.extendedGiftInfo?.diamond_count ?? 1);
        const coins = diamonds * count;
        const uid = data.user?.displayId || raw.user?.uniqueId || data.user?.nickname || 'supporter';
        const giftName = raw.giftDetails?.giftName || raw.gift?.name || raw.extendedGiftInfo?.name || 'Подарок';
        const avatar = data.user?.avatarThumb?.urlList?.[0];
        this.pushGiftEvent(token, uid, giftName, coins, '🎁', avatar, msgId || undefined, true);
      });

      conn.on(WebcastEvent.LIKE, (data) => {
        const raw = data as unknown as { common?: { msgId?: string }; likeCount?: number; user?: { uniqueId?: string } };
        const msgId = String(raw.common?.msgId || '');
        const uid = data.user?.displayId || raw.user?.uniqueId || data.user?.nickname || 'viewer';
        const likes = Number(data.count || raw.likeCount || 1);
        this.pushLikeEvent(token, uid, likes, msgId || undefined);
      });

      conn.on(WebcastEvent.ROOM_USER, (data) => {
        const raw = data as unknown as { viewerCount?: number };
        const viewers = Number(data.total || raw.viewerCount || 1);
        this.updateViewerCount(token, viewers);
      });

      conn.on(ControlEvent.DISCONNECTED, () => {
        // Fast polling keeps stream alive even if background WS drops
      });

      conn.on(ControlEvent.ERROR, () => {
        // Non-fatal: fast webcast polling handles events
      });

      room.tiktokConn = conn;
      void conn.connect().catch(() => {
        // Non-fatal: fast polling handles chat/gifts cleanly
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Пользователь не в прямом эфире';
      room.state.connectionStatus = 'error';
      room.state.connectionError = `Не удалось подключиться к @${username}: ${msg}. Убедитесь, что эфир запущен и не закрыт настройками приватности.`;
      this.broadcast(room);
    }

    return room.state;
  }

  disconnectTikTok(token: string): SessionState {
    const room = this.getOrCreateRoom(token);
    if (room.webcastPollTimer) {
      clearInterval(room.webcastPollTimer);
      room.webcastPollTimer = null;
    }
    if (room.tiktokConn) {
      try {
        void room.tiktokConn.disconnect();
      } catch {
        // ignore
      }
      room.tiktokConn = null;
    }
    room.state.roomId = '';
    room.state.connectionStatus = 'disconnected';
    room.state.connectionError = null;
    this.broadcast(room);
    return room.state;
  }
}

const globalForHub = globalThis as unknown as { __vibeplayHub?: LiveHub };
export const liveHub = globalForHub.__vibeplayHub || new LiveHub();
if (process.env.NODE_ENV !== 'production') {
  globalForHub.__vibeplayHub = liveHub;
}

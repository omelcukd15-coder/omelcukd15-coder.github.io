'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Sparkles,
  Wifi,
  WifiOff,
  Bot,
  Pause,
  Play,
  RotateCcw,
  Lightbulb,
  SkipForward,
  Send,
  Gift,
  Eye,
  X,
  Trophy,
  MessageSquare,
  Heart,
  Crown,
} from 'lucide-react';
import {
  CONTEXTO_WORDS,
  COUNTRY_SCENES,
  DILEMMAS,
  DOODLE_ITEMS,
  EGE_OGE_QUESTIONS,
  EMOJI_PUZZLES,
  FLAG_COUNTRIES,
  GAMES,
  GUESSTIMATE_QUESTIONS,
  LOGO_BRANDS,
  REVEAL_WORDS,
  SECRET_5_WORDS,
  TRIVIA_QUESTIONS,
  getGameBySlug,
} from '@/lib/games-data';
import { LiveEvent, SessionState } from '@/lib/server/liveHub';
import { soundEngine } from '@/lib/sound';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { fetchWebcastBatchFast } from '@/lib/tiktokWebcastReader';
import { CanvasArena } from './CanvasArenas';

export interface GameScreenProps {
  slug: string;
  token?: string;
  mode?: 'preview' | 'play';
  externalControl?: { action: string; ts: number; payload?: Record<string, unknown> } | null;
  onSlugChange?: (newSlug: string) => void;
  initialBots?: boolean;
}

interface ContextoGuess {
  word: string;
  rank: number;
  user: string;
  id: string;
}

interface VoteBall {
  id: string;
  user: string;
  side: 1 | 2;
  size: number;
  color: string;
}

interface GiftLeaderEntry {
  username: string;
  avatar?: string;
  coins: number;
  giftsCount: number;
  lastEmoji: string;
}

interface LikeLeaderEntry {
  username: string;
  avatar?: string;
  likes: number;
}

interface GiftSpotlight {
  id: string;
  username: string;
  avatar?: string;
  giftName: string;
  giftEmoji: string;
  coins: number;
  effectText: string;
}

interface FeedMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  isGift?: boolean;
  giftEmoji?: string;
  coins?: number;
}

function PlayerAvatar({
  avatar,
  username,
  size = 'sm',
  accent = 'violet',
}: {
  avatar?: string;
  username: string;
  size?: 'xs' | 'sm' | 'md';
  accent?: 'violet' | 'amber' | 'rose';
}) {
  const dim =
    size === 'md'
      ? 'h-10 w-10 text-sm'
      : size === 'sm'
      ? 'h-5 w-5 text-[10px]'
      : 'h-4 w-4 text-[9px]';
  if (avatar && avatar.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={username}
        className={`${dim} shrink-0 rounded-full border border-white/25 object-cover shadow-sm`}
      />
    );
  }
  const grad =
    accent === 'amber'
      ? 'from-amber-400 to-rose-500'
      : accent === 'rose'
      ? 'from-pink-500 to-cyan-500'
      : 'from-violet-500 to-fuchsia-500';
  const label = avatar && avatar.length <= 4 ? avatar : username.slice(0, 1).toUpperCase() || '★';
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br ${grad} font-black text-white shadow-sm`}
    >
      {label}
    </span>
  );
}

function computeSemanticRank(guess: string, targetObj: (typeof CONTEXTO_WORDS)[number]): number {
  const clean = guess.toLowerCase().trim();
  if (clean === targetObj.word) return 1;
  if (targetObj.related[clean]) return targetObj.related[clean];

  // Deterministic similarity fallback so any Russian/English word produces consistent thermal feedback
  let shared = 0;
  for (const ch of Array.from(new Set(clean.split('')))) {
    if (targetObj.word.includes(ch)) shared += 1;
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) % 780;
  }
  const base = Math.max(45, 860 - shared * 95 - (hash % 180));
  return Math.min(999, base);
}

export function GameScreen({
  slug,
  token = 'streamer-demo',
  mode = 'preview',
  externalControl = null,
  onSlugChange,
  initialBots = false,
}: GameScreenProps) {
  const [activeSlug, setActiveSlug] = useState(slug);
  useEffect(() => {
    setActiveSlug(slug);
  }, [slug]);

  const game = useMemo(() => getGameBySlug(activeSlug), [activeSlug]);

  // Live Hub state
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [latestEvent, setLatestEvent] = useState<LiveEvent | null>(null);
  const [eventBanner, setEventBanner] = useState<{ text: string; tone: 'gift' | 'win' | 'info' } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // Audio & UI overlays
  const [muted, setMuted] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [remoteOpen, setRemoteOpen] = useState(false);
  const [hideHudForObs, setHideHudForObs] = useState(false);
  const [paused, setPaused] = useState(false);

  // Streamer quick connect & simulator inside phone app
  const [tiktokInput, setTiktokInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const simUser = 'zritel_top';

  // Round states
  const [roundNum, setRoundNum] = useState(1);
  const [roundIdx, setRoundIdx] = useState(0);
  const [roundTimer, setRoundTimer] = useState(60);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [roundWinner, setRoundWinner] = useState<{ user: string; answer: string } | null>(null);
  const [localScores, setLocalScores] = useState<Record<string, { username: string; avatar: string; points: number }>>({
    artem_gg: { username: 'artem_gg', avatar: '🧑‍💻', points: 14 },
    lera_fox: { username: 'lera_fox', avatar: '🦊', points: 11 },
    max_turbo: { username: 'max_turbo', avatar: '⚡', points: 8 },
  });

  // Game-specific states
  const [contextoGuesses, setContextoGuesses] = useState<ContextoGuess[]>([
    { id: 'seed-1', word: 'планета', rank: 9, user: 'artem_gg' },
    { id: 'seed-2', word: 'луна', rank: 22, user: 'lera_fox' },
    { id: 'seed-3', word: 'небо', rank: 65, user: 'max_turbo' },
  ]);
  const [revealedLetters, setRevealedLetters] = useState(1);
  const [hintText, setHintText] = useState<string | null>(null);
  const [doodleProgress, setDoodleProgress] = useState(0.25);
  const [freeDrawMode, setFreeDrawMode] = useState(false);
  const [logoBlur, setLogoBlur] = useState(18);
  const [votes, setVotes] = useState<{ a: number; b: number; balls: VoteBall[] }>({
    a: 12,
    b: 9,
    balls: [
      { id: 'vb1', user: 'artem', side: 1, size: 28, color: '#6C2BD9' },
      { id: 'vb2', user: 'lera', side: 2, size: 28, color: '#EC4899' },
    ],
  });
  const [triviaHiddenIndices, setTriviaHiddenIndices] = useState<number[]>([]);
  const [doublePoints, setDoublePoints] = useState(false);
  const [wordleRows, setWordleRows] = useState<string[]>(['СТРИМ']);
  const [estimates, setEstimates] = useState<{ user: string; val: number }[]>([
    { user: 'artem_gg', val: 85000 },
    { user: 'lera_fox', val: 86420 },
  ]);
  const [egeFilter, setEgeFilter] = useState<'ALL' | 'ЕГЭ' | 'ОГЭ'>('ALL');
  const [giftLeaders, setGiftLeaders] = useState<Record<string, GiftLeaderEntry>>({
    artem_gg: { username: 'artem_gg', avatar: '🧑‍💻', coins: 120, giftsCount: 2, lastEmoji: '🦁' },
    lera_fox: { username: 'lera_fox', avatar: '🦊', coins: 45, giftsCount: 3, lastEmoji: '🍩' },
    max_turbo: { username: 'max_turbo', avatar: '⚡', coins: 15, giftsCount: 3, lastEmoji: '🌹' },
  });
  const [likeLeaders, setLikeLeaders] = useState<Record<string, LikeLeaderEntry>>({
    lera_fox: { username: 'lera_fox', avatar: '🦊', likes: 1420 },
    artem_gg: { username: 'artem_gg', avatar: '🧑‍💻', likes: 980 },
    nika_star: { username: 'nika_star', avatar: '🌟', likes: 640 },
  });
  const [giftSpotlight, setGiftSpotlight] = useState<GiftSpotlight | null>(null);
  const [chatFeed, setChatFeed] = useState<FeedMessage[]>([
    { id: 'c1', user: 'artem_gg', avatar: '🧑‍💻', text: 'Всем привет! Го играть 🔥' },
    { id: 'c2', user: 'lera_fox', avatar: '🦊', text: 'Залетаем в топ!' },
  ]);

  const processedIdsRef = useRef<Set<string>>(new Set());
  const webcastCursorRef = useRef<string>('');
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const giftSpotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerBanner = useCallback((text: string, tone: 'gift' | 'win' | 'info') => {
    setEventBanner({ text, tone });
    setTimeout(() => {
      setEventBanner((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  }, []);

  const triggerWin = useCallback(
    (username: string, answer: string, pts = 3) => {
      if (roundWinner) return;
      soundEngine.playVictory();
      soundEngine.speak(`Победитель ${username}! Слово ${answer}`);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
      setRoundWinner({ user: username, answer });
      setNextRoundCountdown(15);

      const mult = doublePoints ? 2 : 1;
      setLocalScores((prev) => ({
        ...prev,
        [username]: {
          username,
          avatar: prev[username]?.avatar || '🏆',
          points: (prev[username]?.points || 0) + pts * mult,
        },
      }));

      fetch(apiUrl('/api/live/event'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          type: 'control',
          action: 'award_point',
          payload: { username, points: pts * mult, win: true },
        }),
      }).catch(() => {});

      triggerBanner(`🏆 ${username} угадал(а): ${answer}!`, 'win');
    },
    [doublePoints, roundWinner, token, triggerBanner]
  );

  const startNewRound = useCallback(() => {
    setRoundNum((n) => n + 1);
    setRoundIdx((i) => i + 1);
    setRoundWinner(null);
    setNextRoundCountdown(null);
    setRoundTimer(60);
    setHintText(null);
    setRevealedLetters(1);
    setDoodleProgress(0.2);
    setLogoBlur(18);
    setTriviaHiddenIndices([]);
    setDoublePoints(false);
    setContextoGuesses([]);
    setWordleRows([]);
    setEstimates([]);
    setVotes({ a: 0, b: 0, balls: [] });
  }, []);

  const applyControlAction = useCallback(
    (action: string, payload?: Record<string, unknown>) => {
      if (action === 'set_game' && typeof payload?.slug === 'string') {
        setActiveSlug(payload.slug);
        onSlugChange?.(payload.slug);
        startNewRound();
        return;
      }
      if (action === 'pause') {
        setPaused((p) => !p);
        return;
      }
      if (action === 'new_round' || action === 'skip') {
        startNewRound();
        triggerBanner('Новый раунд запущен!', 'info');
        return;
      }
      if (action === 'reset_scores') {
        setLocalScores({});
        setGiftLeaders({});
        setLikeLeaders({});
        setGiftSpotlight(null);
        triggerBanner('Очки эфира сброшены', 'info');
        return;
      }
      if (action === 'tts') {
        soundEngine.ttsEnabled = !soundEngine.ttsEnabled;
        triggerBanner(soundEngine.ttsEnabled ? 'Озвучка TTS включена' : 'Озвучка TTS выключена', 'info');
        return;
      }
      if (action === 'letter') {
        setRevealedLetters((v) => v + 1);
        soundEngine.playGuess();
        return;
      }
      if (action === 'hint') {
        if (activeSlug === 'contexto') {
          const item = CONTEXTO_WORDS[roundIdx % CONTEXTO_WORDS.length];
          const hintWord = item.hints[Math.floor(Math.random() * item.hints.length)];
          const rank = item.related[hintWord] || 12;
          setContextoGuesses((prev) =>
            [{ id: `hint-${Date.now()}`, word: hintWord, rank, user: 'Подсказка' }, ...prev.filter((g) => g.word !== hintWord)].sort(
              (a, b) => a.rank - b.rank
            )
          );
          triggerBanner(`💡 Подсказка: «${hintWord}» (#${rank})`, 'info');
        } else if (activeSlug === 'doodle-guess') {
          setDoodleProgress((p) => Math.min(1, p + 0.3));
        } else if (activeSlug === 'logo-quiz') {
          setLogoBlur((b) => Math.max(0, b - 7));
        } else if (activeSlug === 'trivia') {
          const q = TRIVIA_QUESTIONS[roundIdx % TRIVIA_QUESTIONS.length];
          const wrong = [0, 1, 2, 3].filter((i) => i !== q.answerIndex).slice(0, 2);
          setTriviaHiddenIndices(wrong);
        } else if (activeSlug === 'flag-quiz') {
          const f = FLAG_COUNTRIES[roundIdx % FLAG_COUNTRIES.length];
          setHintText(`Часть света: ${f.continent}`);
        } else if (activeSlug === 'spot-the-country') {
          const c = COUNTRY_SCENES[roundIdx % COUNTRY_SCENES.length];
          setHintText(`Континент: ${c.continent}`);
        } else if (activeSlug === 'emoji-quiz') {
          const puz = EMOJI_PUZZLES[roundIdx % EMOJI_PUZZLES.length];
          setHintText(`Категория: ${puz.category}, букв: ${puz.answer.length}`);
        } else if (activeSlug === 'ege-oge') {
          const filtered = EGE_OGE_QUESTIONS.filter((e) => egeFilter === 'ALL' || e.exam === egeFilter);
          const item = filtered[roundIdx % filtered.length] || EGE_OGE_QUESTIONS[0];
          setHintText(item.rule);
        } else if (activeSlug === 'guesstimate') {
          const g = GUESSTIMATE_QUESTIONS[roundIdx % GUESSTIMATE_QUESTIONS.length];
          setHintText(`Диапазон: от ${Math.floor(g.answer * 0.75)} до ${Math.ceil(g.answer * 1.25)} ${g.unit}`);
        } else if (activeSlug === 'would-you-rather') {
          setShaking(true);
          setTimeout(() => setShaking(false), 450);
        }
      }
    },
    [activeSlug, egeFilter, onSlugChange, roundIdx, startNewRound, triggerBanner]
  );

  // External control trigger from Dashboard
  useEffect(() => {
    if (externalControl) {
      applyControlAction(externalControl.action, externalControl.payload);
    }
  }, [externalControl, applyControlAction]);

  // Process incoming LiveEvent (Chat / Gift / Control)
  const processEvent = useCallback(
    (ev: LiveEvent) => {
      if (processedIdsRef.current.has(ev.id)) return;
      processedIdsRef.current.add(ev.id);
      setLatestEvent(ev);

      if (ev.type === 'control' && ev.controlAction) {
        applyControlAction(ev.controlAction, ev.payload);
        return;
      }

      if (ev.type === 'like') {
        const likes = Math.max(1, ev.likeCount || 1);
        setLikeLeaders((prev) => {
          const cur = prev[ev.username];
          return {
            ...prev,
            [ev.username]: {
              username: ev.username,
              avatar: ev.avatar || cur?.avatar,
              likes: (cur?.likes || 0) + likes,
            },
          };
        });
        return;
      }

      if (ev.type === 'gift') {
        soundEngine.playGift();
        setShaking(true);
        setTimeout(() => setShaking(false), 420);
        const coins = Math.max(1, ev.coins || 1);
        const emoji = ev.giftEmoji || '🎁';
        const giftName = ev.giftName || 'Подарок';
        const effectText =
          coins >= 25 ? '⚡ Новый раунд!' : coins >= 5 ? '✨ x2 Очки + Буква!' : '💡 Подсказка!';

        setGiftLeaders((prev) => {
          const cur = prev[ev.username];
          return {
            ...prev,
            [ev.username]: {
              username: ev.username,
              avatar: ev.avatar || cur?.avatar,
              coins: (cur?.coins || 0) + coins,
              giftsCount: (cur?.giftsCount || 0) + 1,
              lastEmoji: emoji,
            },
          };
        });

        setGiftSpotlight({
          id: ev.id,
          username: ev.username,
          avatar: ev.avatar,
          giftName,
          giftEmoji: emoji,
          coins,
          effectText,
        });
        if (giftSpotlightTimerRef.current) {
          clearTimeout(giftSpotlightTimerRef.current);
        }
        giftSpotlightTimerRef.current = setTimeout(() => {
          setGiftSpotlight((cur) => (cur?.id === ev.id ? null : cur));
        }, 4200);

        triggerBanner(`${emoji} @${ev.username} подарил(а) ${giftName} (+${coins} мон.)`, 'gift');
        setChatFeed((prev) =>
          [
            {
              id: ev.id,
              user: ev.username,
              avatar: ev.avatar,
              text: `подарил(а) ${giftName}`,
              isGift: true,
              giftEmoji: emoji,
              coins,
            },
            ...prev,
          ].slice(0, 8)
        );

        if (coins >= 25) {
          startNewRound();
        } else if (coins >= 5) {
          setDoublePoints(true);
          applyControlAction('letter');
        } else {
          applyControlAction('hint');
        }
        return;
      }

      if (ev.type === 'chat' && ev.message) {
        const msg = ev.message.trim();
        const lower = msg.toLowerCase();
        setChatFeed((prev) =>
          [{ id: ev.id, user: ev.username, avatar: ev.avatar, text: msg }, ...prev].slice(0, 8)
        );
        soundEngine.playGuess();

        if (paused || roundWinner) return;

        if (activeSlug === 'contexto') {
          const targetObj = CONTEXTO_WORDS[roundIdx % CONTEXTO_WORDS.length];
          const cleanWord = lower.split(/\s+/)[0].replace(/[^а-яёa-z0-9-]/gi, '');
          if (!cleanWord) return;
          const rank = computeSemanticRank(cleanWord, targetObj);
          if (rank === 1) {
            setContextoGuesses((prev) => [{ id: ev.id, word: cleanWord, rank: 1, user: ev.username }, ...prev]);
            triggerWin(ev.username, targetObj.word.toUpperCase(), 5);
          } else {
            soundEngine.playGuess();
            setContextoGuesses((prev) => {
              if (prev.some((g) => g.word === cleanWord)) return prev;
              return [{ id: ev.id, word: cleanWord, rank, user: ev.username }, ...prev]
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 12);
            });
          }
        } else if (activeSlug === 'flag-quiz') {
          const item = FLAG_COUNTRIES[roundIdx % FLAG_COUNTRIES.length];
          if (item.aliases.some((a) => lower.includes(a))) {
            triggerWin(ev.username, item.name, 3);
          }
        } else if (activeSlug === 'word-reveal') {
          const item = REVEAL_WORDS[roundIdx % REVEAL_WORDS.length];
          if (lower === item.word.toLowerCase()) {
            triggerWin(ev.username, item.word, 4);
          } else if (lower.length === 1 && item.word.toLowerCase().includes(lower)) {
            setRevealedLetters((v) => Math.min(item.word.length - 1, v + 1));
            soundEngine.playGuess();
          }
        } else if (activeSlug === 'doodle-guess') {
          const item = DOODLE_ITEMS[roundIdx % DOODLE_ITEMS.length];
          if (lower.includes(item.word)) {
            triggerWin(ev.username, item.label, 3);
          }
        } else if (activeSlug === 'logo-quiz') {
          const item = LOGO_BRANDS[roundIdx % LOGO_BRANDS.length];
          if (item.aliases.some((a) => lower.includes(a))) {
            triggerWin(ev.username, item.display, logoBlur > 10 ? 5 : 2);
          }
        } else if (activeSlug === 'spot-the-country') {
          const item = COUNTRY_SCENES[roundIdx % COUNTRY_SCENES.length];
          if (item.aliases.some((a) => lower.includes(a))) {
            triggerWin(ev.username, item.country, 3);
          }
        } else if (activeSlug === 'would-you-rather' || activeSlug === 'would-you-rather-vs') {
          const side: 1 | 2 = lower.startsWith('2') ? 2 : lower.startsWith('1') ? 1 : Math.random() > 0.5 ? 1 : 2;
          soundEngine.playGuess();
          setVotes((prev) => ({
            a: prev.a + (side === 1 ? 1 : 0),
            b: prev.b + (side === 2 ? 1 : 0),
            balls: [
              ...prev.balls.slice(-22),
              {
                id: ev.id,
                user: ev.username,
                side,
                size: 28,
                color: side === 1 ? '#6C2BD9' : '#EC4899',
              },
            ],
          }));
        } else if (activeSlug === 'trivia') {
          const q = TRIVIA_QUESTIONS[roundIdx % TRIVIA_QUESTIONS.length];
          const numMap: Record<string, number> = { '1': 0, a: 0, а: 0, '2': 1, b: 1, б: 1, '3': 2, c: 2, в: 2, '4': 3, d: 3, г: 3 };
          const chosen = numMap[lower];
          if (chosen === q.answerIndex || lower.includes(q.answerText)) {
            triggerWin(ev.username, q.options[q.answerIndex], 3);
          }
        } else if (activeSlug === 'secret-word') {
          const target = SECRET_5_WORDS[roundIdx % SECRET_5_WORDS.length];
          const clean = msg.toUpperCase().replace(/[^А-ЯЁ]/g, '');
          if (clean.length === 5) {
            soundEngine.playGuess();
            setWordleRows((prev) => [...prev.slice(-5), clean]);
            if (clean === target) {
              triggerWin(ev.username, target, 5);
            }
          }
        } else if (activeSlug === 'guesstimate') {
          const num = parseInt(msg.replace(/[^\d]/g, ''), 10);
          if (!Number.isNaN(num)) {
            soundEngine.playGuess();
            setEstimates((prev) => [{ user: ev.username, val: num }, ...prev.filter((e) => e.user !== ev.username)].slice(0, 6));
          }
        } else if (activeSlug === 'emoji-quiz') {
          const puz = EMOJI_PUZZLES[roundIdx % EMOJI_PUZZLES.length];
          if (puz.aliases.some((a) => lower.includes(a))) {
            triggerWin(ev.username, puz.answer.toUpperCase(), 3);
          }
        } else if (activeSlug === 'ege-oge') {
          const filtered = EGE_OGE_QUESTIONS.filter((e) => egeFilter === 'ALL' || e.exam === egeFilter);
          const item = filtered[roundIdx % filtered.length] || EGE_OGE_QUESTIONS[0];
          if (lower.startsWith(item.answer)) {
            triggerWin(ev.username, `Вариант ${item.answer} (${item.subject})`, 4);
          }
        }
      }
    },
    [activeSlug, applyControlAction, egeFilter, logoBlur, paused, roundIdx, roundWinner, startNewRound, triggerBanner, triggerWin]
  );

  // Connect to SSE stream + BroadcastChannel + fallback JSON poll (resilient for Cloudflare Edge & GitHub Pages)
  const [localBots, setLocalBots] = useState(initialBots);

  // Restore saved TikTok username from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vp_tiktok_nick');
      if (saved && !tiktokInput) setTiktokInput(saved);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let es: EventSource | null = null;
    let bc: BroadcastChannel | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const cleanUser = tiktokInput.trim();
    const userParam = cleanUser ? `&username=${encodeURIComponent(cleanUser)}` : '';

    const setup = async () => {
      await resolveBackendOrigin();
      if (cancelled) return;

      try {
        es = new EventSource(apiUrl(`/api/live/stream?token=${encodeURIComponent(token)}${userParam}`));
        es.onmessage = (msg) => {
          try {
            const parsed = JSON.parse(msg.data) as { event?: LiveEvent; state?: SessionState };
            if (parsed.state) {
              setSessionState(parsed.state);
              if (parsed.state.tiktokUsername && !tiktokInput) {
                setTiktokInput(parsed.state.tiktokUsername);
              }
            }
            if (parsed.event) {
              processEvent(parsed.event);
            }
          } catch {
            // ignore parse error
          }
        };
      } catch {
        // ignore SSE failures
      }

      const fetchSnapshot = () => {
        fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(token)}&mode=json${userParam}`))
          .then((r) => r.json())
          .then((d: { state?: SessionState }) => {
            if (d?.state) {
              setSessionState(d.state);
              if (d.state.tiktokUsername && !tiktokInput) {
                setTiktokInput(d.state.tiktokUsername);
              }
              if (Array.isArray(d.state.recentEvents)) {
                [...d.state.recentEvents].reverse().forEach((ev) => processEvent(ev));
              }
            }
          })
          .catch(() => {});
      };

      fetchSnapshot();
      poll = setInterval(fetchSnapshot, 2200);
    };

    void setup();

    try {
      bc = new BroadcastChannel(`vibeplay_${token}`);
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'toggle_bots') {
          setLocalBots(Boolean(msg.data.enabled));
        } else if (msg.data?.type === 'session_state' && msg.data?.state) {
          const nextState = msg.data.state as SessionState;
          setSessionState(nextState);
          if (nextState.tiktokUsername) setTiktokInput(nextState.tiktokUsername);
        } else if (msg.data?.event) {
          processEvent(msg.data.event as LiveEvent);
        }
      };
    } catch {
      // ignore BroadcastChannel failures
    }

    return () => {
      cancelled = true;
      es?.close();
      bc?.close();
      if (poll) clearInterval(poll);
    };
  }, [token, processEvent, tiktokInput]);

  // Direct browser-side EulerStream CORS polling when connected to a live room
  useEffect(() => {
    if (sessionState?.connectionStatus !== 'connected' || !sessionState?.roomId) return;
    const activeRoomId = sessionState.roomId;
    webcastCursorRef.current = '';
    let cancelled = false;
    let inFlight = false;

    const pullBatch = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const batch = await fetchWebcastBatchFast(activeRoomId, webcastCursorRef.current, 750);
        if (cancelled) return;
        if (batch.cursor) {
          webcastCursorRef.current = batch.cursor;
        }
        if (typeof batch.viewerCount === 'number' && batch.viewerCount > 0) {
          const vc = batch.viewerCount;
          setSessionState((prev) =>
            prev
              ? { ...prev, viewerCount: vc, peakViewers: Math.max(prev.peakViewers, vc) }
              : prev
          );
          fetch(apiUrl('/api/live/event'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, type: 'viewer_count', viewerCount: vc }),
          }).catch(() => {});
        }
        for (const ev of batch.events) {
          if (seenEventIdsRef.current.has(ev.id) || processedIdsRef.current.has(ev.id)) {
            continue;
          }
          seenEventIdsRef.current.add(ev.id);
          if (seenEventIdsRef.current.size > 600) {
            const first = seenEventIdsRef.current.values().next().value;
            if (first) seenEventIdsRef.current.delete(first);
          }
          processEvent(ev as LiveEvent);
          fetch(apiUrl('/api/live/event'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, ...ev, id: ev.id }),
          }).catch(() => {});
        }
      } catch {
        // Ignore transient CORS / network glitches; next interval retries
      } finally {
        inFlight = false;
      }
    };

    void pullBatch();
    const timer = setInterval(pullBatch, 2800);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sessionState?.connectionStatus, sessionState?.roomId, token, processEvent]);

  // Client-safe bot ticker (works both on localhost and Cloudflare Edge)
  useEffect(() => {
    const botsActive = localBots || Boolean(sessionState?.botsEnabled);
    if (!botsActive || paused) return;
    const botUsers = ['artem_gg', 'lera_fox', 'max_turbo', 'nika_star', 'den_play'];
    const samples: Record<string, string[]> = {
      contexto: ['планета', 'звезда', 'луна', 'ракета', 'галактика', 'вселенная', 'небо'],
      'flag-quiz': ['бразилия', 'япония', 'франция', 'турция', 'индонезия'],
      'word-reveal': ['трансляция', 'микрофон', 'алгоритм', 'стрим'],
      'doodle-guess': ['кот', 'дом', 'ракета', 'корона', 'пицца'],
      'logo-quiz': ['tiktok', 'youtube', 'twitch', 'telegram'],
      'spot-the-country': ['япония', 'франция', 'египет', 'сша'],
      'would-you-rather': ['1', '2'],
      'would-you-rather-vs': ['1', '2'],
      trivia: ['1', '2', '3', '4'],
      'ball-royale': ['го!', 'атака!', 'буст', 'я здесь'],
      'land-grab': ['1', '2', '3', '4'],
      'secret-word': ['ОКЕАН', 'СТРИМ', 'МЕЧТА', 'ВИДЕО', 'ГОЛОС'],
      snake: ['ням', 'яблоко!', 'расти'],
      'fortress-battle': ['1', '2'],
      guesstimate: ['86400', '2017', '330', '206'],
      'emoji-quiz': ['король лев', 'человек паук', 'титаник'],
      'ege-oge': ['1', '2', '3', '4'],
    };
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      const user = botUsers[Math.floor(Math.random() * botUsers.length)];
      const list = samples[activeSlug] || samples.contexto;
      const msg = list[Math.floor(Math.random() * list.length)];
      processEvent({
        id: `cbot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'chat',
        timestamp: Date.now(),
        username: user,
        message: msg,
      });

      if (tick % 3 === 0) {
        const likeUser = botUsers[Math.floor(Math.random() * botUsers.length)];
        processEvent({
          id: `lbot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'like',
          timestamp: Date.now(),
          username: likeUser,
          likeCount: 15 + Math.floor(Math.random() * 40),
        });
      }

      if (Math.random() < 0.12) {
        const giftUser = botUsers[Math.floor(Math.random() * botUsers.length)];
        const isHeart = Math.random() < 0.35;
        processEvent({
          id: `gbot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'gift',
          timestamp: Date.now(),
          username: giftUser,
          giftName: isHeart ? 'Сердце' : 'Роза',
          giftEmoji: isHeart ? '🫰' : '🌹',
          coins: isHeart ? 5 : 1,
        });
      }
    }, 2200);
    return () => clearInterval(timer);
  }, [localBots, sessionState?.botsEnabled, paused, activeSlug, processEvent]);

  // Round timers + progressive reveal for Doodle & Logo
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          if (activeSlug === 'guesstimate') {
            const g = GUESSTIMATE_QUESTIONS[roundIdx % GUESSTIMATE_QUESTIONS.length];
            setHintText(`Точный ответ: ${g.answer} ${g.unit}`);
          }
          return 60;
        }
        return prev - 1;
      });
      if (activeSlug === 'doodle-guess' && !freeDrawMode) {
        setDoodleProgress((p) => Math.min(1, p + 0.04));
      }
      if (activeSlug === 'logo-quiz') {
        setLogoBlur((b) => Math.max(0, b - 0.5));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [activeSlug, freeDrawMode, paused, roundIdx]);

  // 15s auto next round countdown after someone wins
  useEffect(() => {
    if (nextRoundCountdown === null) return;
    if (nextRoundCountdown <= 0) {
      startNewRound();
      return;
    }
    const timer = setTimeout(() => setNextRoundCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [nextRoundCountdown, startNewRound]);

  // Helper actions for the built-in Phone App Streamer Remote
  const handleConnectTikTok = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      await resolveBackendOrigin();
      try {
        localStorage.setItem('vp_tiktok_nick', tiktokInput.trim());
      } catch {
        // ignore
      }
      const res = await fetch(apiUrl('/api/live/connect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'connect', username: tiktokInput }),
      });
      const data = await res.json();
      if (data.state) {
        setSessionState(data.state);
        if (Array.isArray(data.state.recentEvents)) {
          [...data.state.recentEvents].reverse().forEach((ev: LiveEvent) => processEvent(ev));
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleToggleBots = async () => {
    const next = !(localBots || sessionState?.botsEnabled);
    setLocalBots(next);
    const res = await fetch(apiUrl('/api/live/connect'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'toggle_bots', enabled: next, gameSlug: activeSlug }),
    }).catch(() => null);
    if (res) {
      const data = await res.json().catch(() => null);
      if (data?.state) setSessionState(data.state);
    }
  };

  const sendSimChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!simMessage.trim()) return;
    const text = simMessage.trim();
    setSimMessage('');
    const ev: LiveEvent = {
      id: `sim-${Date.now()}`,
      type: 'chat',
      timestamp: Date.now(),
      username: simUser,
      message: text,
    };
    processEvent(ev);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'chat', username: simUser, message: text }),
    }).catch(() => {});
  };

  const sendSimGift = async (giftName: string, coins: number, giftEmoji: string) => {
    const ev: LiveEvent = {
      id: `sgift-${Date.now()}`,
      type: 'gift',
      timestamp: Date.now(),
      username: simUser,
      avatar: '💎',
      giftName,
      coins,
      giftEmoji,
    };
    processEvent(ev);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'gift', username: simUser, giftName, coins, giftEmoji }),
    }).catch(() => {});
  };

  const sendSimLike = async (likeCount = 50) => {
    const ev: LiveEvent = {
      id: `slike-${Date.now()}`,
      type: 'like',
      timestamp: Date.now(),
      username: simUser,
      avatar: '❤️',
      likeCount,
    };
    processEvent(ev);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'like', username: simUser, likeCount }),
    }).catch(() => {});
  };

  const sendControlToServer = async (action: string, payload?: Record<string, unknown>) => {
    applyControlAction(action, payload);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'control', action, payload }),
    }).catch(() => {});
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
  };

  const topLeaderboard = useMemo(() => {
    const merged = { ...localScores };
    if (sessionState?.scores) {
      Object.values(sessionState.scores).forEach((s) => {
        if (!merged[s.username] || s.points > merged[s.username].points) {
          merged[s.username] = { username: s.username, avatar: s.avatar, points: s.points };
        }
      });
    }
    return Object.values(merged).sort((a, b) => b.points - a.points).slice(0, 3);
  }, [localScores, sessionState?.scores]);

  const topGifters = useMemo(() => {
    const sorted = Object.values(giftLeaders)
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 3);
    while (sorted.length < 3) {
      sorted.push({ username: '—', coins: 0, giftsCount: 0, lastEmoji: '🎁' });
    }
    return sorted;
  }, [giftLeaders]);

  const topLikers = useMemo(() => {
    const sorted = Object.values(likeLeaders)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3);
    while (sorted.length < 3) {
      sorted.push({ username: '—', likes: 0 });
    }
    return sorted;
  }, [likeLeaders]);

  // Skin background resolution (dark neon space by default)
  const skinBg = sessionState?.skin?.backgroundMode || 'neon';
  const accentColor = sessionState?.skin?.accentColor || '#7C3AED';
  const ballShape = sessionState?.skin?.ballShape || 'circle';

  const bgClass =
    activeSlug === 'would-you-rather-vs' || skinBg === 'neon'
      ? 'bg-gradient-to-b from-[#080614] via-[#130C2E] to-[#080613] text-white'
      : skinBg === 'sunset'
      ? 'bg-gradient-to-b from-[#1E1024] via-[#2A1128] to-[#13091F] text-white'
      : skinBg === 'light'
      ? 'bg-gradient-to-b from-[#fcfcfe] via-[#F7F3FF] to-[#EFE8FF] text-[#11101C]'
      : 'bg-[#07060F] text-white';

  const isDarkSurface = skinBg !== 'light' || activeSlug === 'would-you-rather-vs';

  // Render active game body
  const renderGameBody = () => {
    if (activeSlug === 'contexto') {
      const target = CONTEXTO_WORDS[roundIdx % CONTEXTO_WORDS.length];
      return (
        <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
          <div className={`rounded-2xl border p-3 text-center backdrop-blur-md ${isDarkSurface ? 'border-white/15 bg-white/[0.07] shadow-card' : 'border-violet-200 bg-white shadow-sm'}`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-violet-400">Напишите любое слово в чат</div>
            <div className="mt-1 font-display text-xl font-extrabold tracking-widest">
              {target.word
                .split('')
                .map((c, idx) => (idx < revealedLetters ? c.toUpperCase() : '•'))
                .join(' ')}
            </div>
            <div className="mt-0.5 text-[11px] opacity-65">Букв: {target.word.length} · Подарок 🌹 = подсказка</div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {contextoGuesses.map((g) => {
              const widthPct = Math.max(12, Math.min(100, 100 - (g.rank / 10)));
              const barColor =
                g.rank <= 30 ? 'bg-emerald-500' : g.rank <= 250 ? 'bg-amber-400' : 'bg-rose-400';
              return (
                <div
                  key={g.id}
                  className={`animate-spring-pop relative overflow-hidden rounded-xl border px-3 py-2 text-sm font-bold ${
                    isDarkSurface ? 'border-white/10 bg-white/10' : 'border-slate-200/80 bg-white'
                  }`}
                >
                  <div className={`absolute inset-y-0 left-0 opacity-20 ${barColor}`} style={{ width: `${widthPct}%` }} />
                  <div className="relative flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${barColor}`} />
                      <span>{g.word}</span>
                      <span className="text-[11px] font-medium opacity-60">@{g.user}</span>
                    </span>
                    <span className="font-mono text-xs font-extrabold">#{g.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeSlug === 'flag-quiz') {
      const f = FLAG_COUNTRIES[roundIdx % FLAG_COUNTRIES.length];
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="relative flex h-32 w-52 flex-col overflow-hidden rounded-3xl border-2 border-white/40 shadow-glow">
            <div className="flex h-full w-full">
              {f.colors.map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-6xl drop-shadow">
              {f.emoji}
            </div>
          </div>
          <div className={`rounded-2xl border px-4 py-1.5 font-display text-base font-bold tracking-widest ${isDarkSurface ? 'border-white/15 bg-white/10' : 'border-slate-200 bg-white shadow-sm'}`}>
            {f.name
              .split('')
              .map((ch, idx) => (ch === ' ' ? ' ' : idx < revealedLetters ? ch.toUpperCase() : '_'))
              .join(' ')}
          </div>
          {hintText && <div className="rounded-xl bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-200">{hintText}</div>}
          <div className="text-[11px] font-semibold opacity-70">1-й +3 очка · 2-й +2 очка · 3-й +1 очко</div>
        </div>
      );
    }

    if (activeSlug === 'word-reveal') {
      const item = REVEAL_WORDS[roundIdx % REVEAL_WORDS.length];
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="rounded-full bg-[#6C2BD9] px-3 py-1 text-xs font-bold text-white">
            Тема: {item.category}
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 px-2">
            {item.word.split('').map((ch, idx) => {
              const shown = idx < revealedLetters;
              return (
                <div
                  key={idx}
                  className={`flex h-11 w-9 items-center justify-center rounded-xl border-2 font-display text-lg font-extrabold transition-all ${
                    shown
                      ? 'border-[#6C2BD9] bg-[#6C2BD9] text-white shadow-card'
                      : isDarkSurface
                      ? 'border-white/20 bg-white/10 text-transparent'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  {shown ? ch : '?'}
                </div>
              );
            })}
          </div>
          <p className="text-xs font-medium opacity-75">Пишите буквы или слово целиком в чат!</p>
        </div>
      );
    }

    if (activeSlug === 'doodle-guess') {
      const item = DOODLE_ITEMS[roundIdx % DOODLE_ITEMS.length];
      return (
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Подсказка: {item.hint}</span>
            <button
              type="button"
              onClick={() => setFreeDrawMode((v) => !v)}
              className="rounded-lg bg-[#6C2BD9] px-2.5 py-1 text-[11px] text-white"
            >
              {freeDrawMode ? 'Авто-рисунок' : 'Рисовать пальцем'}
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-2xl">
            <CanvasArena
              gameSlug="doodle-guess"
              latestEvent={latestEvent}
              paused={paused}
              roundKey={roundNum}
              ballShape={ballShape}
              accentColor={accentColor}
              doodleWord={item.word}
              doodleProgress={doodleProgress}
              freeDrawMode={freeDrawMode}
            />
          </div>
        </div>
      );
    }

    if (activeSlug === 'logo-quiz') {
      const item = LOGO_BRANDS[roundIdx % LOGO_BRANDS.length];
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div
            className="flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/25 text-6xl shadow-glow transition-all duration-700"
            style={{
              backgroundColor: item.bg,
              color: item.color,
              filter: `blur(${Math.max(0, logoBlur)}px)`,
            }}
          >
            {item.glyph}
          </div>
          <div className={`rounded-xl px-3.5 py-1.5 text-[11px] font-bold ${isDarkSurface ? 'border border-white/15 bg-white/10 text-white' : 'bg-white/80 text-[#11101C]'}`}>
            Размытие: {Math.round(logoBlur)}px · Подарок 🌹 убирает блюр!
          </div>
        </div>
      );
    }

    if (activeSlug === 'spot-the-country') {
      const scene = COUNTRY_SCENES[roundIdx % COUNTRY_SCENES.length];
      return (
        <div className="flex flex-1 flex-col justify-center gap-2.5">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-800 p-4 text-center text-white shadow-card">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Панорама улицы</div>
            <div className="my-3 text-4xl tracking-widest">{scene.visual}</div>
            <p className="rounded-xl bg-black/30 p-2.5 text-xs font-medium">{scene.clues}</p>
          </div>
          {hintText && <div className="rounded-xl bg-amber-400/20 p-1.5 text-center text-[11px] font-bold text-amber-200">{hintText}</div>}
          <div className="text-center font-display text-sm font-bold tracking-widest">
            {scene.country
              .split('')
              .map((c, idx) => (idx < revealedLetters ? c.toUpperCase() : '•'))
              .join(' ')}
          </div>
        </div>
      );
    }

    if (activeSlug === 'would-you-rather' || activeSlug === 'would-you-rather-vs') {
      const d = DILEMMAS[roundIdx % DILEMMAS.length];
      const total = Math.max(1, votes.a + votes.b);
      const pctA = Math.round((votes.a / total) * 100);
      const pctB = 100 - pctA;
      const isVs = activeSlug === 'would-you-rather-vs';
      return (
        <div className="flex flex-1 flex-col justify-between gap-2.5">
          <div className={`rounded-2xl p-3.5 text-center shadow-sm ${isVs ? 'border border-fuchsia-500 bg-fuchsia-950/60' : 'bg-violet-600 text-white'}`}>
            <div className="text-[11px] font-bold uppercase opacity-80">Напиши «1»</div>
            <div className="mt-1 text-base font-extrabold">{d.a}</div>
            <div className="mt-1 text-lg font-black">{pctA}% ({votes.a})</div>
          </div>

          <div className="relative h-6 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500"
              style={{ width: `${pctA}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-white drop-shadow">
              {isVs ? '⚡ VS ЛАЗЕР ⚡' : 'БАЛАНС ГОЛОСОВ'}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
            {votes.balls.slice(-10).map((b) => (
              <span
                key={b.id}
                className="animate-spring-pop inline-flex h-7 items-center rounded-full px-2 text-[10px] font-bold text-white shadow"
                style={{ backgroundColor: b.side === 1 ? '#6C2BD9' : '#EC4899' }}
              >
                {b.side}: {b.user.slice(0, 6)}
              </span>
            ))}
          </div>

          <div className={`rounded-2xl p-3.5 text-center shadow-sm ${isVs ? 'border border-cyan-400 bg-cyan-950/60' : 'bg-pink-500 text-white'}`}>
            <div className="text-[11px] font-bold uppercase opacity-80">Напиши «2»</div>
            <div className="mt-1 text-base font-extrabold">{d.b}</div>
            <div className="mt-1 text-lg font-black">{pctB}% ({votes.b})</div>
          </div>
        </div>
      );
    }

    if (activeSlug === 'trivia') {
      const q = TRIVIA_QUESTIONS[roundIdx % TRIVIA_QUESTIONS.length];
      return (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="rounded-full bg-[#6C2BD9] px-3 py-1 text-white">{q.theme}</span>
            {doublePoints && <span className="rounded-full bg-amber-400 px-3 py-1 text-black">x2 ОЧКИ!</span>}
          </div>
          <div className={`rounded-2xl p-4 text-base font-extrabold leading-snug ${isDarkSurface ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
            {q.q}
          </div>
          <div className="grid gap-2">
            {q.options.map((opt, idx) => {
              const hidden = triviaHiddenIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                    hidden
                      ? 'opacity-20 line-through'
                      : isDarkSurface
                      ? 'border-white/15 bg-white/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F2EBFF] text-xs font-black text-[#6C2BD9]">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeSlug === 'ball-royale' || activeSlug === 'land-grab' || activeSlug === 'snake' || activeSlug === 'fortress-battle') {
      return (
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
            <span>
              {activeSlug === 'ball-royale'
                ? 'Любое сообщение = шар!'
                : activeSlug === 'land-grab'
                ? 'Пиши 1, 2, 3 или 4!'
                : activeSlug === 'snake'
                ? 'Пиши в чат = яблоко для змейки!'
                : 'Пиши 1 или 2 + ставь лайки!'}
            </span>
            <span>60 FPS Canvas</span>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-2xl">
            <CanvasArena
              gameSlug={activeSlug}
              latestEvent={latestEvent}
              paused={paused}
              roundKey={roundNum}
              ballShape={ballShape}
              accentColor={accentColor}
              onWinner={(u, reason) => triggerWin(u, reason, 5)}
            />
          </div>
        </div>
      );
    }

    if (activeSlug === 'secret-word') {
      const target = SECRET_5_WORDS[roundIdx % SECRET_5_WORDS.length];
      const rows = Array.from({ length: 6 }, (_, i) => wordleRows[i] || '');
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <div className="text-xs font-bold opacity-75">Пишите слово из 5 букв (пример: МЕЧТА)</div>
          <div className="grid gap-1.5">
            {rows.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, cIdx) => {
                  const letter = row[cIdx] || '';
                  let cellClass = isDarkSurface ? 'border-white/20 bg-white/10' : 'border-slate-300 bg-white';
                  if (letter) {
                    if (target[cIdx] === letter) cellClass = 'border-emerald-500 bg-emerald-500 text-white';
                    else if (target.includes(letter)) cellClass = 'border-amber-400 bg-amber-400 text-white';
                    else cellClass = 'border-slate-400 bg-slate-500 text-white';
                  } else if (rIdx === 0 && cIdx < revealedLetters - 1) {
                    cellClass = 'border-emerald-500 bg-emerald-100 text-emerald-800';
                  }
                  return (
                    <div
                      key={cIdx}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 font-display text-lg font-extrabold ${cellClass}`}
                    >
                      {letter || (rIdx === 0 && cIdx < revealedLetters - 1 ? target[cIdx] : '')}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSlug === 'guesstimate') {
      const g = GUESSTIMATE_QUESTIONS[roundIdx % GUESSTIMATE_QUESTIONS.length];
      return (
        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className={`rounded-2xl border p-4 text-center backdrop-blur-md ${isDarkSurface ? 'border-white/15 bg-white/[0.08]' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="text-xs font-bold uppercase text-violet-400">Напиши число в чат</div>
            <div className="mt-1 text-base font-extrabold">{g.q}</div>
          </div>
          {hintText && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-2.5 text-center text-xs font-bold text-emerald-200">{hintText}</div>}
          <div className="space-y-1.5">
            {estimates.map((e, i) => (
              <div key={i} className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-sm font-bold ${isDarkSurface ? 'border-white/10 bg-white/[0.08]' : 'border-slate-200 bg-white'}`}>
                <span>@{e.user}</span>
                <span className="font-mono text-cyan-300">{e.val.toLocaleString('ru-RU')} {g.unit}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSlug === 'emoji-quiz') {
      const puz = EMOJI_PUZZLES[roundIdx % EMOJI_PUZZLES.length];
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-black">{puz.category}</span>
          <div className={`rounded-3xl px-6 py-7 text-6xl tracking-widest ${isDarkSurface ? 'bg-white/10' : 'bg-white shadow-soft'}`}>
            {puz.emojis}
          </div>
          <div className="font-display text-base font-bold tracking-widest">
            {puz.answer
              .split('')
              .map((c, idx) => (c === ' ' ? '   ' : idx < revealedLetters ? c.toUpperCase() : '_'))
              .join(' ')}
          </div>
          {hintText && <div className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">{hintText}</div>}
        </div>
      );
    }

    // ege-oge
    const filteredEge = EGE_OGE_QUESTIONS.filter((e) => egeFilter === 'ALL' || e.exam === egeFilter);
    const egeItem = filteredEge[roundIdx % filteredEge.length] || EGE_OGE_QUESTIONS[0];
    return (
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(['ALL', 'ЕГЭ', 'ОГЭ'] as const).map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setEgeFilter(ex)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                  egeFilter === ex ? 'bg-[#7C3AED] text-white' : isDarkSurface ? 'bg-white/10 text-slate-200' : 'bg-white/70 text-[#11101C]'
                }`}
              >
                {ex === 'ALL' ? 'Все' : ex}
              </button>
            ))}
          </div>
          <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">{egeItem.subject}</span>
        </div>
        <div className={`rounded-2xl p-3.5 text-sm font-extrabold ${isDarkSurface ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
          {egeItem.q}
        </div>
        <div className="grid gap-1.5">
          {egeItem.options.map((opt, idx) => (
            <div key={idx} className={`rounded-xl px-3 py-2 text-xs font-bold ${isDarkSurface ? 'bg-white/10' : 'bg-white'}`}>
              {opt}
            </div>
          ))}
        </div>
        {hintText && <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 p-2 text-[11px] font-semibold text-cyan-200">{hintText}</div>}
      </div>
    );
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden select-none ${bgClass} ${
        shaking ? 'animate-shake' : ''
      }`}
    >
      {/* Confetti celebration overlay */}
      {confetti && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{
                left: `${(i * 19) % 100}%`,
                backgroundColor: ['#6C2BD9', '#EC4899', '#22D3EE', '#FACC15', '#10B981'][i % 5],
                animationDelay: `${(i % 6) * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* TikTok Safe Zone Visual Guide (when toggled on) */}
      {showSafeZones && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="h-[8%] border-b-2 border-dashed border-rose-500/80 bg-rose-500/15 px-3 py-1 text-[10px] font-bold text-rose-600">
            Зона шапки TikTok (~150px)
          </div>
          <div className="absolute right-0 top-[8%] bottom-[16%] w-[11%] border-l-2 border-dashed border-rose-500/80 bg-rose-500/15" />
          <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-2 border-dashed border-rose-500/80 bg-rose-500/15 p-2 text-[10px] font-bold text-rose-600">
            Зона чата и кнопок TikTok (~300px)
          </div>
        </div>
      )}

      {/* Safe-zone padded inner container */}
      <div className="flex h-full w-full flex-col pt-5 pb-6 pl-3 pr-5 sm:px-4">
        {/* Symmetrical Top Game HUD */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-base shadow-sm backdrop-blur-md">
              {game.emoji}
            </span>
            <div className="min-w-0">
              <div className="truncate font-display text-[11px] font-extrabold leading-tight">{game.title}</div>
              <div className="truncate text-[9px] font-semibold text-violet-300">
                🏆 @{topLeaderboard[0]?.username || 'чат'} · {topLeaderboard[0]?.points || 0}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide backdrop-blur-md ${
              roundTimer <= 10 && !paused
                ? 'border-rose-400/60 bg-rose-500/20 text-rose-200 animate-pulse'
                : isDarkSurface
                ? 'border-white/15 bg-white/10 text-white'
                : 'border-violet-200 bg-white text-[#11101C]'
            }`}
          >
            <span className="opacity-75">Р{roundNum}</span>
            <span className="opacity-40">•</span>
            <span className="font-mono">{paused ? 'ПАУЗА' : `${roundTimer}с`}</span>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            {sessionState?.connectionStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <Wifi className="h-3 w-3" /> LIVE
              </span>
            ) : localBots || sessionState?.botsEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                <Bot className="h-3 w-3" /> БОТЫ
              </span>
            ) : null}

            <button
              type="button"
              onClick={toggleMute}
              title="Звук"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Dedicated Donor Gift Spotlight Card */}
        {giftSpotlight ? (
          <div className="animate-spring-pop mb-2 flex items-center justify-between gap-2 rounded-2xl border border-amber-300/60 bg-gradient-to-r from-rose-600/90 via-fuchsia-600/90 to-amber-500/90 p-2 text-white shadow-glow backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2">
              <div className="relative shrink-0">
                <PlayerAvatar avatar={giftSpotlight.avatar} username={giftSpotlight.username} size="md" accent="amber" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] text-black shadow">
                  <Crown className="h-2.5 w-2.5" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-black leading-tight">@{giftSpotlight.username}</div>
                <div className="truncate text-[10px] font-semibold text-amber-100">
                  подарил(а) {giftSpotlight.giftName}
                </div>
                <span className="mt-0.5 inline-block rounded-full bg-black/25 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                  {giftSpotlight.effectText}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-xl bg-black/25 px-2.5 py-1 text-center">
              <span className="text-xl leading-none">{giftSpotlight.giftEmoji}</span>
              <span className="mt-0.5 font-mono text-[10px] font-black text-amber-300">💎 +{giftSpotlight.coins}</span>
            </div>
          </div>
        ) : (
          eventBanner && (
            <div
              className={`animate-spring-pop mb-2 rounded-xl px-3 py-1.5 text-center text-xs font-extrabold text-white shadow-card ${
                eventBanner.tone === 'win'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : eventBanner.tone === 'gift'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                  : 'bg-[#6C2BD9]'
              }`}
            >
              {eventBanner.text}
            </div>
          )
        )}

        {/* Round Winner Card */}
        {roundWinner && (
          <div className="animate-spring-pop mb-2 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 text-center text-white shadow-soft">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Раунд завершён!</div>
            <div className="font-display text-sm font-extrabold">
              🎉 @{roundWinner.user} — {roundWinner.answer}
            </div>
            {nextRoundCountdown !== null && (
              <div className="mt-0.5 text-[10px] font-semibold opacity-90">
                Следующий раунд через {nextRoundCountdown} сек...
              </div>
            )}
          </div>
        )}

        {/* Symmetrical Framed Game Stage */}
        <div
          className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border p-2.5 backdrop-blur-md ${
            isDarkSurface
              ? 'border-white/15 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent shadow-card'
              : 'border-violet-200/80 bg-white/80 shadow-sm'
          }`}
        >
          {renderGameBody()}
        </div>

        {/* Bottom Symmetrical Dual Leaderboards: Gifts Left / Likes Right */}
        <div className="mt-2 space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
            {/* LEFT: Top Gifters */}
            <div
              className={`flex flex-col rounded-2xl border p-2 backdrop-blur-md ${
                isDarkSurface
                  ? 'border-amber-400/25 bg-gradient-to-b from-amber-500/15 to-rose-500/5 text-white'
                  : 'border-amber-200 bg-white/95 text-[#11101C] shadow-sm'
              }`}
            >
              <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">🎁 ТОП ПОДАРКОВ</span>
                <Trophy className="h-3 w-3 text-amber-300" />
              </div>
              <div className="space-y-1">
                {topGifters.map((g, idx) => (
                  <div key={`${g.username}-${idx}`} className="flex items-center justify-between gap-1 text-[10px] leading-tight">
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="shrink-0 text-[10px]">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <PlayerAvatar avatar={g.avatar} username={g.username} size="xs" accent="amber" />
                      <span className="truncate font-bold">{g.username === '—' ? '—' : `@${g.username}`}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] font-extrabold text-amber-300">
                      {g.coins > 0 ? `${g.lastEmoji}${g.coins}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Top Likers */}
            <div
              className={`flex flex-col rounded-2xl border p-2 backdrop-blur-md ${
                isDarkSurface
                  ? 'border-pink-400/25 bg-gradient-to-b from-pink-500/15 to-cyan-500/5 text-white'
                  : 'border-pink-200 bg-white/95 text-[#11101C] shadow-sm'
              }`}
            >
              <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-pink-300">❤️ ТОП ЛАЙКОВ</span>
                <Heart className="h-3 w-3 text-pink-400" />
              </div>
              <div className="space-y-1">
                {topLikers.map((l, idx) => (
                  <div key={`${l.username}-${idx}`} className="flex items-center justify-between gap-1 text-[10px] leading-tight">
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="shrink-0 text-[10px]">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <PlayerAvatar avatar={l.avatar} username={l.username} size="xs" accent="rose" />
                      <span className="truncate font-bold">{l.username === '—' ? '—' : `@${l.username}`}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] font-extrabold text-pink-300">
                      {l.likes > 0 ? `❤️${l.likes}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Live Chat & Gift Feed */}
          <div
            className={`space-y-1 rounded-2xl border px-2.5 py-1.5 text-[10px] backdrop-blur-md ${
              isDarkSurface ? 'border-white/10 bg-black/45 text-slate-200' : 'border-slate-200 bg-black/5'
            }`}
          >
            {chatFeed.length > 0 ? (
              chatFeed.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className={`animate-spring-pop flex items-center justify-between gap-1.5 rounded-lg px-1.5 py-0.5 ${
                    c.isGift ? 'bg-gradient-to-r from-pink-500/20 to-amber-500/15 text-amber-100' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <PlayerAvatar
                      avatar={c.avatar}
                      username={c.user}
                      size="xs"
                      accent={c.isGift ? 'amber' : 'violet'}
                    />
                    <span className={`shrink-0 font-extrabold ${c.isGift ? 'text-amber-300' : 'text-violet-300'}`}>
                      @{c.user}:
                    </span>
                    <span className="truncate font-medium">{c.text}</span>
                  </div>
                  {c.isGift && c.coins ? (
                    <span className="shrink-0 font-mono text-[9px] font-black text-amber-300">
                      {c.giftEmoji || '🎁'} +{c.coins}
                    </span>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 opacity-70">
                <MessageSquare className="h-3 w-3 shrink-0" />
                <span>Напишите сообщение в чат TikTok...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Mobile App Streamer Remote Toggle (shown in /play mode unless hidden for OBS) */}
      {mode === 'play' && !hideHudForObs && (
        <button
          type="button"
          onClick={() => setRemoteOpen(true)}
          className="absolute bottom-3 left-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-[#6C2BD9] px-3.5 py-2 text-xs font-bold text-white shadow-glow transition hover:bg-[#5821B8]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Пульт / TikTok</span>
        </button>
      )}

      {mode === 'play' && hideHudForObs && (
        <button
          type="button"
          onClick={() => setHideHudForObs(false)}
          title="Показать пульт"
          className="absolute bottom-2 left-2 z-30 h-6 w-6 rounded-full bg-black/5 text-transparent hover:bg-black/40 hover:text-white"
        >
          ⚙️
        </button>
      )}

      {/* Slide-up Mobile Streamer Remote Drawer */}
      {remoteOpen && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/70 backdrop-blur-md">
          <div className="max-h-[88%] overflow-y-auto rounded-t-3xl border-t border-white/15 bg-[#120E24] p-4 text-white shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="font-display text-sm font-bold">Пульт телефона / Стримера</span>
              </div>
              <button
                type="button"
                onClick={() => setRemoteOpen(false)}
                className="rounded-xl bg-white/10 p-1.5 text-slate-300 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Real TikTok LIVE Connect */}
            <form onSubmit={handleConnectTikTok} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
              <label className="text-xs font-bold text-[#94A3B8]">Ник TikTok для подключения к чату эфира</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={tiktokInput}
                  onChange={(e) => setTiktokInput(e.target.value)}
                  placeholder="@ваш_ник_в_tiktok"
                  className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3 py-2 text-xs font-semibold text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={connecting}
                  className="rounded-xl bg-[#7C3AED] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {connecting ? '...' : 'Подключить'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-semibold">
                  {sessionState?.connectionStatus === 'connected' ? (
                    <span className="text-emerald-400">● Подключён к @{sessionState.tiktokUsername}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <WifiOff className="h-3 w-3" /> {sessionState?.connectionStatus === 'error' ? 'Эфир не найден' : 'Не подключено'}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleToggleBots}
                  className={`rounded-lg px-2 py-1 font-bold ${
                    localBots || sessionState?.botsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {localBots || sessionState?.botsEnabled ? '🤖 Боты: ВКЛ' : '🤖 Боты: ВЫКЛ'}
                </button>
              </div>
              {sessionState?.connectionError && (
                <p className="mt-1.5 text-[11px] leading-tight text-rose-400">{sessionState.connectionError}</p>
              )}
            </form>

            {/* Quick Controls */}
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => sendControlToServer('hint')}
                className="flex flex-col items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/20 p-2 text-[11px] font-bold text-violet-200"
              >
                <Lightbulb className="h-4 w-4" /> Подсказка
              </button>
              <button
                type="button"
                onClick={() => sendControlToServer('letter')}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[11px] font-bold text-white"
              >
                🔤 Буква
              </button>
              <button
                type="button"
                onClick={() => sendControlToServer('new_round')}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[11px] font-bold text-white"
              >
                <SkipForward className="h-4 w-4" /> Новый
              </button>
              <button
                type="button"
                onClick={() => sendControlToServer('pause')}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[11px] font-bold text-white"
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {paused ? 'Пуск' : 'Пауза'}
              </button>
            </div>

            {/* Test Message & Gift */}
            <form onSubmit={sendSimChat} className="mt-3 flex gap-1.5">
              <input
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                placeholder="Написать в чат для теста..."
                className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3 py-2 text-xs font-medium text-white placeholder:text-slate-500"
              />
              <button type="submit" className="rounded-xl bg-[#7C3AED] px-3 text-white">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => sendSimGift('Роза', 1, '🌹')}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-bold text-rose-300"
              >
                <Gift className="h-3 w-3" /> 🌹 Роза (1)
              </button>
              <button
                type="button"
                onClick={() => sendSimGift('Сердце', 5, '🫰')}
                className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-bold text-amber-300"
              >
                🫰 Сердце (5)
              </button>
              <button
                type="button"
                onClick={() => sendSimGift('Пончик', 30, '🍩')}
                className="inline-flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/15 px-2.5 py-1.5 text-[11px] font-bold text-violet-300"
              >
                🍩 Пончик (30)
              </button>
              <button
                type="button"
                onClick={() => sendSimLike(50)}
                className="inline-flex items-center gap-1 rounded-xl border border-pink-500/30 bg-pink-500/15 px-2.5 py-1.5 text-[11px] font-bold text-pink-300"
              >
                <Heart className="h-3 w-3" /> Лайк (+50)
              </button>
            </div>

            {/* Switch Game */}
            <div className="mt-3">
              <div className="mb-1.5 text-xs font-bold text-[#94A3B8]">Быстрое переключение игры (17 игр)</div>
              <div className="grid grid-cols-2 gap-1.5">
                {GAMES.map((g) => (
                  <button
                    key={g.slug}
                    type="button"
                    onClick={() => {
                      sendControlToServer('set_game', { slug: g.slug });
                      setRemoteOpen(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-left text-xs font-semibold ${
                      activeSlug === g.slug
                        ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                        : 'border-white/10 bg-white/[0.04] text-slate-200'
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span className="truncate">{g.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Utility buttons for OBS & Mobile */}
            <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setShowSafeZones((s) => !s)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                <Eye className="h-3.5 w-3.5" /> {showSafeZones ? 'Скрыть зоны TikTok' : 'Безопасные зоны TikTok'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHideHudForObs(true);
                  setRemoteOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                📺 Чистый режим для OBS / Стрима
              </button>
              <button
                type="button"
                onClick={() => sendControlToServer('reset_scores')}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Сбросить очки
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Swords, Play, Check, Wifi, Users, Coins, Heart, MessageSquare, AlertCircle } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { getOrCreateStreamerProfile, normalizeNick } from '@/lib/streamerSession';
import type { SessionState } from '@/lib/server/liveHub';

function sumPoints(state: SessionState | null): number {
  if (!state?.scores) return 0;
  return Object.values(state.scores).reduce((acc, p) => acc + (p.points || 0), 0);
}

export default function PlaylistPage() {
  const [roomToken, setRoomToken] = useState('live');
  const [myNick, setMyNick] = useState('');
  const [autopilot, setAutopilot] = useState(false);
  const [rotateBy, setRotateBy] = useState<'rounds' | 'minutes'>('rounds');
  const [intervalVal, setIntervalVal] = useState(3);
  const [queue, setQueue] = useState(['contexto', 'flag-quiz', 'ball-royale', 'secret-word']);
  const [rivalNick, setRivalNick] = useState('');
  const [battleActive, setBattleActive] = useState(false);
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleError, setBattleError] = useState('');
  const [myState, setMyState] = useState<SessionState | null>(null);
  const [rivalState, setRivalState] = useState<SessionState | null>(null);
  const [saved, setSaved] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeBattleTokenRef = useRef<string>('');

  useEffect(() => {
    const profile = getOrCreateStreamerProfile();
    const t = profile.token;
    setRoomToken(t);
    setMyNick(profile.tiktokUsername);

    resolveBackendOrigin().then(() => {
      fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(t)}&mode=json`))
        .then((r) => r.json())
        .then((d) => {
          if (d?.state) {
            setMyState(d.state);
            const pl = d.state.playlist;
            if (pl) {
              if (typeof pl.autopilot === 'boolean') setAutopilot(pl.autopilot);
              if (pl.rotateBy === 'rounds' || pl.rotateBy === 'minutes') setRotateBy(pl.rotateBy);
              if (typeof pl.rotateInterval === 'number' && pl.rotateInterval >= 1) {
                setIntervalVal(pl.rotateInterval);
              }
              if (Array.isArray(pl.queueSlugs) && pl.queueSlugs.length > 0) {
                setQueue(pl.queueSlugs);
              }
            }
          }
        })
        .catch(() => {});
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const toggleGame = (slug: string) => {
    setQueue((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const savePlaylist = async () => {
    await resolveBackendOrigin();
    const safeQueue = queue.length > 0 ? queue : ['contexto'];
    const res = await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: roomToken,
        type: 'control',
        action: 'update_playlist',
        payload: {
          playlist: {
            autopilot,
            rotateBy,
            rotateInterval: Math.max(1, Number(intervalVal) || 1),
            queueSlugs: safeQueue,
          },
        },
      }),
    }).catch(() => null);

    if (res) {
      const data = await res.json().catch(() => null);
      if (data?.state) {
        setMyState(data.state);
        try {
          const bc = new BroadcastChannel(`vibeplay_${roomToken}`);
          bc.postMessage({ type: 'session_state', state: data.state });
          bc.close();
        } catch {
          // ignore
        }
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const pollBattleStates = async (myTok: string, rivalTok: string) => {
    try {
      const [r1, r2] = await Promise.all([
        fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(myTok)}&mode=json`)).then((r) => r.json()),
        fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(rivalTok)}&mode=json`)).then((r) => r.json()),
      ]);
      if (r1?.state) setMyState(r1.state);
      if (r2?.state) setRivalState(r2.state);
    } catch {
      // ignore transient poll error
    }
  };

  const toggleBattle = async () => {
    if (battleActive) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      const prevBattleToken = activeBattleTokenRef.current;
      setBattleActive(false);
      setBattleError('');
      if (prevBattleToken) {
        await resolveBackendOrigin();
        await fetch(apiUrl('/api/live/connect'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: prevBattleToken, action: 'disconnect' }),
        }).catch(() => null);
      }
      activeBattleTokenRef.current = '';
      return;
    }

    const cleanRival = normalizeNick(rivalNick);
    if (!cleanRival) {
      setBattleError('Введите @ник стримера-соперника в TikTok.');
      return;
    }

    setBattleError('');
    setBattleLoading(true);
    const battleToken = `battle-${roomToken}-${cleanRival}`;
    activeBattleTokenRef.current = battleToken;

    try {
      await resolveBackendOrigin();
      const res = await fetch(apiUrl('/api/live/connect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: battleToken, username: cleanRival }),
      });
      const data = await res.json().catch(() => null);
      if (data?.state) {
        setRivalState(data.state);
      }
      if (!data?.ok) {
        setBattleError(data?.state?.connectionError || data?.error || `@${cleanRival} сейчас не в прямом эфире или недоступен.`);
      }
      setBattleActive(true);
      await pollBattleStates(roomToken, battleToken);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        pollBattleStates(roomToken, battleToken);
      }, 4000);
    } catch {
      setBattleError('Не удалось связаться с сервером подключения.');
    } finally {
      setBattleLoading(false);
    }
  };

  const myPoints = sumPoints(myState);
  const rivalPoints = sumPoints(rivalState);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Плейлист, Автопилот и Битва стримеров</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Автоматическая ротация игр в эфире ({roomToken}) и проверка баттла с реальным соперником.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
            <Check className="h-4 w-4" /> Сохранено
          </span>
        )}
      </div>

      {/* Autopilot */}
      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Автопилот плейлиста</h2>
            <p className="text-xs text-[#94A3B8]">Меняет игру автоматически на экране OBS/телефона, пока вы общаетесь с аудиторией.</p>
          </div>
          <button
            type="button"
            onClick={() => setAutopilot((v) => !v)}
            className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              autopilot ? 'bg-emerald-500 text-white shadow-glow' : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {autopilot ? 'Автопилот: ВКЛ' : 'Автопилот: ВЫКЛ'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={rotateBy}
            onChange={(e) => setRotateBy(e.target.value as 'rounds' | 'minutes')}
            className="rounded-xl border border-white/15 bg-[#080612] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400"
          >
            <option value="rounds">Через число раундов</option>
            <option value="minutes">Через время (минуты)</option>
          </select>
          <input
            type="number"
            min={1}
            max={60}
            value={intervalVal}
            onChange={(e) => setIntervalVal(Number(e.target.value))}
            className="w-24 rounded-xl border border-white/15 bg-[#080612] px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-400"
          />
          <button
            type="button"
            onClick={savePlaylist}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white hover:bg-[#6D28D9]"
          >
            <Play className="h-3.5 w-3.5" /> Сохранить очередь
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {GAMES.map((g) => {
            const active = queue.includes(g.slug);
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => toggleGame(g.slug)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                  active
                    ? 'border-violet-400 bg-[#7C3AED]/20 text-violet-200'
                    : 'border-white/10 bg-[#080612]/70 text-slate-300 hover:border-white/25 hover:text-white'
                }`}
              >
                <span>{g.emoji}</span>
                <span className="truncate">{g.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streamer Battle */}
      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-violet-300" />
          <h2 className="font-display text-lg font-bold text-white">Битва стримеров (реальный эфир соперника)</h2>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Укажите @ник второго стримера в TikTok LIVE — панель подключится к его трансляции и сравнит онлайн, очки, монеты и активность чата.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={rivalNick}
            onChange={(e) => setRivalNick(e.target.value)}
            placeholder="@ник_соперника_tiktok"
            disabled={battleActive}
            className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-violet-400 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={battleLoading}
            onClick={toggleBattle}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white transition ${
              battleActive
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
            } disabled:opacity-60`}
          >
            {battleLoading ? 'Подключение...' : battleActive ? 'Остановить битву' : 'Начать битву эфиров'}
          </button>
        </div>

        {battleError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs font-semibold text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{battleError}</span>
          </div>
        )}

        {battleActive && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Your live room */}
            <div className="rounded-2xl border border-violet-500/30 bg-[#7C3AED]/15 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-violet-200">
                  {myState?.tiktokUsername ? `@${myState.tiktokUsername}` : myNick ? `@${myNick}` : 'Ваш эфир'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    myState?.connectionStatus === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  <Wifi className="h-3 w-3" />
                  {myState?.connectionStatus === 'connected' ? 'В эфире' : 'Ожидание'}
                </span>
              </div>
              <div className="mt-2 font-display text-2xl font-extrabold text-white">
                {myPoints.toLocaleString('ru-RU')} очков
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-violet-300" />
                  <span>{myState?.viewerCount ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-300" />
                  <span>{myState?.totalCoins ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-pink-400" />
                  <span>{myState?.totalLikes ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Rival live room */}
            <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-pink-200">
                  @{normalizeNick(rivalNick)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    rivalState?.connectionStatus === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  <Wifi className="h-3 w-3" />
                  {rivalState?.connectionStatus === 'connected'
                    ? 'В эфире'
                    : rivalState?.connectionStatus === 'error'
                    ? 'Оффлайн'
                    : 'Подключение'}
                </span>
              </div>
              <div className="mt-2 font-display text-2xl font-extrabold text-white">
                {rivalPoints.toLocaleString('ru-RU')} очков
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-pink-300" />
                  <span>{rivalState?.viewerCount ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-300" />
                  <span>{rivalState?.totalCoins ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-pink-400" />
                  <span>{rivalState?.totalLikes ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{rivalState?.totalMessages ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

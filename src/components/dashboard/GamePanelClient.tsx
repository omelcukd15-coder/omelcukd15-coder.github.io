'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  Wifi,
  Bot,
  Gift,
  Send,
  Heart,
} from 'lucide-react';
import { GAMES, getGameBySlug } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';
import { GameScreen } from '@/components/game-engine/GameScreen';
import { SessionState } from '@/lib/server/liveHub';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';

export function GamePanelClient({ lang, slug }: { lang: Lang; slug: string }) {
  const token = 'streamer-demo';
  const game = getGameBySlug(slug);
  const [tiktokNick, setTiktokNick] = useState('');
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [setupTab, setSetupTab] = useState<'obs' | 'phone'>('phone');
  const [origin, setOrigin] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [controlTrigger, setControlTrigger] = useState<{
    action: string;
    ts: number;
    payload?: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    let saved = '';
    try {
      saved = localStorage.getItem('vp_tiktok_nick') || '';
      if (saved) setTiktokNick(saved);
    } catch {
      // ignore
    }
    resolveBackendOrigin().then(() => {
      const userQ = saved ? `&username=${encodeURIComponent(saved)}` : '';
      fetch(apiUrl(`/api/live/stream?token=${token}&mode=json${userQ}`))
        .then((r) => r.json())
        .then((d) => {
          if (d.state) {
            setSessionState(d.state);
            postToChannel({ type: 'session_state', state: d.state });
          }
        })
        .catch(() => {});

      fetch(apiUrl('/api/live/event'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type: 'control', action: 'set_game', payload: { slug } }),
      }).catch(() => {});
    });
  }, [slug]);

  const playPath = `/play/${token}/${game.slug}`;
  const fullUrl = origin ? `${origin}${playPath}` : playPath;

  const postToChannel = (payload: unknown) => {
    try {
      const bc = new BroadcastChannel(`vibeplay_${token}`);
      bc.postMessage(payload);
      bc.close();
    } catch {
      // ignore
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const connectTikTok = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      await resolveBackendOrigin();
      localStorage.setItem('vp_tiktok_nick', tiktokNick.trim());
      const res = await fetch(apiUrl('/api/live/connect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'connect', username: tiktokNick }),
      });
      const data = await res.json();
      if (data.state) {
        setSessionState(data.state);
        postToChannel({ type: 'session_state', state: data.state });
        if (Array.isArray(data.state.recentEvents)) {
          [...data.state.recentEvents].reverse().forEach((ev: unknown) => postToChannel({ event: ev }));
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  const toggleBots = async () => {
    const next = !(sessionState?.botsEnabled ?? false);
    const res = await fetch(apiUrl('/api/live/connect'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'toggle_bots', enabled: next, gameSlug: game.slug }),
    });
    const data = await res.json();
    if (data.state) setSessionState(data.state);
    postToChannel({ type: 'toggle_bots', enabled: next });
  };

  const fireControl = async (action: string) => {
    setControlTrigger({ action, ts: Date.now() });
    postToChannel({
      event: { id: `bc-${Date.now()}`, type: 'control', timestamp: Date.now(), username: 'Streamer', controlAction: action },
    });
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'control', action }),
    }).catch(() => {});
  };

  const sendTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMsg.trim()) return;
    const msg = testMsg.trim();
    setTestMsg('');
    const ev = { id: `test-${Date.now()}`, type: 'chat', timestamp: Date.now(), username: 'streamer_test', message: msg };
    postToChannel({ event: ev });
    const res = await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'chat', username: 'streamer_test', message: msg }),
    }).catch(() => null);
    if (res) {
      const data = await res.json().catch(() => null);
      if (data?.event) postToChannel({ event: data.event });
    }
  };

  const triggerGift = async (giftName: string, coins: number, giftEmoji: string) => {
    const ev = { id: `gift-${Date.now()}`, type: 'gift', timestamp: Date.now(), username: 'fan_top', giftName, coins, giftEmoji };
    postToChannel({ event: ev });
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'gift', username: 'fan_top', giftName, coins, giftEmoji }),
    }).catch(() => {});
  };

  const triggerLike = async (likeCount = 50) => {
    const ev = { id: `like-${Date.now()}`, type: 'like', timestamp: Date.now(), username: 'fan_top', likeCount };
    postToChannel({ event: ev });
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, type: 'like', username: 'fan_top', likeCount }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Панель управления игрой</div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {game.emoji} {game.title}
          </h1>
        </div>
        <select
          value={game.slug}
          onChange={(e) => {
            window.location.href = `/${lang}/dashboard/games/${e.target.value}`;
          }}
          className="rounded-2xl border border-white/15 bg-[#120E24] px-4 py-2.5 text-sm font-bold text-white outline-none"
        >
          {GAMES.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.emoji} {g.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 shadow-soft backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">1. Подключите чат TikTok LIVE</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  sessionState?.connectionStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/10 text-[#94A3B8]'
                }`}
              >
                <Wifi className="h-3 w-3" />
                {sessionState?.connectionStatus === 'connected' ? `@${sessionState.tiktokUsername}` : 'Оффлайн'}
              </span>
            </div>
            <form onSubmit={connectTikTok} className="mt-3 flex gap-2">
              <input
                value={tiktokNick}
                onChange={(e) => setTiktokNick(e.target.value)}
                placeholder="@ваш_ник_в_tiktok"
                className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={connecting}
                className="rounded-xl bg-[#7C3AED] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#6D28D9]"
              >
                {connecting ? '...' : 'Подключить'}
              </button>
            </form>
            {sessionState?.connectionError && (
              <p className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-2.5 text-xs text-rose-300">{sessionState.connectionError}</p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleBots}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
                  sessionState?.botsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-200'
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                {sessionState?.botsEnabled ? 'Тест-боты чата: ВКЛ' : 'Включить тест-ботов чата'}
              </button>
              <Link href={`/${lang}/dashboard/gifts`} className="text-xs font-bold text-violet-400 hover:underline">
                Настроить подарки →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 shadow-soft backdrop-blur-md">
            <div className="text-sm font-bold text-white">2. Ссылка на игру (1080×1920)</div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <input
                readOnly
                value={fullUrl}
                className="min-w-[200px] flex-1 rounded-xl border border-white/15 bg-[#080612] px-3 py-2 font-mono text-xs text-slate-200"
              />
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/[0.12]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <Link
                href={playPath}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-card"
              >
                <span>Открыть игру</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setSetupTab('phone')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                  setupTab === 'phone' ? 'bg-[#7C3AED]/25 text-violet-200' : 'text-[#94A3B8]'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Телефон (Mobile Gaming)
              </button>
              <button
                type="button"
                onClick={() => setSetupTab('obs')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                  setupTab === 'obs' ? 'bg-[#7C3AED]/25 text-violet-200' : 'text-[#94A3B8]'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> OBS / TikTok LIVE Studio
              </button>
            </div>

            {setupTab === 'phone' ? (
              <div className="mt-3 space-y-1.5 text-xs leading-relaxed text-[#94A3B8]">
                <p>1. Нажмите <strong className="text-white">«Открыть игру»</strong> прямо в браузере телефона и выберите «На экран Домой» (PWA-приложение).</p>
                <p>2. В приложении TikTok запустите стрим в режиме <strong className="text-white">«Мобильные игры» (Mobile Gaming)</strong>.</p>
                <p>3. На экране игры всегда есть кнопка <strong className="text-white">«Пульт / TikTok»</strong> — сверните её в 1 тап перед показом.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-1.5 text-xs leading-relaxed text-[#94A3B8]">
                <p>1. В OBS Studio или TikTok LIVE Studio добавьте источник <strong className="text-white">«Браузер» (Browser)</strong>.</p>
                <p>2. Вставьте скопированную ссылку и <strong className="text-white">обязательно задайте ширину 1080 и высоту 1920</strong> (по умолчанию в OBS стоит 800×600, и игра не помещается).</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 shadow-soft backdrop-blur-md">
            <div className="text-sm font-bold text-white">3. Кнопки управления игрой</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {game.controls.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => fireControl(btn.id)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    btn.variant === 'primary'
                      ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                      : btn.variant === 'danger'
                      ? 'border border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                      : 'border border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.12]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="text-xs font-bold text-[#94A3B8]">Проверить подарки и чат:</div>
              <form onSubmit={sendTestChat} className="mt-2 flex gap-2">
                <input
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  placeholder="Тестовое сообщение в игру..."
                  className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3 py-2 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
                />
                <button type="submit" className="inline-flex items-center gap-1 rounded-xl bg-[#7C3AED] px-3.5 py-2 text-xs font-bold text-white">
                  <Send className="h-3.5 w-3.5" /> Тест
                </button>
              </form>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {game.gifts.map((gf, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => triggerGift(gf.giftName, gf.coins, gf.emoji)}
                    className="inline-flex items-center gap-1 rounded-xl border border-violet-500/30 bg-[#7C3AED]/15 px-3 py-1.5 text-xs font-bold text-violet-200 hover:bg-[#7C3AED]/25"
                  >
                    <Gift className="h-3 w-3" /> {gf.emoji} {gf.giftName}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => triggerLike(50)}
                  className="inline-flex items-center gap-1 rounded-xl border border-pink-500/30 bg-pink-500/15 px-3 py-1.5 text-xs font-bold text-pink-200 hover:bg-pink-500/25"
                >
                  <Heart className="h-3 w-3" /> +50 Лайков
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center lg:col-span-5">
          <div className="mb-2 text-xs font-bold text-[#94A3B8]">Живой предпросмотр (9:16 · 1080×1920)</div>
          <div className="h-[620px] w-[320px] overflow-hidden rounded-[2.75rem] border-[7px] border-white/15 bg-[#05040B] p-1 shadow-[0_0_50px_rgba(124,58,237,0.3)]">
            <div className="h-full w-full overflow-hidden rounded-[2.1rem]">
              <GameScreen slug={game.slug} token={token} mode="preview" externalControl={controlTrigger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

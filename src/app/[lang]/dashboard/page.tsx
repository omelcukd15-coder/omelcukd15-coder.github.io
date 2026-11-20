'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wifi, Play, ArrowRight, Bot, Smartphone, Monitor } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';
import { SessionState } from '@/lib/server/liveHub';
import { apiUrl } from '@/lib/api';

export default function DashboardOverviewPage({ params }: { params: { lang: Lang } }) {
  const token = 'streamer-demo';
  const [tiktokNick, setTiktokNick] = useState('');
  const [state, setState] = useState<SessionState | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vp_tiktok_nick');
      if (saved) setTiktokNick(saved);
    } catch {
      // ignore
    }
    fetch(apiUrl(`/api/live/stream?token=${token}&mode=json`))
      .then((r) => r.json())
      .then((d) => {
        if (d.state) setState(d.state);
      })
      .catch(() => {});
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      localStorage.setItem('vp_tiktok_nick', tiktokNick);
      const res = await fetch(apiUrl('/api/live/connect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'connect', username: tiktokNick }),
      });
      const data = await res.json();
      if (data.state) setState(data.state);
    } finally {
      setConnecting(false);
    }
  };

  const toggleBots = async () => {
    const next = !(state?.botsEnabled ?? false);
    const res = await fetch(apiUrl('/api/live/connect'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'toggle_bots', enabled: next }),
    });
    const data = await res.json();
    if (data.state) setState(data.state);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          Кабинет стримера
        </h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Подключите ваш TikTok LIVE, выберите игру и откройте экран 1080×1920 в OBS или на телефоне.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 shadow-soft backdrop-blur-md lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Быстрое подключение TikTok LIVE</h2>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                state?.connectionStatus === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 text-[#94A3B8]'
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              {state?.connectionStatus === 'connected' ? `LIVE @${state.tiktokUsername}` : 'Ожидание'}
            </span>
          </div>

          <form onSubmit={handleConnect} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <input
              value={tiktokNick}
              onChange={(e) => setTiktokNick(e.target.value)}
              placeholder="@ваш_ник_tiktok"
              className="flex-1 rounded-2xl border border-white/15 bg-[#080612] px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={connecting}
              className="rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-[#6D28D9] disabled:opacity-60"
            >
              {connecting ? 'Подключаемся...' : 'Подключить чат'}
            </button>
          </form>

          {state?.connectionError && (
            <p className="mt-2.5 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs font-medium text-rose-300">
              {state.connectionError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleBots}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold ${
                state?.botsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-200'
              }`}
            >
              <Bot className="h-4 w-4" />
              {state?.botsEnabled ? 'Тестовый чат (боты): ВКЛ' : 'Включить тестовый чат (боты)'}
            </button>
            <span className="text-xs text-[#94A3B8]">
              Сообщений: <strong className="text-white">{state?.totalMessages ?? 0}</strong> · Подарков:{' '}
              <strong className="text-white">{state?.totalGifts ?? 0}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-violet-400/30 bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-fuchsia-600 p-6 text-white shadow-glow lg:col-span-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/80">Режим телефонного приложения</div>
            <h2 className="mt-1 font-display text-xl font-extrabold">Стримьте прямо со смартфона</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/90">
              Откройте экран 9:16 на весь телефон, включите Mobile Gaming в TikTok LIVE и управляйте игрой в один тап.
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            <Link
              href="/play/streamer-demo/contexto"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-xs font-extrabold text-[#5B21B6]"
            >
              <Smartphone className="h-4 w-4" /> Запустить на телефоне
            </Link>
            <Link
              href={`/${params.lang}/dashboard/games/contexto`}
              className="inline-flex items-center justify-center gap-1 rounded-2xl bg-white/15 px-4 py-3 text-xs font-bold text-white backdrop-blur-sm"
            >
              <Monitor className="h-4 w-4" /> OBS
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-extrabold text-white">Все 17 игр — выберите для эфира</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/${params.lang}/dashboard/games/${g.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#120E24]/80 p-4 backdrop-blur-md transition hover:border-violet-400/50 hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${g.accentGradient} text-2xl text-white`}>
                  {g.emoji}
                </span>
                <div>
                  <div className="font-display text-sm font-bold text-white group-hover:text-violet-300">
                    {g.title}
                  </div>
                  <div className="line-clamp-1 max-w-[180px] text-xs text-[#94A3B8]">{g.shortRule}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-violet-300" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 backdrop-blur-md">
        <h2 className="font-display text-lg font-bold text-white">Последние эфиры</h2>
        <div className="mt-4 space-y-2.5 text-sm">
          {[
            { date: 'Сегодня, 21:10', game: 'Контекстно', viewers: 340, msgs: 1840 },
            { date: 'Вчера, 19:45', game: 'Битва шаров', viewers: 520, msgs: 3190 },
          ].map((row, idx) => (
            <div key={idx} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Play className="h-4 w-4 text-violet-400" />
                <span className="font-bold text-white">{row.game}</span>
                <span className="text-xs text-[#94A3B8]">{row.date}</span>
              </div>
              <div className="text-xs font-semibold text-[#94A3B8]">
                Пик: {row.viewers} зрителей · {row.msgs} сообщений
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

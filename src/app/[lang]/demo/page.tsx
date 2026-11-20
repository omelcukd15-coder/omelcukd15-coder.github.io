'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Gift, Bot, Wifi, ArrowLeft } from 'lucide-react';
import { GAMES, getGameBySlug } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';
import { GameScreen } from '@/components/game-engine/GameScreen';
import { apiUrl } from '@/lib/api';

export default function DemoStreamPage({ params }: { params: { lang: Lang } }) {
  const [slug, setSlug] = useState('contexto');
  const [viewerName, setViewerName] = useState('pro_zritel');
  const [message, setMessage] = useState('');
  const [botsOn, setBotsOn] = useState(true);
  const demoToken = 'demo-live-room';
  const activeGame = getGameBySlug(slug);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const msg = message.trim();
    setMessage('');
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: demoToken, type: 'chat', username: viewerName, message: msg }),
    });
  };

  const sendGift = async (giftName: string, coins: number, giftEmoji: string) => {
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: demoToken, type: 'gift', username: viewerName, giftName, coins, giftEmoji }),
    });
  };

  const toggleBots = async () => {
    const next = !botsOn;
    setBotsOn(next);
    await fetch(apiUrl('/api/live/connect'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: demoToken, action: 'toggle_bots', enabled: next, gameSlug: slug }),
    });
  };

  const switchGame = async (newSlug: string) => {
    setSlug(newSlug);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: demoToken, type: 'control', action: 'set_game', payload: { slug: newSlug } }),
    });
  };

  return (
    <div className="min-h-screen bg-[#080612] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/${params.lang}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/[0.12]"
            >
              <ArrowLeft className="h-4 w-4" /> На главную
            </Link>
            <h1 className="font-display text-xl font-extrabold text-white sm:text-2xl">
              Демо-эфир: играйте как зритель
            </h1>
          </div>
          <Link
            href={`/${params.lang}/dashboard/games/${slug}`}
            className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-glow"
          >
            Запустить у себя на стриме →
          </Link>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="flex justify-center lg:col-span-5">
            <div className="h-[680px] w-[350px] overflow-hidden rounded-[2.85rem] border-[7px] border-white/15 bg-[#05040B] p-1 shadow-[0_0_60px_rgba(124,58,237,0.3)]">
              <div className="h-full w-full overflow-hidden rounded-[2.2rem]">
                <GameScreen slug={slug} token={demoToken} mode="preview" initialBots />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 shadow-soft backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    {activeGame.emoji} {activeGame.title}
                  </h2>
                  <p className="text-xs text-[#94A3B8]">{activeGame.shortRule}</p>
                </div>
                <button
                  type="button"
                  onClick={toggleBots}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${
                    botsOn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  <Bot className="h-4 w-4" />
                  <span>{botsOn ? 'Боты чата: ВКЛ' : 'Боты чата: ВЫКЛ'}</span>
                </button>
              </div>

              <form onSubmit={sendMessage} className="mt-5 space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    value={viewerName}
                    onChange={(e) => setViewerName(e.target.value)}
                    placeholder="Ваш ник"
                    className="rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-violet-500"
                  />
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Напишите как зритель..."
                    className="sm:col-span-2 rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-3 text-sm font-bold text-white shadow-card transition hover:bg-[#6D28D9]"
                >
                  <Send className="h-4 w-4" />
                  <span>Отправить в чат эфира</span>
                </button>
              </form>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-2 text-xs font-bold text-[#94A3B8]">Имитация подарков TikTok:</div>
                <div className="flex flex-wrap gap-2">
                  {activeGame.gifts.map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendGift(g.giftName, g.coins, g.emoji)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white hover:border-violet-400 hover:bg-[#7C3AED]/25"
                    >
                      <Gift className="h-3.5 w-3.5 text-violet-300" />
                      <span>{g.emoji} {g.giftName} ({g.coins} мон.)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 shadow-soft backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white">Переключить игру (17 штук)</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <Wifi className="h-3.5 w-3.5" /> Мгновенная смена
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GAMES.map((g) => (
                  <button
                    key={g.slug}
                    type="button"
                    onClick={() => switchGame(g.slug)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                      slug === g.slug
                        ? 'border-violet-400 bg-[#7C3AED]/25 text-white'
                        : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{g.emoji}</span>
                    <span className="truncate">{g.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

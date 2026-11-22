'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Sparkles,
  ChevronDown,
  ArrowRight,
  MonitorSmartphone,
  Cpu,
  Globe2,
  Zap,
  Send,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { GAMES, LIVE_SHOWCASE_STREAMS } from '@/lib/games-data';
import { Lang, getDictionary } from '@/lib/i18n';
import { GameScreen } from '@/components/game-engine/GameScreen';
import { apiUrl } from '@/lib/api';

const DEMO_SWITCH_SLUGS = ['contexto', 'flag-quiz', 'word-reveal', 'secret-word', 'doodle-guess'];

const STREAMER_AVATARS = [
  { name: '@denis_streams', emoji: '🧑‍🚀', tag: '1.4K онлайн' },
  { name: '@alina_quiz', emoji: '🦊', tag: '890 онлайн' },
  { name: '@geo_master', emoji: '🌍', tag: '640 онлайн' },
  { name: '@ege_100_live', emoji: '🎓', tag: '510 онлайн' },
  { name: '@arena_turk', emoji: '⚔️', tag: '775 онлайн' },
  { name: '@indo_play', emoji: '🐍', tag: '430 онлайн' },
  { name: '@misha_word', emoji: '🔤', tag: '1.1K онлайн' },
  { name: '@kate_draw', emoji: '✏️', tag: '950 онлайн' },
];

const FAQ_ITEMS = [
  {
    q: 'Нужно ли скачивать программу на компьютер или телефон?',
    a: 'Нет. Вся логика работает на сервере платформы. Для ПК вы просто вставляете ссылку 1080×1920 в OBS / TikTok LIVE Studio (источник «Браузер»). Для телефона — открываете игровой экран прямо в мобильном браузере или устанавливаете на рабочий стол как веб-приложение.',
  },
  {
    q: 'Как зрители играют в игры?',
    a: 'Зрители пишут слова, цифры (1–4) или сообщения прямо в стандартный чат TikTok LIVE, а также отправляют подарки. Платформа считывает чат в реальном времени и переносит ходы на экран.',
  },
  {
    q: 'Почему игры в чате поднимают стрим в рекомендации?',
    a: 'Алгоритмы TikTok LIVE оценивают скорость сообщений, лайки и удержание зрителей. Когда в чате каждую секунду летят ответы, эфир получает мощный органический буст.',
  },
  {
    q: 'Какой размер источника «Браузер» ставить в OBS?',
    a: 'Обязательно 1080×1920 (вертикальный Full HD). По умолчанию в OBS стоит 800×600, из-за чего игра обрезается. У нас также встроена сетка безопасных зон TikTok.',
  },
];

export function HomeClient({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [demoSlug, setDemoSlug] = useState('contexto');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatText, setChatText] = useState('');
  const demoToken = 'home-preview';

  const handleQuickChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const msg = chatText.trim();
    setChatText('');
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: demoToken, type: 'chat', username: 'vy_zritel', message: msg }),
    });
  };

  const handleQuickGift = async (giftName: string, coins: number, giftEmoji: string) => {
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: demoToken, type: 'gift', username: 'vy_zritel', giftName, coins, giftEmoji }),
    });
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO */}
      <section className="relative overflow-hidden pt-12 sm:pt-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-[#7C3AED]/25 blur-[110px]" />
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-[#7C3AED]/15 px-4 py-1.5 text-xs font-bold text-violet-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span>{dict.hero.badge}</span>
          </div>
          <h1 className="mt-6 bg-gradient-to-b from-white via-white to-slate-300 bg-clip-text font-display text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl sm:leading-[1.1]">
            {dict.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
            {dict.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={`/${lang}/dashboard/games/contexto`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-fuchsia-600 to-violet-600 px-7 py-4 text-base font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{dict.hero.ctaPrimary}</span>
            </Link>
            <Link
              href={`/${lang}/demo`}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-4 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/[0.12]"
            >
              <span>📱 {dict.hero.ctaDemo}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. MARQUEE OF STREAMER AVATARS */}
      <section className="overflow-hidden border-y border-white/10 bg-white/[0.02] py-4 backdrop-blur-sm">
        <div className="animate-marquee flex gap-4">
          {[...STREAMER_AVATARS, ...STREAMER_AVATARS].map((s, idx) => (
            <div
              key={idx}
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#120E24]/90 px-4 py-2 shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED]/25 text-lg">
                {s.emoji}
              </span>
              <div>
                <div className="text-xs font-extrabold text-white">{s.name}</div>
                <div className="text-[11px] font-semibold text-emerald-400">● {s.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LIVE INTERACTIVE DEMO IN PHONE FRAME */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-center lg:col-span-6">
            <div className="relative h-[640px] w-[328px] overflow-hidden rounded-[2.85rem] border-[7px] border-white/15 bg-[#05040B] p-1 shadow-[0_0_60px_rgba(124,58,237,0.3)]">
              <div className="mx-auto mt-1.5 mb-1 h-4 w-24 rounded-full bg-black/90 ring-1 ring-white/10" />
              <div className="h-[calc(100%-26px)] w-full overflow-hidden rounded-[2.2rem]">
                <GameScreen slug={demoSlug} token={demoToken} mode="preview" initialBots />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                Живое интерактивное превью
              </span>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-white">
                Попробуйте прямо в рамке телефона
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                Боты уже пишут в чат, а вы можете сами отправить слово, число или подарок ниже — игра отреагирует мгновенно.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {DEMO_SWITCH_SLUGS.map((s) => {
                const g = GAMES.find((item) => item.slug === s)!;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setDemoSlug(s);
                      fetch(apiUrl('/api/live/event'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: demoToken, type: 'control', action: 'set_game', payload: { slug: s } }),
                      }).catch(() => {});
                    }}
                    className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                      demoSlug === s
                        ? 'bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 text-white shadow-glow'
                        : 'border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.1]'
                    }`}
                  >
                    {g.emoji} {g.title}
                  </button>
                );
              })}
              <Link
                href={`/${lang}/games`}
                className="rounded-2xl border border-violet-400/30 bg-[#7C3AED]/15 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-[#7C3AED]/25"
              >
                Все 17 игр →
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 shadow-soft backdrop-blur-md">
              <div className="text-xs font-bold text-[#94A3B8]">Сыграйте за зрителя прямо сейчас:</div>
              <form onSubmit={handleQuickChat} className="mt-2.5 flex gap-2">
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Например: ракета, бразилия, 1..."
                  className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#6D28D9]"
                >
                  <Send className="h-4 w-4" />
                  <span>Отправить</span>
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickGift('Роза', 1, '🌹')}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25"
                >
                  <Gift className="h-3.5 w-3.5" /> 🌹 Подсказка (1 мон.)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickGift('Сердце', 5, '🫰')}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25"
                >
                  🫰 Буква / x2 (5 мон.)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickGift('Пончик', 30, '🍩')}
                  className="inline-flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-500/25"
                >
                  🍩 Скип / Буст (30 мон.)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM BADGES */}
      <section className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[#120E24]/80 px-6 py-4 backdrop-blur-md">
          <span className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-xs font-extrabold text-cyan-200">
            🎵 TikTok LIVE · Активно сейчас
          </span>
          <span className="rounded-xl border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-xs font-bold text-purple-300">
            🟣 Twitch · Плагин скоро
          </span>
          <span className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-300">
            🔴 YouTube Live · Плагин скоро
          </span>
        </div>
      </section>

      {/* 5. 3 STEPS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-white">
          {dict.howItWorks.title}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dict.howItWorks.steps.map((st, idx) => (
            <div key={idx} className="rounded-3xl border border-white/10 bg-[#120E24]/80 p-7 shadow-card backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-fuchsia-600 font-display text-lg font-extrabold text-white shadow-glow">
                {idx + 1}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{st.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LIVE STREAMS CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-white">Сейчас в эфире</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">Стримеры, которые прямо сейчас играют с чатом</p>
          </div>
          <Link href={`/${lang}/streams`} className="text-sm font-bold text-violet-400 hover:underline">
            Все эфиры →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_SHOWCASE_STREAMS.slice(0, 3).map((st) => (
            <div key={st.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#120E24]/80 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-2xl">
                  {st.avatar}
                </span>
                <div>
                  <div className="font-bold text-white">{st.streamer}</div>
                  <div className="text-xs text-[#94A3B8]">{st.gameTitle} · 👁️ {st.viewers}</div>
                </div>
              </div>
              <a
                href={st.tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#7C3AED]"
              >
                TikTok <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-violet-400/30 bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-fuchsia-600 p-8 text-white shadow-glow md:flex-row md:p-12">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Запустите игру на следующем стриме
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
              Работает как мобильное веб-приложение на телефоне и как источник «Браузер» 1080×1920 в OBS.
            </p>
          </div>
          <Link
            href={`/${lang}/dashboard`}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-extrabold text-[#5B21B6] shadow-lg transition hover:scale-105"
          >
            <span>Открыть кабинет</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 8. ALL 17 GAMES GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-white">Каталог из 17 игр</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">Угадайки, арены, голосования, слова и образовательные форматы</p>
          </div>
          <Link href={`/${lang}/games`} className="text-sm font-bold text-violet-400 hover:underline">
            Фильтры и поиск →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {GAMES.map((g) => (
            <div
              key={g.slug}
              className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 shadow-soft backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-card"
            >
              <div>
                <div className={`flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br ${g.accentGradient} text-5xl text-white shadow-inner`}>
                  {g.emoji}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white">{g.title}</h3>
                  {g.isNew && (
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300">
                      NEW
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">{g.shortRule}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/${lang}/games/${g.slug}`}
                  className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] py-2 text-center text-xs font-bold text-slate-200 transition hover:bg-white/[0.1]"
                >
                  {dict.common.details}
                </Link>
                <Link
                  href={`/play/live/${g.slug}`}
                  className="rounded-xl bg-[#7C3AED] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#6D28D9]"
                >
                  Играть
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-white">
          {dict.benefits.title}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.benefits.items.map((item, idx) => {
            const Icons = [MonitorSmartphone, Cpu, Globe2, Zap];
            const Icon = Icons[idx % Icons.length];
            return (
              <div key={idx} className="rounded-3xl border border-white/10 bg-[#120E24]/80 p-6 backdrop-blur-md">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-violet-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold text-white">Частые вопросы</h2>
        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-white/10 bg-[#120E24]/85 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left font-bold text-white"
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-5 w-5 text-violet-400 transition ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="border-t border-white/10 px-5 pb-5 pt-3 text-sm leading-relaxed text-[#94A3B8]">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

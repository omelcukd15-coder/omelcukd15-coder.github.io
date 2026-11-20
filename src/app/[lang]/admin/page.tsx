'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { ARTICLES, GAMES } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';

export default function AdminPage({ params }: { params: { lang: Lang } }) {
  const [tab, setTab] = useState<'users' | 'games' | 'complaints' | 'articles'>('users');
  const [complaints, setComplaints] = useState([
    { id: 'c1', reporter: '@alina_quiz', target: '@spam_bot_01', reason: 'Флуд ссылками в чате', status: 'OPEN' },
    { id: 'c2', reporter: '@denis_streams', target: '@toxic_viewer', reason: 'Оскорбления в угадайке', status: 'RESOLVED' },
  ]);

  return (
    <div className="min-h-screen bg-[#080612] text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7C3AED] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-white">Панель администратора</h1>
              <p className="text-xs text-[#94A3B8]">Пользователи, игры, контент, жалобы и статьи</p>
            </div>
          </div>
          <Link
            href={`/${params.lang}/dashboard`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#120E24]/85 text-white px-4 py-2 text-xs font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" /> В кабинет
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            { id: 'users', label: 'Пользователи' },
            { id: 'games', label: `Игры (${GAMES.length})` },
            { id: 'complaints', label: `Жалобы (${complaints.length})` },
            { id: 'articles', label: `Статьи (${ARTICLES.length})` },
          ] as const).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold ${
                tab === t.id ? 'bg-[#7C3AED] text-white' : 'border border-white/10 bg-[#120E24]/85 text-white text-[#94A3B8]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
          {tab === 'users' && (
            <div className="space-y-3 text-sm">
              {[
                { name: '@denis_streams', email: 'denis@example.com', role: 'STREAMER', streams: 42 },
                { name: '@alina_quiz', email: 'alina@example.com', role: 'STREAMER', streams: 29 },
                { name: 'admin@vibeplay.live', email: 'admin@vibeplay.live', role: 'ADMIN', streams: 12 },
              ].map((u, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3">
                  <div>
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-xs text-[#94A3B8]">{u.email}</div>
                  </div>
                  <span className="rounded-xl bg-[#7C3AED]/20 px-3 py-1 text-xs font-bold text-violet-300">
                    {u.role} · {u.streams} эфиров
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'games' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GAMES.map((g) => (
                <div key={g.slug} className="flex items-center justify-between rounded-2xl bg-white/[0.05] p-3.5 text-sm">
                  <span className="font-bold">{g.emoji} {g.title}</span>
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Активна</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'complaints' && (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/[0.05] p-4 text-sm">
                  <div>
                    <div className="font-bold text-white">{c.reporter} → {c.target}</div>
                    <div className="text-xs text-[#94A3B8]">{c.reason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setComplaints((prev) =>
                        prev.map((item) =>
                          item.id === c.id ? { ...item, status: item.status === 'OPEN' ? 'RESOLVED' : 'OPEN' } : item
                        )
                      )
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                      c.status === 'OPEN' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {c.status}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'articles' && (
            <div className="space-y-3">
              {ARTICLES.map((a) => (
                <div key={a.slug} className="flex items-center justify-between rounded-2xl bg-white/[0.05] p-4 text-sm">
                  <div>
                    <div className="font-bold text-white">{a.title}</div>
                    <div className="text-xs text-[#94A3B8]">{a.author} · {a.date}</div>
                  </div>
                  <Link href={`/${params.lang}/articles/${a.slug}`} className="text-xs font-bold text-violet-300 hover:underline">
                    Открыть
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

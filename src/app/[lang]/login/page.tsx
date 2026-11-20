'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Mail, Lock, Sparkles } from 'lucide-react';
import { Lang } from '@/lib/i18n';

export default function LoginPage({ params }: { params: { lang: Lang } }) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('streamer@vibeplay.live');
  const [tiktok, setTiktok] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const completeAuth = (userEmail: string, tiktokHandle?: string) => {
    const token = 'streamer-demo';
    try {
      localStorage.setItem(
        'vp_user',
        JSON.stringify({
          email: userEmail,
          tiktokUsername: tiktokHandle || '',
          token,
        })
      );
      if (tiktokHandle) {
        localStorage.setItem('vp_tiktok_nick', tiktokHandle);
      }
    } catch {
      // ignore storage errors
    }
    router.push(`/${params.lang}/dashboard`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'reset') {
      setNotice(`Письмо для восстановления отправлено на ${email}`);
      return;
    }
    completeAuth(email, tiktok);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080612] px-4 py-12 text-white">
      <Link href={`/${params.lang}`} className="mb-6 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-fuchsia-500 text-white shadow-glow">
          <Play className="h-5 w-5 fill-current" />
        </span>
        <span className="font-display text-xl font-bold text-white">
          VibePlay <span className="text-violet-400">LIVE</span>
        </span>
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#120E24]/90 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex rounded-2xl bg-white/[0.06] p-1">
          {(['login', 'register', 'reset'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setNotice(null);
              }}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                tab === t ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#94A3B8]'
              }`}
            >
              {t === 'login' ? 'Вход' : t === 'register' ? 'Регистрация' : 'Пароль'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#080612] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {tab !== 'reset' && (
            <div>
              <label className="text-xs font-bold text-[#94A3B8]">Пароль</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  defaultValue="12345678"
                  className="w-full rounded-xl border border-white/15 bg-[#080612] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="text-xs font-bold text-[#94A3B8]">Ник TikTok (необязательно)</label>
              <input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@your_tiktok"
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
          )}

          {notice && <div className="rounded-xl bg-emerald-500/20 p-3 text-xs font-bold text-emerald-300">{notice}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
          >
            {tab === 'login' ? 'Войти в кабинет' : tab === 'register' ? 'Создать аккаунт' : 'Восстановить доступ'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>или быстрый вход</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => completeAuth('google-user@vibeplay.live')}
            className="rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-xs font-bold text-white hover:bg-white/[0.1]"
          >
            Google OAuth
          </button>
          <button
            type="button"
            onClick={() => completeAuth('tiktok-user@vibeplay.live')}
            className="rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-xs font-bold text-white hover:bg-white/[0.1]"
          >
            TikTok OAuth
          </button>
        </div>

        <button
          type="button"
          onClick={() => completeAuth('demo@vibeplay.live')}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-400/30 bg-[#7C3AED]/20 py-2.5 text-xs font-extrabold text-violet-200 hover:bg-[#7C3AED]/30"
        >
          <Sparkles className="h-3.5 w-3.5" /> Войти в 1 клик (Демо-стример)
        </button>
      </div>
    </div>
  );
}

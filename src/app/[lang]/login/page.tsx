'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Mail, Lock, Sparkles, AtSign } from 'lucide-react';
import { Lang } from '@/lib/i18n';
import { getOrCreateStreamerProfile, normalizeNick, saveStreamerProfile } from '@/lib/streamerSession';

export default function LoginPage({ params }: { params: { lang: Lang } }) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const profile = getOrCreateStreamerProfile();
    if (profile.email) setEmail(profile.email);
    if (profile.tiktokUsername) setTiktok(profile.tiktokUsername);
  }, []);

  const completeAuth = (userEmail: string, tiktokHandle?: string) => {
    const cleanNick = normalizeNick(tiktokHandle || '');
    const current = getOrCreateStreamerProfile();
    saveStreamerProfile({
      token: current.token,
      email: userEmail.trim() || current.email,
      tiktokUsername: cleanNick || current.tiktokUsername,
      displayName: cleanNick ? `@${cleanNick}` : userEmail.trim() || current.displayName || 'Стример',
    });
    router.push(`/${params.lang}/dashboard`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'reset') {
      setNotice(`Инструкция по восстановлению отправлена на ${email}`);
      return;
    }
    completeAuth(email, tiktok);
  };

  const handleQuickStartByNick = () => {
    const cleanNick = normalizeNick(tiktok);
    if (!cleanNick) {
      setNotice('Введите ваш @ник в TikTok для создания персональной комнаты эфира.');
      return;
    }
    completeAuth(email, cleanNick);
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
            <label className="text-xs font-bold text-[#94A3B8]">Ник TikTok LIVE</label>
            <div className="relative mt-1">
              <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@ваш_ник_tiktok"
                className="w-full rounded-xl border border-white/15 bg-[#080612] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-[#080612] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
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
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-[#080612] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {notice && <div className="rounded-xl bg-amber-500/20 p-3 text-xs font-bold text-amber-200">{notice}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-glow transition hover:opacity-95"
          >
            {tab === 'login' ? 'Войти в кабинет' : tab === 'register' ? 'Создать аккаунт и комнату' : 'Восстановить доступ'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>или быстрый запуск эфира</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleQuickStartByNick}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-400/30 bg-[#7C3AED]/20 py-3 text-xs font-extrabold text-violet-200 hover:bg-[#7C3AED]/30"
        >
          <Sparkles className="h-3.5 w-3.5" /> Открыть рабочий кабинет по нику TikTok
        </button>
      </div>
    </div>
  );
}

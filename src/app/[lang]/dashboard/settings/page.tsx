'use client';

import React, { useEffect, useState } from 'react';
import { Check, Copy, Globe, KeyRound, Webhook } from 'lucide-react';
import { Lang, LANG_LABELS, SUPPORTED_LANGS } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { getOrCreateStreamerProfile, saveStreamerProfile } from '@/lib/streamerSession';

export default function SettingsPage({ params }: { params: { lang: Lang } }) {
  const router = useRouter();
  const [roomToken, setRoomToken] = useState('live');
  const [tiktok, setTiktok] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    const profile = getOrCreateStreamerProfile();
    setRoomToken(profile.token);
    setTiktok(profile.tiktokUsername);
    setDisplayName(profile.displayName);
    setEmail(profile.email);
    try {
      setWebhookUrl(localStorage.getItem('vp_webhook_url') || '');
    } catch {
      // ignore
    }
  }, []);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(roomToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 1800);
    } catch {
      // ignore
    }
  };

  const saveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveStreamerProfile({
      tiktokUsername: tiktok,
      displayName,
      email,
    });
    setRoomToken(updated.token);
    setTiktok(updated.tiktokUsername);
    setDisplayName(updated.displayName);
    setEmail(updated.email);
    try {
      if (webhookUrl.trim()) {
        localStorage.setItem('vp_webhook_url', webhookUrl.trim());
      } else {
        localStorage.removeItem('vp_webhook_url');
      }
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Настройки профиля и платформ</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Уникальный токен комнаты, ник TikTok, язык интерфейса и Webhooks.</p>
      </div>

      <form onSubmit={saveAll} className="max-w-2xl space-y-5 rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
            <KeyRound className="h-3.5 w-3.5 text-violet-300" /> Персональный токен комнаты (Room ID)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              readOnly
              value={roomToken}
              className="flex-1 rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 font-mono text-xs font-bold text-violet-300 outline-none"
            />
            <button
              type="button"
              onClick={copyToken}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
            >
              {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedToken ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>
          <p className="mt-1 text-[11px] text-[#94A3B8]">
            Этот идентификатор автоматически подставляется во все ваши ссылки для OBS и телефона (`?room={roomToken}`).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Ник TikTok</label>
            <input
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@your_tiktok"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Отображаемое имя</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ваш ник в кабинете"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#94A3B8]">E-mail профиля (необязательно)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="streamer@mail.ru"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-violet-400"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
            <Globe className="h-3.5 w-3.5" /> Язык кабинета
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => router.push(`/${l}/dashboard/settings`)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
                  l === params.lang
                    ? 'bg-[#7C3AED] text-white'
                    : 'border border-white/15 bg-[#080612] text-slate-200 hover:border-white/25'
                }`}
              >
                {LANG_LABELS[l].flag} {LANG_LABELS[l].label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="text-xs font-bold text-white">Адаптеры стриминг-платформ</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-300">
              🎵 TikTok LIVE · Включён
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs font-bold text-slate-400">
              🟣 Twitch · Скоро
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs font-bold text-slate-400">
              🔴 YouTube · Скоро
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
            <Webhook className="h-3.5 w-3.5" /> Webhook URL (необязательно)
          </label>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-server.com/webhooks/vibeplay"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-violet-400"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-[#6D28D9]"
        >
          {saved && <Check className="h-4 w-4" />}
          <span>{saved ? 'Настройки сохранены' : 'Сохранить настройки'}</span>
        </button>
      </form>
    </div>
  );
}

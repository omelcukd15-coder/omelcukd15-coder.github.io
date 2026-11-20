'use client';

import React, { useEffect, useState } from 'react';
import { Check, Globe, Webhook } from 'lucide-react';
import { Lang, LANG_LABELS, SUPPORTED_LANGS } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function SettingsPage({ params }: { params: { lang: Lang } }) {
  const router = useRouter();
  const [tiktok, setTiktok] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://example.com/webhooks/vibeplay');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setTiktok(localStorage.getItem('vp_tiktok_nick') || '');
    } catch {
      // ignore
    }
  }, []);

  const saveAll = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('vp_tiktok_nick', tiktok);
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
        <p className="mt-1 text-sm text-[#94A3B8]">Ник TikTok по умолчанию, язык интерфейса, адаптеры и Webhooks.</p>
      </div>

      <form onSubmit={saveAll} className="max-w-2xl space-y-5 rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
        <div>
          <label className="text-xs font-bold text-[#94A3B8]">Ник TikTok</label>
          <input
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="@your_tiktok"
            className="mt-1.5 w-full rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold"
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
                  l === params.lang ? 'bg-[#7C3AED] text-white' : 'border border-white/10 bg-[#120E24]/85 text-white'
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
              🎵 TikTok LIVE · Включён
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs font-bold text-slate-500">
              🟣 Twitch · Плагин
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs font-bold text-slate-500">
              🔴 YouTube · Плагин
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
            <Webhook className="h-3.5 w-3.5" /> Public API &amp; Webhook URL (события побед и подарков)
          </label>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 px-3.5 py-2 font-mono text-xs"
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

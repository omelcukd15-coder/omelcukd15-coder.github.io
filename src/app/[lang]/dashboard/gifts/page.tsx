'use client';

import React, { useState } from 'react';
import { Gift, Check } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { apiUrl } from '@/lib/api';

const PRESETS = [
  { id: 'light', title: 'Лёгкий', desc: 'Подсказка от 1 монеты (Роза), скип от 10 монет — максимальная активность в чате.', mult: 1 },
  { id: 'hardcore', title: 'Хардкор', desc: 'Усиленные пороги для больших комнат 500+ онлайна: бусты от 10 монет, скип от 50.', mult: 2 },
  { id: 'donate', title: 'Донатный', desc: 'Премиальные эффекты: Босс-шары, Золотые яблоки и x2 раунды от 30–100 монет.', mult: 3 },
] as const;

export default function GiftsPage() {
  const [activePreset, setActivePreset] = useState<'light' | 'hardcore' | 'donate'>('light');
  const [savedNotice, setSavedNotice] = useState(false);

  const selectPreset = async (id: 'light' | 'hardcore' | 'donate') => {
    setActivePreset(id);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'streamer-demo', type: 'control', action: 'set_gift_preset', payload: { preset: id } }),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Подарки и пресеты</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Настройте стоимость триггеров в монетах TikTok LIVE.</p>
        </div>
        {savedNotice && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Check className="h-4 w-4" /> Пресет применён
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPreset(p.id)}
            className={`rounded-3xl border p-5 text-left transition ${
              activePreset === p.id
                ? 'border-violet-400 bg-[#7C3AED]/20 shadow-card'
                : 'border-white/10 bg-[#120E24]/85 text-white hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-white">{p.title}</span>
              {activePreset === p.id && <span className="rounded-full bg-[#7C3AED] px-2.5 py-0.5 text-[10px] font-bold text-white">Активен</span>}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{p.desc}</p>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-white">Таблица триггеров по играм</h2>
        <div className="mt-4 space-y-3">
          {GAMES.slice(0, 8).map((g) => (
            <div key={g.slug} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="font-bold text-white">{g.emoji} {g.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.gifts.map((gf, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-xl bg-[#120E24]/85 text-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                    <Gift className="h-3 w-3 text-violet-300" />
                    <span>{gf.emoji} {gf.giftName}</span>
                    <span className="font-extrabold text-violet-300">
                      {gf.coins * (activePreset === 'light' ? 1 : activePreset === 'hardcore' ? 2 : 3)} мон.
                    </span>
                    <span className="text-[#94A3B8]">— {gf.effect}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

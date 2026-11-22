'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Check } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { getStreamerToken } from '@/lib/streamerSession';

const PRESETS = [
  { id: 'light', title: 'Лёгкий', desc: 'Подсказка от 1 монеты (Роза), скип от 25 монет — максимальная активность в чате.', mult: 1 },
  { id: 'hardcore', title: 'Хардкор', desc: 'Пороги x2 для средних комнат: буст от 10 монет, скип от 50 монет.', mult: 2 },
  { id: 'donate', title: 'Донатный', desc: 'Пороги x3 для крупных стримов: буст от 15 монет, скип от 75 монет.', mult: 3 },
] as const;

export default function GiftsPage() {
  const [roomToken, setRoomToken] = useState('live');
  const [activePreset, setActivePreset] = useState<'light' | 'hardcore' | 'donate'>('light');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const t = getStreamerToken();
    setRoomToken(t);
    resolveBackendOrigin().then(() => {
      fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(t)}&mode=json`))
        .then((r) => r.json())
        .then((d) => {
          if (d?.state?.giftPreset) {
            setActivePreset(d.state.giftPreset);
          }
        })
        .catch(() => {});
    });
  }, []);

  const selectPreset = async (id: 'light' | 'hardcore' | 'donate') => {
    setActivePreset(id);
    await resolveBackendOrigin();
    const res = await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: roomToken, type: 'control', action: 'set_gift_preset', payload: { preset: id } }),
    }).catch(() => null);
    if (res) {
      const data = await res.json().catch(() => null);
      if (data?.state) {
        try {
          const bc = new BroadcastChannel(`vibeplay_${roomToken}`);
          bc.postMessage({ type: 'session_state', state: data.state });
          bc.close();
        } catch {
          // ignore
        }
      }
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Подарки и пресеты</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Настройте пороги триггеров в монетах TikTok LIVE — применяются мгновенно на эфире.</p>
        </div>
        {savedNotice && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
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

      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
        <h2 className="font-display text-lg font-bold text-white">Таблица триггеров по играм</h2>
        <div className="mt-4 space-y-3">
          {GAMES.slice(0, 8).map((g) => (
            <div key={g.slug} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="font-bold text-white">{g.emoji} {g.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.gifts.map((gf, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-xl bg-[#080612]/80 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                    <Gift className="h-3 w-3 text-violet-300" />
                    <span>{gf.emoji} {gf.giftName}</span>
                    <span className="font-extrabold text-amber-300">
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

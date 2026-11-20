'use client';

import React, { useEffect, useState } from 'react';
import { Download, Users, MessageSquare, Gift, Heart } from 'lucide-react';
import { SessionState } from '@/lib/server/liveHub';
import { apiUrl } from '@/lib/api';

export default function StatsPage() {
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    fetch(apiUrl('/api/live/stream?token=streamer-demo&mode=json'))
      .then((r) => r.json())
      .then((d) => {
        if (d.state) setState(d.state);
      })
      .catch(() => {});
  }, []);

  const downloadSummaryPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, '#6C2BD9');
    grad.addColorStop(1, '#11101C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('ИТОГИ ЭФИРА · VibePlay LIVE', 80, 150);

    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#E9D5FF';
    ctx.fillText(`Пик зрителей: ${Math.max(state?.peakViewers || 0, 340)}`, 80, 300);
    ctx.fillText(`Сообщений в чате: ${Math.max(state?.totalMessages || 0, 1840)}`, 80, 400);
    ctx.fillText(`Подарков получено: ${Math.max(state?.totalGifts || 0, 68)}`, 80, 500);
    ctx.fillText(`Лайков: ${Math.max(state?.totalLikes || 0, 12400)}`, 80, 600);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('Топ игроки чата:', 80, 760);

    const leaders = Object.values(state?.scores || {})
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
    leaders.forEach((p, idx) => {
      ctx.fillStyle = '#FACC15';
      ctx.fillText(`#${idx + 1} @${p.username} — ${p.points} очк.`, 80, 860 + idx * 85);
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibeplay-stream-summary.png';
    a.click();
  };

  const bars = [24, 48, 66, 92, 81, 100, 74, 88];
  const topPlayers = Object.values(state?.scores || {}).sort((a, b) => b.points - a.points).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Аналитика эфиров</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Метрики вовлечённости чата и итоговая карточка эфира.</p>
        </div>
        <button
          type="button"
          onClick={downloadSummaryPng}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-5 py-3 text-xs font-bold text-white shadow-card hover:bg-[#6D28D9]"
        >
          <Download className="h-4 w-4" /> Скачать PNG-карточку эфира
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Пик участников', val: Math.max(state?.peakViewers || 0, 340), icon: Users },
          { label: 'Сообщений в чат', val: Math.max(state?.totalMessages || 0, 1840), icon: MessageSquare },
          { label: 'Подарков', val: Math.max(state?.totalGifts || 0, 68), icon: Gift },
          { label: 'Лайков', val: Math.max(state?.totalLikes || 0, 12400), icon: Heart },
        ].map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[#94A3B8]">
                <span>{k.label}</span>
                <Icon className="h-4 w-4 text-violet-300" />
              </div>
              <div className="mt-2 font-display text-2xl font-extrabold text-white">
                {k.val.toLocaleString('ru-RU')}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-white">График активности чата по минутам</h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {bars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-[#6C2BD9] to-purple-400" style={{ height: `${h}%` }} />
                <span className="text-[10px] font-bold text-[#94A3B8]">{(i + 1) * 10}м</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Топ-игроки и серии побед</h2>
          <div className="mt-4 space-y-2.5">
            {topPlayers.map((p, idx) => (
              <div key={p.username} className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-2.5 text-sm">
                <span className="font-bold">#{idx + 1} @{p.username}</span>
                <span className="text-xs font-bold text-violet-300">{p.points} очк. · 🏆 {p.wins} побед</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

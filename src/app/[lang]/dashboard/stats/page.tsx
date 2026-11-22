'use client';

import React, { useEffect, useState } from 'react';
import { Download, Users, MessageSquare, Coins, Heart } from 'lucide-react';
import { SessionState } from '@/lib/server/liveHub';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { getStreamerToken } from '@/lib/streamerSession';

export default function StatsPage() {
  const [state, setState] = useState<SessionState | null>(null);
  const [roomToken, setRoomToken] = useState('live');

  useEffect(() => {
    const t = getStreamerToken();
    setRoomToken(t);
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = () => {
      fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(t)}&mode=json`))
        .then((r) => r.json())
        .then((d) => {
          if (d.state) setState(d.state);
        })
        .catch(() => {});
    };

    resolveBackendOrigin().then(() => {
      load();
      timer = setInterval(load, 5000);
    });

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const topPlayers = Object.values(state?.scores || {})
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  const topCoins = Object.values(state?.coinLeaders || {})
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 5);
  const topLikes = Object.values(state?.likeLeaders || {})
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const activityBuckets = state?.minuteActivity || [];
  const maxBucket = Math.max(1, ...activityBuckets.map((b) => b.count));

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

    if (state?.tiktokUsername) {
      ctx.font = 'bold 34px sans-serif';
      ctx.fillStyle = '#A78BFA';
      ctx.fillText(`@${state.tiktokUsername}`, 80, 210);
    }

    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#E9D5FF';
    ctx.fillText(`Пик зрителей: ${state?.peakViewers ?? 0}`, 80, 300);
    ctx.fillText(`Сообщений в чате: ${state?.totalMessages ?? 0}`, 80, 390);
    ctx.fillText(`Монет получено: ${state?.totalCoins ?? 0} (${state?.totalGifts ?? 0} подарков)`, 80, 480);
    ctx.fillText(`Лайков: ${state?.totalLikes ?? 0}`, 80, 570);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('Топ по монетам:', 80, 720);

    topCoins.slice(0, 3).forEach((c, idx) => {
      ctx.fillStyle = '#FACC15';
      ctx.fillText(`#${idx + 1} @${c.username} — ${c.coins} мон.`, 80, 810 + idx * 80);
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('Топ по очкам:', 80, 1070);

    topPlayers.slice(0, 3).forEach((p, idx) => {
      ctx.fillStyle = '#67E8F9';
      ctx.fillText(`#${idx + 1} @${p.username} — ${p.points} очк.`, 80, 1160 + idx * 75);
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibeplay-stats-${roomToken}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Аналитика эфиров</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Реальные метрики вашей комнаты <span className="font-mono text-violet-300">{roomToken}</span>
            {state?.tiktokUsername ? ` · @${state.tiktokUsername}` : ''}
          </p>
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
          { label: 'Пик зрителей', val: state?.peakViewers ?? 0, icon: Users },
          { label: 'Сообщений в чат', val: state?.totalMessages ?? 0, icon: MessageSquare },
          { label: 'Монет получено', val: state?.totalCoins ?? 0, icon: Coins },
          { label: 'Лайков', val: state?.totalLikes ?? 0, icon: Heart },
        ].map((k, idx) => {
          const Icon = k.icon;
          return (
            <div key={idx} className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 text-white shadow-sm">
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
        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Активность чата по минутам</h2>
          {activityBuckets.length > 0 ? (
            <div className="mt-6 flex h-44 items-end gap-2">
              {activityBuckets.map((b, i) => {
                const hPct = Math.max(10, Math.round((b.count / maxBucket) * 100));
                return (
                  <div key={`${b.label}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-violet-200">{b.count}</span>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#6C2BD9] to-cyan-400"
                      style={{ height: `${hPct}%` }}
                    />
                    <span className="text-[10px] font-bold text-[#94A3B8]">{b.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs font-medium text-[#94A3B8]">
              График начнёт строиться автоматически, как только пойдут первые сообщения на эфире.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Топ по монетам и лайкам</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">🪙 Монеты</div>
              {topCoins.length > 0 ? (
                topCoins.map((c, idx) => (
                  <div key={c.username} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2 text-xs">
                    <span className="truncate font-bold">#{idx + 1} @{c.username}</span>
                    <span className="font-mono font-extrabold text-amber-300">{c.coins}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#94A3B8]">Пока нет донатов</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-pink-300">❤️ Лайки</div>
              {topLikes.length > 0 ? (
                topLikes.map((l, idx) => (
                  <div key={l.username} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2 text-xs">
                    <span className="truncate font-bold">#{idx + 1} @{l.username}</span>
                    <span className="font-mono font-extrabold text-pink-300">{l.likes}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#94A3B8]">Пока нет лайков</div>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-violet-300">🏆 Лидеры игр</div>
            {topPlayers.length > 0 ? (
              <div className="space-y-2">
                {topPlayers.map((p, idx) => (
                  <div key={p.username} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3.5 py-2 text-xs">
                    <span className="font-bold">#{idx + 1} @{p.username}</span>
                    <span className="font-bold text-violet-300">{p.points} очк. · 🏆 {p.wins} побед</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8]">Очки игроков появятся после начала игры в чате.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

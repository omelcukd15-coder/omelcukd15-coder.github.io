'use client';

import React, { useState } from 'react';
import { Swords, Play, Check } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { apiUrl } from '@/lib/api';

export default function PlaylistPage() {
  const [autopilot, setAutopilot] = useState(false);
  const [rotateBy, setRotateBy] = useState<'rounds' | 'minutes'>('rounds');
  const [intervalVal, setIntervalVal] = useState(3);
  const [queue, setQueue] = useState(['contexto', 'flag-quiz', 'ball-royale', 'secret-word']);
  const [rivalNick, setRivalNick] = useState('');
  const [battleActive, setBattleActive] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleGame = (slug: string) => {
    setQueue((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const savePlaylist = async () => {
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'streamer-demo',
        type: 'control',
        action: 'update_playlist',
        payload: { playlist: { autopilot, rotateBy, rotateInterval: intervalVal, queueSlugs: queue } },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Плейлист, Автопилот и Битва стримеров</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Автоматическая ротация игр и совместные баттлы двух эфиров.</p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Check className="h-4 w-4" /> Сохранено
          </span>
        )}
      </div>

      {/* Autopilot */}
      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Автопилот плейлиста</h2>
            <p className="text-xs text-[#94A3B8]">Меняет игру автоматически, пока вы общаетесь с аудиторией.</p>
          </div>
          <button
            type="button"
            onClick={() => setAutopilot((v) => !v)}
            className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
              autopilot ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'
            }`}
          >
            {autopilot ? 'Автопилот: ВКЛ' : 'Автопилот: ВЫКЛ'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={rotateBy}
            onChange={(e) => setRotateBy(e.target.value as 'rounds' | 'minutes')}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold"
          >
            <option value="rounds">Через число раундов</option>
            <option value="minutes">Через время (минуты)</option>
          </select>
          <input
            type="number"
            min={1}
            max={60}
            value={intervalVal}
            onChange={(e) => setIntervalVal(Number(e.target.value))}
            className="w-24 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold"
          />
          <button
            type="button"
            onClick={savePlaylist}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white"
          >
            <Play className="h-3.5 w-3.5" /> Сохранить очередь
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {GAMES.map((g) => {
            const active = queue.includes(g.slug);
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => toggleGame(g.slug)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold ${
                  active ? 'border-violet-400 bg-[#7C3AED]/20 text-violet-300' : 'border-white/10 bg-[#120E24]/85 text-white text-[#94A3B8]'
                }`}
              >
                <span>{g.emoji}</span>
                <span className="truncate">{g.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streamer Battle */}
      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-violet-300" />
          <h2 className="font-display text-lg font-bold text-white">Битва стримеров (2 эфира vs друг друга)</h2>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Укажите ник второго стримера — ваши чаты будут соревноваться в общем счёте раундов и подарков.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={rivalNick}
            onChange={(e) => setRivalNick(e.target.value)}
            placeholder="@ник_соперника_tiktok"
            className="flex-1 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold"
          />
          <button
            type="button"
            onClick={() => setBattleActive((v) => !v)}
            className="rounded-xl bg-[#11101C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#7C3AED]"
          >
            {battleActive ? 'Остановить битву' : 'Начать битву эфиров'}
          </button>
        </div>
        {battleActive && (
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-[#7C3AED]/20 p-4 text-center">
            <div>
              <div className="text-xs font-bold text-[#94A3B8]">Ваш эфир</div>
              <div className="font-display text-2xl font-extrabold text-violet-300">142 очка</div>
            </div>
            <div>
              <div className="text-xs font-bold text-[#94A3B8]">{rivalNick || '@rival_live'}</div>
              <div className="font-display text-2xl font-extrabold text-pink-600">128 очков</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

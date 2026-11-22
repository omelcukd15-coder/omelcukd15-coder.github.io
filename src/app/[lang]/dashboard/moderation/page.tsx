'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { getStreamerToken } from '@/lib/streamerSession';

export default function ModerationPage() {
  const [roomToken, setRoomToken] = useState('live');
  const [profanityOn, setProfanityOn] = useState(true);
  const [antiFloodSec, setAntiFloodSec] = useState(0);
  const [stopWordsText, setStopWordsText] = useState('спам, скам');
  const [bannedText, setBannedText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = getStreamerToken();
    setRoomToken(t);
    resolveBackendOrigin().then(() => {
      fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(t)}&mode=json`))
        .then((r) => r.json())
        .then((d) => {
          const mod = d?.state?.moderation;
          if (mod) {
            if (typeof mod.profanityOn === 'boolean') setProfanityOn(mod.profanityOn);
            if (typeof mod.antiFloodSec === 'number') setAntiFloodSec(mod.antiFloodSec);
            if (Array.isArray(mod.stopWords)) setStopWordsText(mod.stopWords.join(', '));
            if (Array.isArray(mod.bannedUsers)) setBannedText(mod.bannedUsers.join(', '));
          }
        })
        .catch(() => {});
    });
  }, []);

  const saveModeration = async () => {
    const stopWords = stopWordsText.split(',').map((s) => s.trim()).filter(Boolean);
    const bannedUsers = bannedText.split(',').map((s) => s.trim().replace(/^@/, '')).filter(Boolean);
    await resolveBackendOrigin();
    const res = await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: roomToken,
        type: 'control',
        action: 'update_moderation',
        payload: {
          moderation: { profanityOn, antiFloodSec, stopWords, bannedUsers, mutedUsers: [] },
        },
      }),
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
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Модерация и защита чата</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Стоп-слова, антимат, бан-лист и защита от флуда в реальном времени.</p>
      </div>

      <div className="max-w-2xl space-y-5 rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-white">Автофильтр мата и ссылок</div>
            <div className="text-xs text-[#94A3B8]">Скрывает нежелательные слова и ссылки до показа на экране игры</div>
          </div>
          <button
            type="button"
            onClick={() => setProfanityOn((v) => !v)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold ${
              profanityOn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
            }`}
          >
            {profanityOn ? 'Включён' : 'Выключен'}
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-[#94A3B8]">Антифлуд (минимум секунд между сообщениями от 1 зрителя)</label>
          <input
            type="number"
            min={0}
            max={30}
            value={antiFloodSec}
            onChange={(e) => setAntiFloodSec(Number(e.target.value))}
            className="mt-1.5 w-32 rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2 text-sm font-bold text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#94A3B8]">Стоп-слова (через запятую)</label>
          <textarea
            rows={2}
            value={stopWordsText}
            onChange={(e) => setStopWordsText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#94A3B8]">Чёрный список / бан-лист ников TikTok (через запятую)</label>
          <textarea
            rows={2}
            value={bannedText}
            onChange={(e) => setBannedText(e.target.value)}
            placeholder="Например: user1, user2"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
        </div>

        <button
          type="button"
          onClick={saveModeration}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-[#6D28D9]"
        >
          {saved ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          <span>{saved ? 'Правила применены на эфир!' : 'Сохранить правила модерации'}</span>
        </button>
      </div>
    </div>
  );
}

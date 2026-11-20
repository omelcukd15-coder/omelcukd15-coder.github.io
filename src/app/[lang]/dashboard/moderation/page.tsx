'use client';

import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function ModerationPage() {
  const [profanityOn, setProfanityOn] = useState(true);
  const [antiFloodSec, setAntiFloodSec] = useState(1);
  const [stopWordsText, setStopWordsText] = useState('спам, скам, реклама');
  const [bannedText, setBannedText] = useState('troll_99');
  const [saved, setSaved] = useState(false);

  const saveModeration = async () => {
    const stopWords = stopWordsText.split(',').map((s) => s.trim()).filter(Boolean);
    const bannedUsers = bannedText.split(',').map((s) => s.trim().replace(/^@/, '')).filter(Boolean);
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'streamer-demo',
        type: 'control',
        action: 'update_moderation',
        payload: {
          moderation: { profanityOn, antiFloodSec, stopWords, bannedUsers, mutedUsers: [] },
        },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Модерация и защита чата</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Стоп-слова, антимат, бан-лист и защита от флуда в реальном времени.</p>
      </div>

      <div className="max-w-2xl space-y-5 rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-white">Автофильтр мата и ссылок</div>
            <div className="text-xs text-[#94A3B8]">Скрывает нецензурные слова и ссылки до показа на экране игры</div>
          </div>
          <button
            type="button"
            onClick={() => setProfanityOn((v) => !v)}
            className={`rounded-xl px-4 py-2 text-xs font-bold ${
              profanityOn ? 'bg-emerald-100 text-emerald-700' : 'bg-white/10 text-slate-600'
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
            className="mt-1.5 w-32 rounded-xl border border-white/10 px-3.5 py-2 text-sm font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#94A3B8]">Стоп-слова (через запятую)</label>
          <textarea
            rows={2}
            value={stopWordsText}
            onChange={(e) => setStopWordsText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 p-3 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#94A3B8]">Чёрный список / бан-лист ников TikTok (через запятую)</label>
          <textarea
            rows={2}
            value={bannedText}
            onChange={(e) => setBannedText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 p-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={saveModeration}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-[#6D28D9]"
        >
          {saved ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          <span>{saved ? 'Правила применены!' : 'Сохранить правила модерации'}</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { GameScreen } from '@/components/game-engine/GameScreen';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { getStreamerToken } from '@/lib/streamerSession';

export default function SkinsPage() {
  const [roomToken, setRoomToken] = useState('live');
  const [accentColor, setAccentColor] = useState('#7C3AED');
  const [backgroundMode, setBackgroundMode] = useState<'light' | 'neon' | 'sunset' | 'dark'>('neon');
  const [ballShape, setBallShape] = useState<'circle' | 'hex' | 'square'>('circle');
  const [logoText, setLogoText] = useState('VibePlay LIVE');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = getStreamerToken();
    setRoomToken(t);
    resolveBackendOrigin().then(() => {
      fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(t)}&mode=json`))
        .then((r) => r.json())
        .then((d) => {
          const sk = d?.state?.skin;
          if (sk) {
            if (sk.accentColor) setAccentColor(sk.accentColor);
            if (sk.backgroundMode) setBackgroundMode(sk.backgroundMode);
            if (sk.ballShape) setBallShape(sk.ballShape);
            if (sk.logoText) setLogoText(sk.logoText);
          }
        })
        .catch(() => {});
    });
  }, []);

  const applySkin = async () => {
    await resolveBackendOrigin();
    const res = await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: roomToken,
        type: 'control',
        action: 'update_skin',
        payload: { skin: { accentColor, backgroundMode, ballShape, logoText } },
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
        <h1 className="font-display text-2xl font-extrabold text-white">Скины и оформление игр</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Настройте цвета, фон, форму шаров зрителей и свой бренд на сцене.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm lg:col-span-7">
          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Акцентный цвет</label>
            <div className="mt-2 flex gap-2">
              {['#7C3AED', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`h-9 w-9 rounded-xl border-2 transition ${accentColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Тема фона</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['light', 'neon', 'sunset', 'dark'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setBackgroundMode(m)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                    backgroundMode === m ? 'border-violet-400 bg-[#7C3AED]/20 text-violet-300' : 'border-white/15 bg-[#080612] text-slate-300'
                  }`}
                >
                  {m === 'light' ? 'Светлый' : m === 'neon' ? 'Неон' : m === 'sunset' ? 'Закат' : 'Тёмный'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Форма шаров зрителей</label>
            <div className="mt-2 flex gap-2">
              {(['circle', 'hex', 'square'] as const).map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => setBallShape(sh)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold ${
                    ballShape === sh ? 'border-violet-400 bg-[#7C3AED]/20 text-violet-300' : 'border-white/15 bg-[#080612] text-slate-300'
                  }`}
                >
                  {sh === 'circle' ? 'Круг' : sh === 'hex' ? 'Гексагон' : 'Квадрат'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#94A3B8]">Свой заголовок / логотип стримера на экране</label>
            <input
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="button"
            onClick={applySkin}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-card hover:bg-[#6D28D9]"
          >
            {saved && <Check className="h-4 w-4" />}
            <span>{saved ? 'Скин применён на эфир!' : 'Применить скин'}</span>
          </button>
        </div>

        <div className="flex justify-center lg:col-span-5">
          <div className="h-[540px] w-[280px] overflow-hidden rounded-[2.5rem] border-[6px] border-white/15 bg-[#05040B] p-1 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <div className="h-full w-full overflow-hidden rounded-[2rem]">
              <GameScreen slug="ball-royale" token={roomToken} mode="preview" initialBots={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

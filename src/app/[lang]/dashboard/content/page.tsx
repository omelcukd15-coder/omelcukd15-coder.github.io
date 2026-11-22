'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { apiUrl, resolveBackendOrigin } from '@/lib/api';
import { getStreamerToken } from '@/lib/streamerSession';

interface CustomItem {
  id: string;
  gameSlug: string;
  text: string;
  answer: string;
}

export default function ContentPage() {
  const [roomToken, setRoomToken] = useState('live');
  const [gameSlug, setGameSlug] = useState('trivia');
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [csvRaw, setCsvRaw] = useState('');
  const [items, setItems] = useState<CustomItem[]>([]);

  useEffect(() => {
    const t = getStreamerToken();
    setRoomToken(t);
    resolveBackendOrigin().then(() => {
      fetch(apiUrl(`/api/live/stream?token=${encodeURIComponent(t)}&mode=json`))
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.state?.customItems)) {
            setItems(d.state.customItems);
          }
        })
        .catch(() => {});
    });
  }, []);

  const syncAllToHub = async (allItems: CustomItem[]) => {
    await resolveBackendOrigin();
    const res = await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: roomToken,
        type: 'control',
        action: 'set_custom_content',
        payload: { items: allItems },
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
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !answer.trim()) return;
    const item: CustomItem = { id: String(Date.now()), gameSlug, text: text.trim(), answer: answer.trim() };
    const next = [item, ...items];
    setItems(next);
    setText('');
    setAnswer('');
    await syncAllToHub(next);
  };

  const deleteItem = async (id: string) => {
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    await syncAllToHub(next);
  };

  const importCsv = async (raw: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed: CustomItem[] = lines.map((line, i) => {
      const [q, a] = line.split(/[;,]/).map((s) => s.trim());
      return { id: `${Date.now()}-${i}`, gameSlug, text: q || line, answer: a || q || 'ответ' };
    });
    if (parsed.length === 0) return;
    const next = [...parsed, ...items];
    setItems(next);
    setCsvRaw('');
    await syncAllToHub(next);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        void importCsv(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Свой контент и импорт CSV</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Добавляйте свои вопросы, слова и загадки (Контекстно, Найди слово, Викторина, Эмодзи) — они сразу идут в раунды.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addItem} className="space-y-3 rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Добавить элемент</h2>
          <select
            value={gameSlug}
            onChange={(e) => setGameSlug(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-violet-500"
          >
            {GAMES.map((g) => (
              <option key={g.slug} value={g.slug}>{g.emoji} {g.title}</option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вопрос, тема или подсказка"
            className="w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Правильный ответ / слово"
            className="w-full rounded-xl border border-white/15 bg-[#080612] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#7C3AED] py-3 text-sm font-bold text-white hover:bg-[#6D28D9]"
          >
            <Plus className="h-4 w-4" /> Добавить в базу эфира
          </button>
        </form>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Импорт CSV (формат: вопрос;ответ)</h2>
          <textarea
            rows={3}
            value={csvRaw}
            onChange={(e) => setCsvRaw(e.target.value)}
            placeholder={'Столица Франции?;Париж\n2 + 2 * 2?;6'}
            className="w-full rounded-xl border border-white/15 bg-[#080612] p-3 font-mono text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => importCsv(csvRaw)}
              className="rounded-xl bg-[#7C3AED] px-4 py-2 text-xs font-bold text-white hover:bg-[#6D28D9]"
            >
              Импортировать строки
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-[#080612] px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08]">
              <Upload className="h-3.5 w-3.5 text-violet-300" />
              <span>Загрузить .CSV файл</span>
              <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 text-white shadow-sm">
        <h2 className="font-display text-base font-bold text-white">Мои материалы ({items.length})</h2>
        {items.length > 0 ? (
          <div className="mt-4 space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3 text-sm">
                <div>
                  <span className="mr-2 rounded-lg bg-[#7C3AED]/20 px-2 py-0.5 text-[11px] font-bold text-violet-300">
                    {it.gameSlug}
                  </span>
                  <span className="font-semibold text-white">{it.text}</span>
                  <span className="ml-2 text-xs font-bold text-emerald-400">→ {it.answer}</span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem(it.id)}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#94A3B8]">Вы ещё не добавляли свои вопросы — используйте форму выше, и они сразу появятся на стриме.</p>
        )}
      </div>
    </div>
  );
}

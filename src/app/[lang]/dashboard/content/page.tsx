'use client';

import React, { useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { GAMES } from '@/lib/games-data';
import { apiUrl } from '@/lib/api';

interface CustomItem {
  id: string;
  gameSlug: string;
  text: string;
  answer: string;
}

export default function ContentPage() {
  const [gameSlug, setGameSlug] = useState('trivia');
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [csvRaw, setCsvRaw] = useState('');
  const [items, setItems] = useState<CustomItem[]>([
    { id: '1', gameSlug: 'contexto', text: 'Своё слово для стрима', answer: 'стриминг' },
    { id: '2', gameSlug: 'trivia', text: 'В каком городе живёт стример?', answer: 'Москва' },
  ]);

  const syncToHub = async (newItems: CustomItem[]) => {
    await fetch(apiUrl('/api/live/event'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'streamer-demo',
        type: 'control',
        action: 'add_custom_content',
        payload: { items: newItems },
      }),
    });
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !answer.trim()) return;
    const item: CustomItem = { id: String(Date.now()), gameSlug, text: text.trim(), answer: answer.trim() };
    const next = [item, ...items];
    setItems(next);
    setText('');
    setAnswer('');
    await syncToHub([item]);
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
    setItems((prev) => [...parsed, ...prev]);
    setCsvRaw('');
    await syncToHub(parsed);
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
        <p className="mt-1 text-sm text-[#94A3B8]">Добавляйте собственные вопросы, слова и темы для любой игры.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addItem} className="space-y-3 rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Добавить элемент</h2>
          <select
            value={gameSlug}
            onChange={(e) => setGameSlug(e.target.value)}
            className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 text-sm font-semibold"
          >
            {GAMES.map((g) => (
              <option key={g.slug} value={g.slug}>{g.emoji} {g.title}</option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вопрос, подсказка или ссылка на картинку"
            className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 text-sm"
          />
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Правильный ответ / слово"
            className="w-full rounded-xl border border-white/10 px-3.5 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#7C3AED] py-3 text-sm font-bold text-white hover:bg-[#6D28D9]"
          >
            <Plus className="h-4 w-4" /> Добавить в базу эфира
          </button>
        </form>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-white">Импорт CSV (формат: вопрос;ответ)</h2>
          <textarea
            rows={3}
            value={csvRaw}
            onChange={(e) => setCsvRaw(e.target.value)}
            placeholder={'Столица Франции?;Париж\n2 + 2 * 2?;6'}
            className="w-full rounded-xl border border-white/10 p-3 text-xs font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => importCsv(csvRaw)}
              className="rounded-xl bg-[#11101C] px-4 py-2 text-xs font-bold text-white"
            >
              Импортировать строки
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold hover:bg-white/[0.05]">
              <Upload className="h-3.5 w-3.5 text-violet-300" />
              <span>Загрузить .CSV файл</span>
              <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-white">Мои материалы ({items.length})</h2>
        <div className="mt-4 space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3 text-sm">
              <div>
                <span className="mr-2 rounded-lg bg-[#7C3AED]/20 px-2 py-0.5 text-[11px] font-bold text-violet-300">
                  {it.gameSlug}
                </span>
                <span className="font-semibold text-white">{it.text}</span>
                <span className="ml-2 text-xs font-bold text-emerald-600">→ {it.answer}</span>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

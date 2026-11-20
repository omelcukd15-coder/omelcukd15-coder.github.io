'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ARTICLES } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';

export function ArticlesClient({ lang }: { lang: Lang }) {
  const [tag, setTag] = useState('Все');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const tags = useMemo(() => ['Все', ...Array.from(new Set(ARTICLES.map((a) => a.tag)))], []);

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (tag !== 'Все' && a.tag !== tag) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      }
      return true;
    });
  }, [tag, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const items = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Поиск статей и инструкций..."
            className="w-full rounded-2xl border border-white/10 bg-[#120E24]/85 text-white/[0.05] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400 focus:bg-[#120E24]/85"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTag(t);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold ${
                tag === t ? 'bg-[#7C3AED] text-white' : 'bg-[#120E24]/85 text-white/10 text-[#94A3B8]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map((art) => (
          <Link
            key={art.slug}
            href={`/${lang}/articles/${art.slug}`}
            className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="rounded-full bg-[#7C3AED]/20 px-3 py-1 text-violet-300">{art.tag}</span>
                <span className="text-[#94A3B8]">{art.readTime}</span>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-white">{art.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{art.excerpt}</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-[#94A3B8]">
              <span>{art.author}</span>
              <span>{art.date}</span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-xl text-xs font-bold ${
                page === p ? 'bg-[#7C3AED] text-white' : 'border border-white/10 bg-[#120E24]/85'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

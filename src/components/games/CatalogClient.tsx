'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { GAMES, GameCategory } from '@/lib/games-data';
import { Lang, getDictionary } from '@/lib/i18n';

export function CatalogClient({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const [category, setCategory] = useState<'all' | GameCategory>('all');
  const [platform, setPlatform] = useState<'all' | 'tiktok' | 'twitch' | 'youtube'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'new'>('popular');

  const filtered = useMemo(() => {
    return GAMES.filter((g) => {
      if (category !== 'all' && g.category !== category) return false;
      if (platform !== 'all' && !g.platforms.includes(platform)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!g.title.toLowerCase().includes(q) && !g.shortRule.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sort === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.popularity - a.popularity;
      return b.popularity - a.popularity;
    });
  }, [category, platform, query, sort]);

  const categories: { id: 'all' | GameCategory; label: string }[] = [
    { id: 'all', label: dict.categories.all },
    { id: 'guessing', label: dict.categories.guessing },
    { id: 'voting', label: dict.categories.voting },
    { id: 'arena', label: dict.categories.arena },
    { id: 'words', label: dict.categories.words },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 shadow-soft backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.common.searchPlaceholder}
              className="w-full rounded-2xl border border-white/15 bg-[#080612] py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'tiktok', 'twitch', 'youtube'] as const).map((pl) => (
              <button
                key={pl}
                type="button"
                onClick={() => setPlatform(pl)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                  platform === pl ? 'bg-[#7C3AED] text-white' : 'bg-white/[0.06] text-[#94A3B8] hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                {pl === 'all' ? 'Все платформы' : pl.toUpperCase()}
              </button>
            ))}

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'popular' | 'new')}
              className="rounded-xl border border-white/15 bg-[#080612] px-3 py-2 text-xs font-bold text-white outline-none"
            >
              <option value="popular">{dict.common.popular}</option>
              <option value="new">{dict.common.newest}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                category === cat.id
                  ? 'bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 text-white shadow-card'
                  : 'border border-white/10 bg-white/[0.04] text-[#94A3B8] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <div
            key={g.slug}
            className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#120E24]/85 p-6 shadow-soft backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-400/40"
          >
            <div>
              <div className={`flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br ${g.accentGradient} text-6xl text-white shadow-inner`}>
                {g.emoji}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-white">{g.title}</h2>
                {g.isNew && (
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300">
                    NEW
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{g.shortRule}</p>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href={`/${lang}/games/${g.slug}`}
                className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-center text-xs font-bold text-slate-200 transition hover:bg-white/[0.1]"
              >
                {dict.common.details}
              </Link>
              <Link
                href={`/${lang}/dashboard/games/${g.slug}`}
                className="rounded-xl bg-[#7C3AED] px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#6D28D9]"
              >
                {dict.common.launchLive}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

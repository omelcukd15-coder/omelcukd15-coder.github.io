'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Globe, Play, Sparkles } from 'lucide-react';
import { Lang, LANG_LABELS, SUPPORTED_LANGS, getDictionary } from '@/lib/i18n';

export function Header({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  const pathname = usePathname() || `/${lang}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      setIsLoggedIn(Boolean(localStorage.getItem('vp_user')));
    } catch {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  const switchLangHref = (targetLang: Lang) => {
    const parts = pathname.split('/');
    if (parts.length > 1 && SUPPORTED_LANGS.includes(parts[1] as Lang)) {
      parts[1] = targetLang;
      return parts.join('/') || `/${targetLang}`;
    }
    return `/${targetLang}`;
  };

  const navLinks = [
    { href: `/${lang}/games`, label: dict.nav.games },
    { href: `/${lang}/streams`, label: dict.nav.streams },
    { href: `/${lang}/articles`, label: dict.nav.articles },
    { href: `/${lang}/demo`, label: dict.nav.demo },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080612]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] via-fuchsia-500 to-cyan-400 text-white shadow-glow">
            <Play className="h-4 w-4 fill-current" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            VibePlay <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">LIVE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-[#7C3AED]/25 text-violet-300 ring-1 ring-violet-400/30'
                    : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
            >
              <Globe className="h-3.5 w-3.5 text-violet-400" />
              <span>{LANG_LABELS[lang].flag} {lang.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-[#120E24] p-1.5 shadow-soft backdrop-blur-xl">
                {SUPPORTED_LANGS.map((l) => (
                  <Link
                    key={l}
                    href={switchLangHref(l)}
                    onClick={() => setLangOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      l === lang ? 'bg-[#7C3AED]/25 text-violet-300' : 'text-slate-200 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{LANG_LABELS[l].flag}</span>
                    <span>{LANG_LABELS[l].label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/login`}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            {isLoggedIn ? dict.nav.dashboard : dict.nav.login}
          </Link>

          <Link
            href={`/${lang}/dashboard/games/contexto`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{dict.nav.tryFree}</span>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Открыть меню"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0D0A1B]/95 px-4 pb-5 pt-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base font-semibold text-slate-200 hover:bg-white/[0.06]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
            {SUPPORTED_LANGS.map((l) => (
              <Link
                key={l}
                href={switchLangHref(l)}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  l === lang ? 'bg-[#7C3AED] text-white' : 'bg-white/[0.06] text-slate-300'
                }`}
              >
                {LANG_LABELS[l].flag} {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/login`}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-center text-sm font-semibold text-white"
            >
              {isLoggedIn ? dict.nav.dashboard : dict.nav.login}
            </Link>
            <Link
              href={`/${lang}/dashboard/games/contexto`}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 py-2.5 text-center text-sm font-semibold text-white"
            >
              {dict.nav.tryFree}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

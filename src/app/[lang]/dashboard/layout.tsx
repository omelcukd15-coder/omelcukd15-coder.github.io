'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gamepad2,
  Gift,
  FileText,
  ListVideo,
  Palette,
  BarChart3,
  ShieldAlert,
  Settings,
  Play,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Lang, getDictionary } from '@/lib/i18n';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Lang };
}) {
  const dict = getDictionary(params.lang);
  const pathname = usePathname() || '';
  const [userEmail, setUserEmail] = useState('Демо-стример');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vp_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.email) setUserEmail(parsed.email);
      } else {
        localStorage.setItem('vp_user', JSON.stringify({ email: 'demo@vibeplay.live', token: 'streamer-demo' }));
      }
    } catch {
      // ignore
    }
  }, []);

  const navItems = [
    { href: `/${params.lang}/dashboard`, label: dict.dashboardNav.overview, icon: LayoutDashboard, exact: true },
    { href: `/${params.lang}/dashboard/games/contexto`, label: dict.dashboardNav.games, icon: Gamepad2, matchPrefix: `/${params.lang}/dashboard/games` },
    { href: `/${params.lang}/dashboard/gifts`, label: dict.dashboardNav.gifts, icon: Gift },
    { href: `/${params.lang}/dashboard/content`, label: dict.dashboardNav.content, icon: FileText },
    { href: `/${params.lang}/dashboard/playlist`, label: dict.dashboardNav.playlist, icon: ListVideo },
    { href: `/${params.lang}/dashboard/skins`, label: dict.dashboardNav.skins, icon: Palette },
    { href: `/${params.lang}/dashboard/stats`, label: dict.dashboardNav.stats, icon: BarChart3 },
    { href: `/${params.lang}/dashboard/moderation`, label: dict.dashboardNav.moderation, icon: ShieldAlert },
    { href: `/${params.lang}/dashboard/settings`, label: dict.dashboardNav.settings, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#080612] pb-20 text-white md:flex-row md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-[#0C091A]/90 p-4 backdrop-blur-xl md:flex">
        <div>
          <Link href={`/${params.lang}`} className="flex items-center gap-2.5 px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-fuchsia-500 text-white shadow-glow">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="font-display text-base font-bold text-white">
              VibePlay <span className="text-violet-400">LIVE</span>
            </span>
          </Link>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : item.matchPrefix
                ? pathname.startsWith(item.matchPrefix)
                : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'border border-violet-400/30 bg-[#7C3AED]/20 text-violet-200'
                      : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-4">
            <Link
              href={`/${params.lang}/admin`}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{dict.dashboardNav.admin}</span>
            </Link>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
          <div className="truncate text-xs font-bold text-white">{userEmail}</div>
          <Link
            href="/play/streamer-demo/contexto"
            target="_blank"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 py-2 text-xs font-bold text-white shadow-card hover:opacity-95"
          >
            <span>📱 Открыть как приложение</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#0C091A]/90 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href={`/${params.lang}`} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED] text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <span className="font-display text-sm font-bold text-white">VibePlay LIVE</span>
          </Link>
          <Link
            href="/play/streamer-demo/contexto"
            className="rounded-xl bg-[#7C3AED] px-3 py-1.5 text-xs font-bold text-white"
          >
            📱 Игра 9:16
          </Link>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile Bottom App Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#0C091A]/95 py-1.5 backdrop-blur-xl md:hidden">
        {[
          { href: `/${params.lang}/dashboard`, label: 'Обзор', icon: LayoutDashboard },
          { href: `/${params.lang}/dashboard/games/contexto`, label: 'Игры', icon: Gamepad2 },
          { href: `/${params.lang}/dashboard/gifts`, label: 'Подарки', icon: Gift },
          { href: `/${params.lang}/dashboard/stats`, label: 'Стата', icon: BarChart3 },
          { href: `/${params.lang}/dashboard/settings`, label: 'Настр.', icon: Settings },
        ].map((m) => {
          const Icon = m.icon;
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-bold ${
                active ? 'text-violet-400' : 'text-[#94A3B8]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{m.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

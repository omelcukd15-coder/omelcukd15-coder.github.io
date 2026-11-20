import Link from 'next/link';
import { Play } from 'lucide-react';
import { Lang, getDictionary } from '@/lib/i18n';
import { GAMES } from '@/lib/games-data';

export function Footer({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);

  return (
    <footer className="border-t border-white/10 bg-[#070510] pt-14 pb-10 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href={`/${lang}`} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-fuchsia-500 text-white shadow-glow">
                <Play className="h-4 w-4 fill-current" />
              </span>
              <span className="font-display text-lg font-bold text-white">
                VibePlay <span className="text-violet-400">LIVE</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
              Интерактивные игры для прямых эфиров в TikTok LIVE, OBS и на экране смартфона.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {dict.footer.platform}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#94A3B8]">
              <li><Link href={`/${lang}/games`} className="hover:text-violet-400">{dict.nav.games}</Link></li>
              <li><Link href={`/${lang}/streams`} className="hover:text-violet-400">{dict.nav.streams}</Link></li>
              <li><Link href={`/${lang}#faq`} className="hover:text-violet-400">{dict.footer.questions}</Link></li>
              <li><Link href={`/${lang}/articles`} className="hover:text-violet-400">{dict.nav.articles}</Link></li>
              <li><Link href={`/${lang}/dashboard/games/contexto`} className="font-semibold text-violet-400 hover:text-violet-300">{dict.nav.tryFree}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {dict.footer.games}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#94A3B8] sm:grid-cols-3">
              {GAMES.map((g) => (
                <li key={g.slug}>
                  <Link href={`/${lang}/games/${g.slug}`} className="hover:text-violet-400">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {dict.footer.docs} &amp; {dict.footer.contacts}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#94A3B8]">
              <li><Link href={`/${lang}/terms`} className="hover:text-violet-400">{dict.footer.terms}</Link></li>
              <li><Link href={`/${lang}/privacy`} className="hover:text-violet-400">{dict.footer.privacy}</Link></li>
              <li><Link href={`/${lang}/legal`} className="hover:text-violet-400">{dict.footer.legal}</Link></li>
              <li className="pt-2 font-medium text-white">
                Telegram: <a href="https://t.me" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">@vibeplay_live</a>
              </li>
              <li>
                Email: <a href="mailto:support@vibeplay.live" className="text-violet-400 hover:underline">support@vibeplay.live</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#94A3B8] sm:flex-row">
          <p>{dict.footer.copyright}</p>
          <p>OBS 1080×1920 · Mobile Gaming 9:16 · TikTok LIVE Ready</p>
        </div>
      </div>
    </footer>
  );
}

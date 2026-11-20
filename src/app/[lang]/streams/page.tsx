import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Trophy, Radio } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LIVE_SHOWCASE_STREAMS } from '@/lib/games-data';
import { Lang, getDictionary } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  return {
    title: `${dict.nav.streams} — Стримеры в эфире сейчас | ${dict.brand}`,
    description: 'Живые эфиры TikTok LIVE с интерактивными играми VibePlay LIVE и рейтинг лучших за неделю.',
  };
}

export default function StreamsPage({ params }: { params: { lang: Lang } }) {
  const dict = getDictionary(params.lang);
  const topWeekly = [...LIVE_SHOWCASE_STREAMS].sort((a, b) => b.viewers - a.viewers);

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Главная', href: `/${params.lang}` }, { label: dict.nav.streams }]} />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Эфиры с нашими играми
            </h1>
            <p className="mt-2 text-sm text-[#94A3B8] sm:text-base">
              Заходите в живые трансляции TikTok LIVE и играйте прямо в чате зрителей.
            </p>
          </div>
          <Link
            href={`/${params.lang}/dashboard`}
            className="rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-bold text-white shadow-card hover:bg-[#6D28D9]"
          >
            Добавить свой стрим →
          </Link>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_SHOWCASE_STREAMS.map((st) => (
            <div key={st.id} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED]/20 text-2xl">
                    {st.avatar}
                  </span>
                  <div>
                    <div className="font-display text-base font-bold text-white">{st.streamer}</div>
                    <div className="text-xs font-semibold text-[#94A3B8]">{st.country} · {st.gameTitle}</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold text-rose-600">
                  <Radio className="h-3 w-3" /> LIVE {st.viewers}
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <a
                  href={st.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#11101C] py-2.5 text-xs font-bold text-white hover:bg-[#7C3AED]"
                >
                  <span>Смотреть в TikTok</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link
                  href={`/${params.lang}/games/${st.gameSlug}`}
                  className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/[0.05]"
                >
                  Об игре
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-8 shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-violet-300" />
            <h2 className="font-display text-2xl font-extrabold text-white">Лучшие за неделю</h2>
          </div>
          <div className="mt-6 space-y-3">
            {topWeekly.map((s, idx) => (
              <div key={s.id} className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-display text-base font-black text-violet-300">#{idx + 1}</span>
                  <span className="text-xl">{s.avatar}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{s.streamer}</div>
                    <div className="text-xs text-[#94A3B8]">Любимая игра: {s.gameTitle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">{s.viewers} пик</div>
                  <div className="text-[11px] font-semibold text-emerald-600">Активный чат</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

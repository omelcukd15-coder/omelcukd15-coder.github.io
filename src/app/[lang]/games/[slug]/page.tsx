import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Gift, Sliders, HelpCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { GameScreen } from '@/components/game-engine/GameScreen';
import { GAMES, getGameBySlug } from '@/lib/games-data';
import { Lang, getDictionary } from '@/lib/i18n';

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Lang; slug: string };
}): Promise<Metadata> {
  const found = GAMES.find((g) => g.slug === params.slug);
  if (!found) return { title: 'Игра не найдена' };
  return {
    title: `${found.title} — интерактивная игра для TikTok LIVE | VibePlay LIVE`,
    description: found.description,
  };
}

export default function GameDetailPage({ params }: { params: { lang: Lang; slug: string } }) {
  const game = GAMES.find((g) => g.slug === params.slug);
  if (!game) notFound();
  const dict = getDictionary(params.lang);
  const related = GAMES.filter((g) => g.slug !== game.slug).slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${game.title} — VibePlay LIVE`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web, iOS, Android, OBS Studio',
    description: game.description,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: `/${params.lang}` },
            { label: dict.nav.games, href: `/${params.lang}/games` },
            { label: game.title },
          ]}
        />

        <section className="grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-[#7C3AED]/15 px-3.5 py-1.5 text-xs font-bold text-violet-300">
              <span>{game.emoji}</span>
              <span>TikTok LIVE · 1080×1920 &amp; Телефон</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              {game.title}
            </h1>
            <p className="text-base leading-relaxed text-[#94A3B8] sm:text-lg">{game.description}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/${params.lang}/dashboard/games/${game.slug}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 px-7 py-4 text-base font-bold text-white shadow-glow transition hover:opacity-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{dict.common.launchLive}</span>
              </Link>
              <Link
                href={`/play/live/${game.slug}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 text-base font-bold text-white hover:bg-white/[0.12]"
              >
                <span>📱 Открыть на весь экран</span>
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="h-[580px] w-[300px] overflow-hidden rounded-[2.65rem] border-[7px] border-white/15 bg-[#05040B] p-1 shadow-[0_0_50px_rgba(124,58,237,0.3)]">
              <div className="h-full w-full overflow-hidden rounded-[2rem]">
                <GameScreen slug={game.slug} token={`detail-${game.slug}`} mode="preview" initialBots />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-[#120E24]/85 p-8 backdrop-blur-md">
          <h2 className="font-display text-2xl font-extrabold text-white">Как играет чат</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {game.howChatPlays.map((step, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C3AED] font-display text-sm font-bold text-white">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-8 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-violet-400" />
              <h2 className="font-display text-2xl font-extrabold text-white">Подарки TikTok</h2>
            </div>
            <div className="mt-5 space-y-3">
              {game.gifts.map((gift, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gift.emoji}</span>
                    <div>
                      <div className="font-bold text-white">{gift.giftName}</div>
                      <div className="text-xs text-[#94A3B8]">{gift.effect}</div>
                    </div>
                  </div>
                  <span className="rounded-xl bg-[#7C3AED]/25 px-3 py-1 text-xs font-extrabold text-violet-200">
                    {gift.coins} мон.
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-8 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-violet-400" />
              <h2 className="font-display text-2xl font-extrabold text-white">Настройка и панель управления</h2>
            </div>
            <p className="mt-2 text-sm text-[#94A3B8]">
              В личном кабинете и в мобильном мини-пульте доступны следующие кнопки управления:
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {game.controls.map((c) => (
                <span
                  key={c.id}
                  className="rounded-2xl border border-violet-400/30 bg-[#7C3AED]/15 px-4 py-2.5 text-sm font-bold text-violet-200"
                >
                  {c.label}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-[#94A3B8]">
              <strong className="text-white">Совет для OBS:</strong> добавляйте ссылку <code>/play/.../{game.slug}</code> как источник «Браузер»
              с размером <strong className="text-white">1080×1920</strong> (по умолчанию в OBS стоит 800×600).
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-[#120E24]/85 p-8 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-violet-400" />
            <h2 className="font-display text-2xl font-extrabold text-white">Мини-FAQ по игре</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {game.faq.map((f, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="font-bold text-white">{f.q}</div>
                <p className="mt-1.5 text-sm text-[#94A3B8]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-extrabold text-white">Другие игры</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${params.lang}/games/${r.slug}`}
                className="rounded-3xl border border-white/10 bg-[#120E24]/85 p-5 transition hover:-translate-y-1 hover:border-violet-400/40"
              >
                <div className="text-3xl">{r.emoji}</div>
                <div className="mt-3 font-display text-base font-bold text-white">{r.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-[#94A3B8]">{r.shortRule}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-violet-400/30 bg-gradient-to-r from-[#5B21B6] to-fuchsia-600 p-8 text-center text-white shadow-glow">
          <h2 className="font-display text-2xl font-extrabold">Готовы запустить «{getGameBySlug(game.slug).title}» на стриме?</h2>
          <Link
            href={`/${params.lang}/dashboard/games/${game.slug}`}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[#5B21B6]"
          >
            <span>Перейти в панель управления</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

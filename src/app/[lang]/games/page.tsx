import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CatalogClient } from '@/components/games/CatalogClient';
import { Lang, getDictionary } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  return {
    title: `${dict.nav.games} — 17 игр для TikTok LIVE | ${dict.brand}`,
    description: 'Полный каталог интерактивных игр для стримов в TikTok LIVE: угадайки, голосования, арены и словесные форматы.',
  };
}

export default function GamesCatalogPage({ params }: { params: { lang: Lang } }) {
  const dict = getDictionary(params.lang);
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Главная', href: `/${params.lang}` }, { label: dict.nav.games }]} />
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Каталог игр для стрима
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8] sm:text-base">
            17 готовых игр, в которые ваши зрители играют прямо через чат и подарки TikTok LIVE.
          </p>
        </div>
        <CatalogClient lang={params.lang} />
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

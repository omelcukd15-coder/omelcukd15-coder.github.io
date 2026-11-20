import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ArticlesClient } from '@/components/articles/ArticlesClient';
import { Lang, getDictionary } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  return {
    title: `${dict.nav.articles} — Блог для стримеров TikTok LIVE | ${dict.brand}`,
    description: 'Гайды по настройке OBS 1080×1920, мобильным стримам и продвижению в рекомендациях TikTok LIVE.',
  };
}

export default function ArticlesPage({ params }: { params: { lang: Lang } }) {
  const dict = getDictionary(params.lang);
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Главная', href: `/${params.lang}` }, { label: dict.nav.articles }]} />
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Статьи и гайды</h1>
        <p className="mt-2 mb-8 text-sm text-[#94A3B8] sm:text-base">
          Советы по запуску игр на телефоне, в OBS и росту онлайна через живой чат.
        </p>
        <ArticlesClient lang={params.lang} />
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

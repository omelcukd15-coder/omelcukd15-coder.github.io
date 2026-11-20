import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeClient } from '@/components/home/HomeClient';
import { Lang, getDictionary } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const dict = getDictionary(params.lang);
  return {
    title: `${dict.brand} — ${dict.hero.title}`,
    description: dict.hero.subtitle,
  };
}

export default function HomePage({ params }: { params: { lang: Lang } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="flex-1">
        <HomeClient lang={params.lang} />
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

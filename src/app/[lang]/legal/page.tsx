import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Правовая информация | VibePlay LIVE',
  description: 'Юридические реквизиты и контакты платформы VibePlay LIVE.',
};

export default function LegalPage({ params }: { params: { lang: Lang } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ label: 'Главная', href: `/${params.lang}` }, { label: 'Правовая информация' }]} />
        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-extrabold text-white">Правовая информация</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#94A3B8]">
            <p>VibePlay LIVE — независимое программное обеспечение для интерактивных прямых эфиров.</p>
            <p>Поддержка пользователей: support@vibeplay.live · Telegram: @vibeplay_live.</p>
          </div>
        </div>
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | VibePlay LIVE',
  description: 'Правила обработки данных пользователей и участников эфиров на платформе VibePlay LIVE.',
};

export default function PrivacyPage({ params }: { params: { lang: Lang } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ label: 'Главная', href: `/${params.lang}` }, { label: 'Политика конфиденциальности' }]} />
        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-extrabold text-white">Политика конфиденциальности</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#94A3B8]">
            <p>Мы сохраняем только указанный вами @ник TikTok, игровые настройки, пресеты подарков и статистику раундов для отображения таблиц лидеров на экране стрима.</p>
            <p>Пароли и токены доступа не передаются третьим лицам.</p>
          </div>
        </div>
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение | VibePlay LIVE',
  description: 'Условия использования интерактивной игровой платформы для прямых эфиров VibePlay LIVE.',
};

export default function TermsPage({ params }: { params: { lang: Lang } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ label: 'Главная', href: `/${params.lang}` }, { label: 'Пользовательское соглашение' }]} />
        <div className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-extrabold text-white">Пользовательское соглашение</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#94A3B8]">
            <p>1. Платформа VibePlay LIVE предоставляет стримерам интерактивные веб-сцены для использования в прямых трансляциях (TikTok LIVE, OBS, мобильные трансляции экрана).</p>
            <p>2. Стример самостоятельно отвечает за модерацию чата своего эфира с помощью встроенных инструментов стоп-слов, фильтра мата и бан-листа.</p>
            <p>3. Сервис не связан с ByteDance / TikTok Inc. и работает с публичными событиями прямого эфира.</p>
          </div>
        </div>
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ARTICLES } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) return { title: 'Статья не найдена' };
  return {
    title: `${article.title} | VibePlay LIVE`,
    description: article.excerpt,
  };
}

export default function ArticleDetailPage({ params }: { params: { lang: Lang; slug: string } }) {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) notFound();
  const related = ARTICLES.filter((a) => a.slug !== article.slug);

  return (
    <div className="flex min-h-screen flex-col">
      <Header lang={params.lang} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: `/${params.lang}` },
            { label: 'Статьи', href: `/${params.lang}/articles` },
            { label: article.title },
          ]}
        />

        <article className="rounded-3xl border border-white/10 bg-[#120E24]/85 text-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#94A3B8]">
            <span className="rounded-full bg-[#7C3AED]/20 px-3 py-1 text-violet-300">{article.tag}</span>
            <span>Автор: {article.author}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base text-[#94A3B8]">{article.excerpt}</p>

          {/* Table of contents */}
          <div className="mt-6 rounded-2xl bg-white/[0.05] p-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-white">Оглавление</div>
            <ul className="mt-2 space-y-1 text-sm font-semibold text-violet-300">
              {article.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#sec-${i}`} className="hover:underline">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 space-y-7">
            {article.sections.map((sec, idx) => (
              <section key={idx} id={`sec-${idx}`}>
                <h2 className="font-display text-xl font-bold text-white">{sec.heading}</h2>
                <p className="mt-2 text-base leading-relaxed text-[#94A3B8]">{sec.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#6C2BD9] to-purple-600 p-6 text-white">
            <h3 className="font-display text-xl font-bold">Протестируйте игру на своём стриме</h3>
            <p className="mt-1 text-sm text-white/85">
              Запустите «Контекстно» или «Битву шаров» прямо сейчас с телефона или через OBS.
            </p>
            <Link
              href={`/${params.lang}/dashboard/games/contexto`}
              className="mt-4 inline-block rounded-xl bg-[#120E24]/85 text-white px-5 py-2.5 text-sm font-extrabold text-violet-300"
            >
              Перейти в кабинет →
            </Link>
          </div>
        </article>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-white">Похожие статьи</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${params.lang}/articles/${r.slug}`}
                className="rounded-2xl border border-white/10 bg-[#120E24]/85 text-white p-5 transition hover:shadow-card"
              >
                <div className="text-xs font-bold text-violet-300">{r.tag}</div>
                <div className="mt-1 font-display text-base font-bold text-white">{r.title}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={params.lang} />
    </div>
  );
}

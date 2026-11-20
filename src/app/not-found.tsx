import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080612] px-6 text-center text-[#F8FAFC]">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06] text-4xl shadow-card backdrop-blur-md">
        👾
      </div>
      <h1 className="font-display text-5xl font-extrabold text-white">404</h1>
      <p className="mt-3 max-w-md text-lg text-[#94A3B8]">
        Эта страница не найдена или раунд уже завершился. Вернитесь на главную или запустите игру в кабинете.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/ru"
          className="rounded-2xl bg-gradient-to-r from-[#7C3AED] to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-glow transition hover:opacity-95"
        >
          На главную
        </Link>
        <Link
          href="/ru/games"
          className="rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3 font-semibold text-white transition hover:bg-white/[0.12]"
        >
          Каталог 17 игр
        </Link>
      </div>
    </div>
  );
}

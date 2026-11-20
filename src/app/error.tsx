'use client';

import Link from 'next/link';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080612] px-6 text-center text-[#F8FAFC]">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-500/15 text-4xl">
        ⚡
      </div>
      <h1 className="font-display text-4xl font-extrabold text-white">500 — Сбой трансляции</h1>
      <p className="mt-3 max-w-md text-base text-[#94A3B8]">
        Произошла временная ошибка ({error?.message || 'неизвестный сбой'}). Попробуйте перезагрузить сцену.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-2xl bg-[#7C3AED] px-6 py-3 font-semibold text-white shadow-glow transition hover:bg-[#6D28D9]"
        >
          Повторить
        </button>
        <Link
          href="/ru"
          className="rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3 font-semibold text-white"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

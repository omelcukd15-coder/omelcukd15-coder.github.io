import { notFound } from 'next/navigation';
import { SUPPORTED_LANGS, isValidLang } from '@/lib/i18n';

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isValidLang(params.lang)) {
    notFound();
  }
  return <>{children}</>;
}

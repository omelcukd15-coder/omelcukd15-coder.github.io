import { GAMES } from '@/lib/games-data';
import { Lang } from '@/lib/i18n';
import { GamePanelClient } from '@/components/dashboard/GamePanelClient';

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export default function DashboardGamePanelPage({
  params,
}: {
  params: { lang: Lang; slug: string };
}) {
  return <GamePanelClient lang={params.lang} slug={params.slug} />;
}

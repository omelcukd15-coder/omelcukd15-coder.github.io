import type { Metadata } from 'next';
import { GAMES, getGameBySlug } from '@/lib/games-data';
import { GameScreen } from '@/components/game-engine/GameScreen';

export function generateStaticParams() {
  return GAMES.map((g) => ({ token: 'streamer-demo', slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { token: string; slug: string };
}): Promise<Metadata> {
  const game = getGameBySlug(params.slug);
  return {
    title: `${game.title} — Игровой экран 1080×1920 | VibePlay LIVE`,
    description: `Игровая сцена ${game.title} для трансляции в TikTok LIVE и OBS (1080×1920).`,
  };
}

export default function PlayScreenPage({
  params,
}: {
  params: { token: string; slug: string };
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#04030A]">
      <div className="relative h-screen w-full max-w-[560px] overflow-hidden bg-[#080614] shadow-[0_0_80px_rgba(124,58,237,0.3)] sm:aspect-[9/16] sm:h-[96vh] sm:max-h-[1080px] sm:rounded-3xl sm:border sm:border-white/15">
        <GameScreen slug={params.slug} token={params.token} mode="play" />
      </div>
    </main>
  );
}

'use client';

import React, { useId } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * 3D metallic gold coin vector icon with specular highlight and inner diamond star.
 */
export function CustomCoinIcon({ size = 16, className = '' }: IconProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`inline-block shrink-0 drop-shadow-[0_1px_4px_rgba(251,191,36,0.65)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`coin-rim-${uid}`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <radialGradient id={`coin-face-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#coin-rim-${uid})`} />
      <circle cx="16" cy="16" r="11" fill={`url(#coin-face-${uid})`} stroke="#78350F" strokeWidth="0.9" strokeOpacity="0.35" />
      <path
        d="M16 7.8L18.4 13.6L24.2 16L18.4 18.4L16 24.2L13.6 18.4L7.8 16L13.6 13.6L16 7.8Z"
        fill="#FEF9C3"
        stroke="#92400E"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <ellipse cx="11.5" cy="9.8" rx="4.2" ry="1.8" transform="rotate(-28 11.5 9.8)" fill="#FFFFFF" fillOpacity="0.55" />
    </svg>
  );
}

/**
 * 3D glossy neon ruby heart vector icon.
 */
export function CustomHeartIcon({ size = 16, className = '' }: IconProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`inline-block shrink-0 drop-shadow-[0_1px_5px_rgba(244,63,94,0.7)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`heart-grad-${uid}`} x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7EB6" />
          <stop offset="45%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.2C16 28.2 4 20.6 4 11.6C4 7.5 7.2 4.4 11.1 4.4C13.4 4.4 15.2 5.6 16 7.1C16.8 5.6 18.6 4.4 20.9 4.4C24.8 4.4 28 7.5 28 11.6C28 20.6 16 28.2 16 28.2Z"
        fill={`url(#heart-grad-${uid})`}
        stroke="#FFE4E6"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
      <ellipse cx="10.2" cy="10.2" rx="3" ry="1.6" transform="rotate(-32 10.2 10.2)" fill="#FFFFFF" fillOpacity="0.65" />
    </svg>
  );
}

/**
 * Hexagonal shield / crown medal for Top-1 / Top-2 / Top-3 rows.
 */
export function CustomRankBadge({ rank, size = 16 }: { rank: 1 | 2 | 3; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const palette =
    rank === 1
      ? { c1: '#FEF08A', c2: '#F59E0B', c3: '#92400E', text: '#451A03', glow: 'rgba(251,191,36,0.75)' }
      : rank === 2
      ? { c1: '#F8FAFC', c2: '#94A3B8', c3: '#475569', text: '#0F172A', glow: 'rgba(148,163,184,0.65)' }
      : { c1: '#FDBA74', c2: '#EA580C', c3: '#7C2D12', text: '#FFF7ED', glow: 'rgba(234,88,12,0.65)' };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className="inline-block shrink-0"
      style={{ filter: `drop-shadow(0 1px 4px ${palette.glow})` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`rank-${rank}-${uid}`} x1="3" y1="2" x2="25" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.c1} />
          <stop offset="55%" stopColor={palette.c2} />
          <stop offset="100%" stopColor={palette.c3} />
        </linearGradient>
      </defs>
      <path
        d="M14 2L24.5 7.5V16.8C24.5 21.8 19.6 25.1 14 26.8C8.4 25.1 3.5 21.8 3.5 16.8V7.5L14 2Z"
        fill={`url(#rank-${rank}-${uid})`}
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeOpacity="0.65"
      />
      {rank === 1 && (
        <path
          d="M8.5 9.2L11 11.4L14 8L17 11.4L19.5 9.2L18.7 13.3H9.3L8.5 9.2Z"
          fill="#78350F"
          fillOpacity="0.28"
        />
      )}
      <text
        x="14"
        y="19"
        textAnchor="middle"
        fill={palette.text}
        fontSize="11.5"
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
      >
        {rank}
      </text>
    </svg>
  );
}

/**
 * Custom illustrated vector gift emblem matching TikTok gift tier & name.
 */
export function CustomGiftIcon({ giftName = '', coins = 1, size = 24 }: { giftName?: string; coins?: number; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const lower = giftName.toLowerCase();

  // Tier 4 / Grand Crown Gift (100+ coins or Lion/Universe)
  if (coins >= 100 || lower.includes('лев') || lower.includes('корон') || lower.includes('universe')) {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="inline-block shrink-0 drop-shadow-[0_2px_8px_rgba(251,191,36,0.75)]" aria-hidden="true">
        <defs>
          <linearGradient id={`g-crown-${uid}`} x1="4" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path d="M5 13L11.5 19L18 9L24.5 19L31 13L28 27H8L5 13Z" fill={`url(#g-crown-${uid})`} stroke="#FEF9C3" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="8" y="25" width="20" height="4" rx="2" fill="#FDE047" />
        <circle cx="18" cy="7.5" r="2.2" fill="#22D3EE" />
        <circle cx="5" cy="12" r="2" fill="#F43F5E" />
        <circle cx="31" cy="12" r="2" fill="#F43F5E" />
      </svg>
    );
  }

  // Tier 3 / Frosted Neon Donut (20-99 coins or Donut)
  if (coins >= 20 || lower.includes('понч') || lower.includes('donut')) {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="inline-block shrink-0 drop-shadow-[0_2px_7px_rgba(236,72,153,0.7)]" aria-hidden="true">
        <defs>
          <linearGradient id={`g-donut-${uid}`} x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="19" r="13" fill="#FDBA74" />
        <path d="M18 6C25.2 6 31 11.8 31 19C31 20.5 29.5 22 27.5 21C25.5 20 24.5 22.5 22.5 21.8C20.5 21 19.8 23 18 22.5C16.2 22 15.5 20.5 13.5 21.5C11.5 22.5 10.5 20 8.5 21C6.5 22 5 20.5 5 19C5 11.8 10.8 6 18 6Z" fill={`url(#g-donut-${uid})`} />
        <circle cx="18" cy="18.5" r="4.6" fill="#0B0816" />
        <rect x="12" y="10" width="3.5" height="1.6" rx="0.8" transform="rotate(-25 12 10)" fill="#22D3EE" />
        <rect x="21" y="10.5" width="3.5" height="1.6" rx="0.8" transform="rotate(28 21 10.5)" fill="#FEF08A" />
        <rect x="24" y="15.5" width="3" height="1.6" rx="0.8" transform="rotate(-18 24 15.5)" fill="#FFFFFF" />
      </svg>
    );
  }

  // Tier 2 / Crystal Heart (5-19 coins or Heart)
  if (coins >= 5 || lower.includes('серд') || lower.includes('heart')) {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="inline-block shrink-0 drop-shadow-[0_2px_7px_rgba(34,211,238,0.65)]" aria-hidden="true">
        <defs>
          <linearGradient id={`g-cheart-${uid}`} x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path
          d="M18 31C18 31 5.5 23 5.5 13.5C5.5 9.1 9 6 13.1 6C15.5 6 17.2 7.2 18 8.8C18.8 7.2 20.5 6 22.9 6C27 6 30.5 9.1 30.5 13.5C30.5 23 18 31 18 31Z"
          fill={`url(#g-cheart-${uid})`}
          stroke="#FFFFFF"
          strokeWidth="1.3"
          strokeOpacity="0.6"
        />
        <path d="M18 9.2L19.7 13.7L24 15.2L19.7 16.8L18 21.2L16.3 16.8L12 15.2L16.3 13.7L18 9.2Z" fill="#FEF9C3" fillOpacity="0.9" />
      </svg>
    );
  }

  // Tier 1 / Crimson Neon Rose (default 1-4 coins / Rose)
  if (lower.includes('роз') || lower.includes('rose') || coins >= 1) {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="inline-block shrink-0 drop-shadow-[0_2px_7px_rgba(244,63,94,0.7)]" aria-hidden="true">
        <defs>
          <linearGradient id={`g-rose-${uid}`} x1="10" y1="4" x2="26" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="45%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#9F1239" />
          </linearGradient>
        </defs>
        <path d="M18 19V32" stroke="#10B981" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M18 27C21.5 26 24 23.5 24.5 21.5C22 21.5 19.5 23 18 25.2" fill="#34D399" />
        <path d="M18 24C14.5 23 12 20.8 11.5 18.8C14 18.8 16.5 20.2 18 22.3" fill="#10B981" />
        <path
          d="M11 11.5C11 7.6 14.1 5 18 5C21.9 5 25 7.6 25 11.5C25 16.2 21.8 19.8 18 19.8C14.2 19.8 11 16.2 11 11.5Z"
          fill={`url(#g-rose-${uid})`}
          stroke="#FFE4E6"
          strokeWidth="1.1"
          strokeOpacity="0.55"
        />
        <path d="M14.5 10.5C15.8 8.8 20.2 8.8 21.2 11.2C22 13.1 19.4 15 17.5 14C16.2 13.3 16.4 11.5 17.8 11.3" stroke="#FFE4E6" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback neon gift box
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="inline-block shrink-0" aria-hidden="true">
      <rect x="6" y="14" width="24" height="16" rx="4" fill="#8B5CF6" />
      <rect x="4" y="10" width="28" height="6" rx="2.5" fill="#A855F7" />
      <rect x="16" y="10" width="4" height="20" fill="#FACC15" />
    </svg>
  );
}

/**
 * Custom geometric neon gamer avatar crest for users without an HTTP photo URL.
 */
export function CustomAvatarCrest({ seed, size = 18 }: { seed: string; size?: number }) {
  const uid = useId().replace(/:/g, '');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  const themes = [
    ['#7C3AED', '#22D3EE'],
    ['#F43F5E', '#F59E0B'],
    ['#EC4899', '#8B5CF6'],
    ['#10B981', '#06B6D4'],
    ['#F59E0B', '#EF4444'],
  ];
  const [c1, c2] = themes[hash % themes.length];
  const variant = hash % 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className="inline-block shrink-0 rounded-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`av-${uid}`} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13.5" fill={`url(#av-${uid})`} stroke="#FFFFFF" strokeOpacity="0.35" />
      {variant === 0 && (
        // Neon Fox ears
        <path d="M8 10L10.5 6.5L14 9.5L17.5 6.5L20 10L19 18L14 21.5L9 18L8 10Z" fill="#FFFFFF" fillOpacity="0.92" />
      )}
      {variant === 1 && (
        // Neon Lightning Bolt
        <path d="M15.5 5.5L8.5 15H13.8L12.5 22.5L19.5 13H14.2L15.5 5.5Z" fill="#FEF08A" />
      )}
      {variant === 2 && (
        // Four-point Cyber Star
        <path d="M14 5.5L16.3 11.7L22.5 14L16.3 16.3L14 22.5L11.7 16.3L5.5 14L11.7 11.7L14 5.5Z" fill="#FFFFFF" />
      )}
      {variant === 3 && (
        // Cyber Visor Helmet
        <>
          <circle cx="14" cy="14" r="7" fill="#0F172A" fillOpacity="0.55" stroke="#FFFFFF" strokeWidth="1.2" />
          <rect x="8.5" y="11.5" width="11" height="4.2" rx="2" fill="#67E8F9" />
        </>
      )}
    </svg>
  );
}

export function CustomTrophyIcon({ size = 14, className = '' }: IconProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`tr-${uid}`} x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path d="M7 4H17V10C17 12.8 14.8 15 12 15C9.2 15 7 12.8 7 10V4Z" fill={`url(#tr-${uid})`} />
      <path d="M7 6H4.5C4.5 9 5.5 10.5 7 11M17 6H19.5C19.5 9 18.5 10.5 17 11" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 15V19M8.5 20.5H15.5" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CustomBoltIcon({ size = 14, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path d="M13 2L4.5 13.5H11.5L10.5 22L19.5 10.5H12.5L13 2Z" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function CustomSparkIcon({ size = 14, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#67E8F9" stroke="#FFFFFF" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Custom neon vector emblem for each game slug shown in top HUD.
 */
export function CustomGameEmblem({ slug, size = 20 }: { slug: string; size?: number }) {
  const uid = useId().replace(/:/g, '');

  const iconPath = (() => {
    switch (slug) {
      case 'contexto':
        return (
          <>
            <circle cx="12" cy="12" r="7.5" stroke="#67E8F9" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4.2" stroke="#F472B6" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="1.8" fill="#FACC15" />
          </>
        );
      case 'flag-quiz':
      case 'spot-the-country':
        return (
          <>
            <circle cx="12" cy="12" r="7.5" fill="#0EA5E9" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1.8" />
            <path d="M5 12H19M12 4.5C14.5 7 14.5 17 12 19.5M12 4.5C9.5 7 9.5 17 12 19.5" stroke="#BAE6FD" strokeWidth="1.4" />
          </>
        );
      case 'word-reveal':
      case 'secret-word':
        return (
          <>
            <rect x="4.5" y="7" width="6.5" height="10" rx="2" fill="#10B981" />
            <rect x="13" y="7" width="6.5" height="10" rx="2" fill="#F59E0B" />
            <path d="M7.7 13.8V10.2M16.2 13.8V10.2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          </>
        );
      case 'ball-royale':
      case 'land-grab':
        return (
          <>
            <circle cx="9.5" cy="13.5" r="4.5" fill="#EC4899" />
            <circle cx="15" cy="9.5" r="4.5" fill="#22D3EE" fillOpacity="0.85" />
          </>
        );
      case 'snake':
        return (
          <path d="M5.5 16C7.5 16 7.5 8.5 11.5 8.5C15.5 8.5 13 15.5 17.5 15.5C19 15.5 19.5 14 19.5 12.5" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
        );
      case 'fortress-battle':
        return (
          <path d="M6 19V9L9 9V11H11V8H13V11H15V9L18 9V19H6Z" fill="#A78BFA" stroke="#FFFFFF" strokeWidth="1.2" />
        );
      case 'would-you-rather':
      case 'would-you-rather-vs':
        return (
          <path d="M13.5 4L6.5 13.5H12L10.5 20L17.5 10.5H12L13.5 4Z" fill="#F43F5E" stroke="#FDE047" strokeWidth="1.1" strokeLinejoin="round" />
        );
      default:
        return (
          <path d="M12 4.5L14.3 9.7L19.8 10.3L15.6 14L16.9 19.5L12 16.5L7.1 19.5L8.4 14L4.2 10.3L9.7 9.7L12 4.5Z" fill="#FACC15" stroke="#FEF08A" strokeWidth="1" />
        );
    }
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={`ge-${uid}`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6" fill={`url(#ge-${uid})`} />
      {iconPath}
    </svg>
  );
}

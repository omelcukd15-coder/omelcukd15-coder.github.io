export const CF_BACKEND_ORIGIN = 'https://vibeplay-live.omelcukd15.workers.dev';

/**
 * Returns full backend URL when hosted statically on GitHub Pages (*.github.io),
 * and relative path when running locally or directly on Cloudflare Workers.
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return `${CF_BACKEND_ORIGIN}${cleanPath}`;
  }
  return cleanPath;
}

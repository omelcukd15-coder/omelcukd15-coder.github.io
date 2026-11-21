export const CF_BACKEND_ORIGIN = 'https://vibeplay-live.omelcukd15.workers.dev';
export const LOCAL_CONNECTOR_ORIGIN = 'http://localhost:3000';

let resolvedOrigin: string | null = null;
let probePromise: Promise<string> | null = null;

/**
 * Probes whether local Node connector (http://localhost:3000) is running
 * so GitHub Pages can seamlessly use full Node WebSocket connector when on PC,
 * and fall back to Cloudflare Worker edge backend on mobile/remote devices.
 */
export async function resolveBackendOrigin(): Promise<string> {
  if (typeof window === 'undefined') return '';
  if (!window.location.hostname.endsWith('github.io')) return '';
  if (resolvedOrigin !== null) return resolvedOrigin;
  if (probePromise) return probePromise;

  probePromise = (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 700);
      const res = await fetch(`${LOCAL_CONNECTOR_ORIGIN}/api/live/stream?token=probe&mode=json`, {
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        resolvedOrigin = LOCAL_CONNECTOR_ORIGIN;
        return resolvedOrigin;
      }
    } catch {
      // Local server not running on this device; use Cloudflare Edge Worker
    }
    resolvedOrigin = CF_BACKEND_ORIGIN;
    return resolvedOrigin;
  })();

  return probePromise;
}

/**
 * Returns full backend URL when hosted statically on GitHub Pages (*.github.io),
 * and relative path when running locally or directly on Cloudflare Workers.
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return `${resolvedOrigin || CF_BACKEND_ORIGIN}${cleanPath}`;
  }
  return cleanPath;
}

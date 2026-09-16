import { API_BASE_URL } from "./config";

/**
 * Where the live websocket endpoints are served from.
 *
 * They live in the backend itself (`/ws/live`, `/ws/matches/{id}`), so the
 * default is simply the API URL and nothing has to be configured. The two
 * overrides exist for the day that changes:
 *   1. runtime-config.js `LIVE_URL`, written by the container at start-up.
 *   2. `VITE_LIVE_URL`, inlined at build time - `npm run dev` and static hosts.
 *
 * A missing or empty value at either step means "same host as the API". The
 * literal value `off` means "no websocket at all": the live pages then keep
 * polling the API every ten seconds, which is what they did before the socket
 * existed. (`off` rather than an empty string because the container always
 * writes the key, and an operator who left the variable out must get the
 * default, not a silent downgrade to polling.)
 */
export const LIVE_OFF = "off";

const pick = (value: string | undefined): string | null | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.toLowerCase() === LIVE_OFF ? null : trimmed;
};

const resolveLiveBaseUrl = (): string | null => {
  const runtime = pick(window.__SCC_CONFIG__?.LIVE_URL);
  if (runtime !== undefined) return runtime;

  const fromEnv = pick(import.meta.env?.VITE_LIVE_URL as string | undefined);
  if (fromEnv !== undefined) return fromEnv;

  return API_BASE_URL;
};

export const LIVE_BASE_URL: string | null = resolveLiveBaseUrl();

/** False only when the websocket was switched off explicitly. */
export const liveServiceEnabled = (): boolean => LIVE_BASE_URL !== null;

/**
 * The websocket URL for a path such as `/ws/live?seasonId=3`.
 * Returns null when the socket is off, so callers can hand the value straight
 * to `useLiveSocket`, which treats null as "do nothing".
 */
export const liveSocketUrl = (path: string): string | null => {
  if (LIVE_BASE_URL === null) return null;

  const base = LIVE_BASE_URL.replace(/^http/i, "ws").replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
};

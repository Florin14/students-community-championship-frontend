import type { PlayerQr } from "../types/attendance";

const isQrToken = (value: string) => value.length >= 20 && value.length <= 2048
  && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);

export const readPlayerQrHash = (hash: string): { token: string; seasonId: number } | null => {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const token = params.get("qr") ?? "";
  const seasonId = Number(params.get("seasonId"));
  if (!isQrToken(token) || !Number.isSafeInteger(seasonId) || seasonId <= 0) return null;
  return { token, seasonId };
};

export const createPlayerQrUrl = (
  qr: Pick<PlayerQr, "playerId" | "seasonId" | "token">,
  origin = window.location.origin,
): string => {
  const url = new URL(`/players/${qr.playerId}`, origin);
  // A fragment keeps the attendance credential out of HTTP requests/referrers.
  url.hash = new URLSearchParams({ qr: qr.token, seasonId: String(qr.seasonId) }).toString();
  return url.toString();
};

export const extractPlayerQrToken = (value: string): string | null => {
  const input = value.trim();
  // Existing printed QR codes still contain only the signed credential.
  if (isQrToken(input)) return input;
  try {
    const url = new URL(input);
    if (!["https:", "http:"].includes(url.protocol) || !/^\/players\/[1-9]\d*\/?$/.test(url.pathname)) return null;
    return readPlayerQrHash(url.hash)?.token ?? null;
  } catch {
    return null;
  }
};

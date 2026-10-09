import type { Match } from "../types";

export interface MatchReminder {
  match: Match;
  key: string;
  hour: number;
  minutes: number;
}

export const getMatchReminders = (
  matches: Match[],
  dismissed: Record<string, number>
): MatchReminder[] =>
  matches.flatMap((match) => {
    if (
      match.state !== "LIVE" || !match.isClockRunning || match.isLocked ||
      !match.startedAt || match.currentMinute == null
    ) return [];

    // The server labels the opening minute as 1; minute 61 means 60 played.
    const minutes = Math.max(0, match.currentMinute - 1);
    const hour = Math.floor(minutes / 60);
    const key = `${match.id}:${match.startedAt}`;
    if (hour < 1 || hour <= (dismissed[key] ?? 0)) return [];
    return [{ match, key, hour, minutes }];
  }).sort((a, b) => b.minutes - a.minutes || a.match.id - b.match.id);

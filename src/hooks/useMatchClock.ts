import { useEffect, useState } from "react";

export interface MatchClockInput {
  /** Playing time in seconds when the payload was built (running segment included). */
  playedSeconds?: number | null;
  isClockRunning: boolean;
  /** Wall-clock ms (`Date.now()`) when that payload was stored. */
  receivedAt: number;
}

export interface MatchClock {
  /** Playing time right now, in whole seconds. */
  seconds: number;
  /** The football minute, 1-based: 0-59 s is minute 1. */
  minute: number;
  /** `MM:SS`; the minutes keep counting past 59 (`95:12`). */
  label: string;
}

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

/** `41:07` - what the scoreboard shows. */
export const formatClock = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${pad(Math.floor(whole / 60))}:${pad(whole % 60)}`;
};

const playedNow = ({
  playedSeconds,
  isClockRunning,
  receivedAt,
}: MatchClockInput): number => {
  const base = playedSeconds ?? 0;
  if (!isClockRunning || receivedAt <= 0) return base;
  return base + Math.max(0, (Date.now() - receivedAt) / 1000);
};

/**
 * A match clock that ticks once a second while the match is being played.
 *
 * The server says how many seconds had been played when it answered, and the
 * client adds the wall-clock time since that answer arrived. Nothing is ever
 * incremented, so a throttled background timer or a missed tick cannot make
 * the clock drift: every tick recomputes from the same two numbers, and a
 * fresh payload (a goal, a pause) resets them.
 */
export const useMatchClock = (input: MatchClockInput): MatchClock => {
  const { playedSeconds, isClockRunning, receivedAt } = input;
  const [seconds, setSeconds] = useState(() => Math.floor(playedNow(input)));

  useEffect(() => {
    const current = { playedSeconds, isClockRunning, receivedAt };
    setSeconds(Math.floor(playedNow(current)));
    if (!isClockRunning) return undefined;

    const timer = window.setInterval(() => {
      setSeconds(Math.floor(playedNow(current)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playedSeconds, isClockRunning, receivedAt]);

  return {
    seconds,
    minute: Math.floor(seconds / 60) + 1,
    label: formatClock(seconds),
  };
};

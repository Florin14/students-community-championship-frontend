import { useEffect, useRef, useState } from "react";

interface PollingOptions {
  /** Milliseconds between ticks. */
  intervalMs: number;
  /** When false the timer is torn down - nothing live to watch. */
  enabled?: boolean;
  /** Run once immediately instead of waiting a full interval. */
  immediate?: boolean;
}

/**
 * Call `callback` on an interval, but only while the tab is visible.
 *
 * A phone in a pocket or a laptop lid closed should not keep polling, and a tab
 * brought back to the front should refresh at once rather than showing a stale
 * score for up to a full interval.
 */
export const usePolling = (
  callback: () => void,
  { intervalMs, enabled = true, immediate = true }: PollingOptions
): void => {
  // Kept in a ref so a new inline callback each render does not restart the timer.
  const latest = useRef(callback);
  latest.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    let timer: number | undefined;

    const tick = () => latest.current();

    const start = () => {
      if (timer !== undefined) return;
      timer = window.setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timer === undefined) return;
      window.clearInterval(timer);
      timer = undefined;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
        start();
      } else {
        stop();
      }
    };

    if (immediate) tick();
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, immediate, intervalMs]);
};

/**
 * Tracks whether the browser believes it is online.
 *
 * `navigator.onLine` only reports the network interface, not whether the API is
 * reachable, so it decides *when to try* rather than proving a request will
 * succeed. The queue is what actually guarantees nothing is lost.
 */
export const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
};

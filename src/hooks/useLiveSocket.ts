import { useEffect, useRef, useState } from "react";

/** Close codes the live service uses to say "do not come back". */
const CLOSE_FORBIDDEN_ORIGIN = 4403;
const CLOSE_NOT_FOUND = 4404;

const RECONNECT_MIN_MS = 1000;
const RECONNECT_MAX_MS = 30000;

interface ServerEnvelope {
  type?: string;
}

/** Backoff for the n-th consecutive failure, with jitter so a fleet of tabs does not stampede. */
const reconnectDelay = (attempt: number): number => {
  const base = Math.min(RECONNECT_MAX_MS, RECONNECT_MIN_MS * 2 ** attempt);
  return Math.round(base * (0.75 + Math.random() * 0.5));
};

/**
 * Subscribe to one live-service websocket and hand every message to `onMessage`.
 *
 * - `url` null = nothing happens; that is how a page runs without a live service.
 * - Reconnects with exponential backoff, except after close codes 4403 / 4404,
 *   which mean the server will refuse again.
 * - Answers the service's `ping` with a `pong`; those never reach `onMessage`.
 * - Mirrors usePolling's visibility rule: the socket is closed while the tab is
 *   hidden and reopened as soon as it is visible, so a phone in a pocket holds
 *   no connection open.
 *
 * `connected` is what the caller uses to switch polling on as a fallback.
 */
export const useLiveSocket = <T,>(
  url: string | null,
  onMessage: (message: T) => void
): { connected: boolean } => {
  const [connected, setConnected] = useState(false);
  // Kept in a ref so a new inline handler each render does not reconnect.
  const latest = useRef(onMessage);
  latest.current = onMessage;

  useEffect(() => {
    if (!url) {
      setConnected(false);
      return undefined;
    }

    let socket: WebSocket | null = null;
    let timer: number | undefined;
    let attempt = 0;
    let disposed = false;
    let refused = false;

    const clearTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };

    const closeSocket = () => {
      if (!socket) return;
      const current = socket;
      // Detach first so the close handler does not schedule a reconnect.
      socket = null;
      current.onopen = null;
      current.onmessage = null;
      current.onclose = null;
      current.onerror = null;
      try {
        current.close();
      } catch {
        // already closing - nothing to do
      }
    };

    const scheduleReconnect = () => {
      if (disposed || refused) return;
      if (document.visibilityState !== "visible") return;
      clearTimer();
      timer = window.setTimeout(() => {
        timer = undefined;
        connect();
      }, reconnectDelay(attempt));
      attempt += 1;
    };

    const connect = () => {
      if (disposed || refused || socket) return;
      if (document.visibilityState !== "visible") return;

      let next: WebSocket;
      try {
        next = new WebSocket(url);
      } catch {
        // A malformed URL throws synchronously; nothing to retry.
        refused = true;
        return;
      }
      socket = next;

      next.onopen = () => {
        if (socket !== next) return;
        attempt = 0;
        setConnected(true);
      };

      next.onmessage = (event: MessageEvent) => {
        if (socket !== next) return;
        let parsed: ServerEnvelope & T;
        try {
          parsed = JSON.parse(String(event.data)) as ServerEnvelope & T;
        } catch {
          return;
        }
        if (parsed?.type === "ping") {
          try {
            next.send(JSON.stringify({ type: "pong" }));
          } catch {
            // the socket is on its way out; the close handler takes over
          }
          return;
        }
        latest.current(parsed);
      };

      next.onclose = (event: CloseEvent) => {
        if (socket !== next) return;
        socket = null;
        setConnected(false);
        if (
          event.code === CLOSE_FORBIDDEN_ORIGIN ||
          event.code === CLOSE_NOT_FOUND
        ) {
          refused = true;
          return;
        }
        scheduleReconnect();
      };

      // The browser logs the failed handshake itself; a second line here
      // would only double the noise. onclose follows and schedules the retry.
      next.onerror = () => undefined;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        attempt = 0;
        connect();
      } else {
        clearTimer();
        closeSocket();
        setConnected(false);
      }
    };

    const onOnline = () => {
      clearTimer();
      attempt = 0;
      connect();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);
    connect();

    return () => {
      disposed = true;
      clearTimer();
      closeSocket();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
      setConnected(false);
    };
  }, [url]);

  return { connected };
};

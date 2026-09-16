import { useCallback } from "react";

import { liveSocketUrl } from "../api/liveConfig";
import { useAppDispatch } from "../store/hooks";
import { liveSnapshotReceived } from "../store/slices/liveSlice";
import { fetchLiveMatches } from "../store/slices/thunks/liveThunks";
import type { LiveMatchesResponse } from "../types";
import { useLiveSocket } from "./useLiveSocket";
import { usePolling } from "./usePolling";

/** How often the public pages ask for the live feed when no socket is open. */
export const LIVE_POLL_MS = 10000;

interface LiveSnapshotMessage extends Partial<LiveMatchesResponse> {
  type: string;
}

/**
 * Keep the `live` slice current for whichever component is showing it.
 *
 * Two sources feed the same reducer. The live service pushes a snapshot over a
 * websocket the moment something changes; while that socket is not open - no
 * service configured, service down, tab just loaded - the page polls the API
 * every ten seconds exactly as it did before the service existed. The switch
 * is `connected`: polling is enabled only while the socket is not.
 *
 * Both LiveStrip and LiveScores call this; they share one slice, and the
 * socket hook opens one connection per caller, which is fine at two.
 */
export const useLiveFeed = (seasonId?: number): { realtime: boolean } => {
  const dispatch = useAppDispatch();

  const path =
    seasonId !== undefined ? `/ws/live?seasonId=${seasonId}` : "/ws/live";

  const onMessage = useCallback(
    (message: LiveSnapshotMessage) => {
      if (message.type !== "snapshot" || !message.data) return;
      dispatch(
        liveSnapshotReceived({
          data: message.data,
          revision: message.revision ?? "",
        })
      );
    },
    [dispatch]
  );

  const { connected } = useLiveSocket<LiveSnapshotMessage>(
    liveSocketUrl(path),
    onMessage
  );

  usePolling(
    () => void dispatch(fetchLiveMatches(seasonId ? { seasonId } : undefined)),
    { intervalMs: LIVE_POLL_MS, enabled: !connected }
  );

  return { realtime: connected };
};

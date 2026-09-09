import type { MatchEventInput } from "../types";
import { EVENT_QUEUE_STORAGE_KEY } from "./storageKeys";

/**
 * Local queue of scoring actions that have not been acknowledged by the server.
 *
 * Section 7 of the implementation plan: an action gets an id before it is sent,
 * unconfirmed actions stay in the browser, and they are retransmitted once the
 * connection returns. The queue survives a reload because the phone losing
 * signal and the operator reloading the page are the same afternoon.
 */

export type QueuedEventStatus = "pending" | "failed";

export interface QueuedEvent {
  clientEventId: string;
  matchId: number;
  payload: MatchEventInput;
  status: QueuedEventStatus;
  attempts: number;
  /** Why the last attempt failed, shown next to the entry. */
  error?: string | null;
  queuedAt: string;
}

/** A UUID even where crypto.randomUUID is unavailable (older mobile browsers). */
export const newClientEventId = (): string => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to the manual path
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const readQueue = (): QueuedEvent[] => {
  try {
    const raw = localStorage.getItem(EVENT_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeQueue = (queue: QueuedEvent[]): void => {
  try {
    localStorage.setItem(EVENT_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable: the queue stays in memory for this session.
  }
};

export const queueForMatch = (
  queue: QueuedEvent[],
  matchId: number
): QueuedEvent[] => queue.filter((entry) => entry.matchId === matchId);

/**
 * True when the request never reached the server, so retrying is worthwhile.
 * A rejection the server issued deliberately (a 4xx) must not be retried - it
 * would fail identically every time and hide the real problem from the operator.
 */
export const isRetryable = (status?: number): boolean =>
  status === undefined || status === 0 || status >= 500;

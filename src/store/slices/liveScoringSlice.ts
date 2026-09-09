import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Match, MatchDetails, MatchEvent } from "../../types";
import {
  readQueue,
  writeQueue,
  type QueuedEvent,
} from "../../utils/eventQueue";
import {
  fetchMyMatches,
  fetchScoringEvents,
  fetchScoringMatch,
  finishMatchThunk,
  pauseMatchThunk,
  reopenMatchThunk,
  resumeMatchThunk,
  startMatchThunk,
  submitEvent,
  undoLastEvent,
  voidEvent,
} from "./thunks/liveScoringThunks";

interface LiveScoringState {
  myMatches: Match[];
  match: MatchDetails | null;
  events: MatchEvent[];
  /** Actions the server has not acknowledged yet. Mirrored to localStorage. */
  queue: QueuedEvent[];
  loading: boolean;
  /** A lifecycle action is in flight; the console disables its controls. */
  busy: boolean;
  error: string | null;
}

const initialState: LiveScoringState = {
  myMatches: [],
  match: null,
  events: [],
  queue: readQueue(),
  loading: false,
  busy: false,
  error: null,
};

/** Persist after every queue mutation: an unsent goal must survive a reload. */
const persist = (state: LiveScoringState) => {
  writeQueue(state.queue);
};

const upsertEvent = (state: LiveScoringState, event: MatchEvent) => {
  const index = state.events.findIndex((item) => item.id === event.id);
  if (index >= 0) {
    state.events[index] = event;
  } else {
    state.events.push(event);
  }
};

const applyScore = (
  state: LiveScoringState,
  scoreHome?: number | null,
  scoreAway?: number | null,
  currentMinute?: number | null
) => {
  if (!state.match) return;
  if (scoreHome !== undefined) state.match.scoreHome = scoreHome;
  if (scoreAway !== undefined) state.match.scoreAway = scoreAway;
  if (currentMinute !== undefined && currentMinute !== null) {
    state.match.currentMinute = currentMinute;
  }
};

const applyMatch = (state: LiveScoringState, match: MatchDetails) => {
  state.match = match;
  state.events = match.events ?? state.events;
  const index = state.myMatches.findIndex((item) => item.id === match.id);
  if (index >= 0) {
    state.myMatches[index] = { ...state.myMatches[index], ...match };
  }
};

const liveScoringSlice = createSlice({
  name: "liveScoring",
  initialState,
  reducers: {
    /** Record the action locally *before* sending it. */
    enqueueEvent: (state, action: PayloadAction<QueuedEvent>) => {
      state.queue.push(action.payload);
      persist(state);
    },
    markQueueEntryFailed: (
      state,
      action: PayloadAction<{ clientEventId: string; error: string }>
    ) => {
      const entry = state.queue.find(
        (item) => item.clientEventId === action.payload.clientEventId
      );
      if (entry) {
        entry.status = "failed";
        entry.error = action.payload.error;
        entry.attempts += 1;
      }
      persist(state);
    },
    retryQueueEntry: (state, action: PayloadAction<string>) => {
      const entry = state.queue.find(
        (item) => item.clientEventId === action.payload
      );
      if (entry) {
        entry.status = "pending";
        entry.error = null;
      }
      persist(state);
    },
    discardQueueEntry: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(
        (item) => item.clientEventId !== action.payload
      );
      persist(state);
    },
    clearScoringError: (state) => {
      state.error = null;
    },
    resetScoring: (state) => {
      state.match = null;
      state.events = [];
      state.error = null;
      state.busy = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.myMatches = action.payload ?? [];
      })
      .addCase(fetchMyMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load your matches";
      })

      .addCase(fetchScoringMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScoringMatch.fulfilled, (state, action) => {
        state.loading = false;
        applyMatch(state, action.payload);
      })
      .addCase(fetchScoringMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load the match";
      })

      .addCase(fetchScoringEvents.fulfilled, (state, action) => {
        state.events = action.payload ?? [];
      })

      .addCase(submitEvent.fulfilled, (state, action) => {
        // Acknowledged, so it leaves the queue whether it was a first attempt
        // or a retry the server recognised.
        state.queue = state.queue.filter(
          (item) => item.clientEventId !== action.payload.clientEventId
        );
        persist(state);
        upsertEvent(state, action.payload.event);
        applyScore(
          state,
          action.payload.scoreHome,
          action.payload.scoreAway,
          action.payload.currentMinute
        );
      })
      .addCase(submitEvent.rejected, (state, action) => {
        const failure = action.payload;
        if (!failure) return;
        const entry = state.queue.find(
          (item) => item.clientEventId === failure.clientEventId
        );
        if (entry) {
          entry.attempts += 1;
          // A rejection the server issued deliberately will not succeed on a
          // retry, so it is marked failed and shown to the operator instead of
          // being resent forever.
          entry.status = failure.retryable ? "pending" : "failed";
          entry.error = failure.message;
        }
        persist(state);
        if (!failure.retryable) {
          state.error = failure.message;
        }
      })

      .addCase(undoLastEvent.fulfilled, (state, action) => {
        upsertEvent(state, action.payload.event);
        applyScore(
          state,
          action.payload.scoreHome,
          action.payload.scoreAway,
          action.payload.currentMinute
        );
      })
      .addCase(undoLastEvent.rejected, (state, action) => {
        state.error = action.payload ?? "Nothing could be undone";
      })

      .addCase(voidEvent.fulfilled, (state, action) => {
        upsertEvent(state, action.payload.event);
        applyScore(
          state,
          action.payload.scoreHome,
          action.payload.scoreAway,
          action.payload.currentMinute
        );
      })
      .addCase(voidEvent.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to cancel the event";
      });

    // The five lifecycle actions all return the refreshed match.
    [
      startMatchThunk,
      pauseMatchThunk,
      resumeMatchThunk,
      finishMatchThunk,
      reopenMatchThunk,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.busy = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.busy = false;
          applyMatch(state, action.payload);
        })
        .addCase(thunk.rejected, (state, action) => {
          state.busy = false;
          state.error = (action.payload as string) ?? "Action failed";
        });
    });
  },
});

export const {
  clearScoringError,
  discardQueueEntry,
  enqueueEvent,
  markQueueEntryFailed,
  resetScoring,
  retryQueueEntry,
} = liveScoringSlice.actions;

export default liveScoringSlice.reducer;

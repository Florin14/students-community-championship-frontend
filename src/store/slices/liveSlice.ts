import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { LiveMatch, LiveMatchesResponse } from "../../types";
import { fetchLiveMatches } from "./thunks/liveThunks";

interface LiveState {
  matches: LiveMatch[];
  /** Last fingerprint seen; an unchanged one means nothing needs re-rendering. */
  revision: string;
  /** Wall-clock ms when `matches` was last replaced - the clocks tick on from it. */
  receivedAt: number;
  /** True once a first response has arrived, so the UI can tell empty from unknown. */
  ready: boolean;
  error: string | null;
}

const initialState: LiveState = {
  matches: [],
  revision: "",
  receivedAt: 0,
  ready: false,
  error: null,
};

/**
 * Apply one feed payload, wherever it came from. The websocket snapshot and the
 * polled response have the same shape, so both paths share this one rule:
 * replacing the array on an unchanged revision would re-render every
 * subscriber for nothing.
 */
const applySnapshot = (
  state: LiveState,
  payload: Pick<LiveMatchesResponse, "data" | "revision">
) => {
  state.ready = true;
  state.error = null;
  if (payload.revision !== state.revision) {
    state.revision = payload.revision;
    state.matches = payload.data ?? [];
    state.receivedAt = Date.now();
  }
};

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {
    /** A snapshot pushed by the live service over its websocket. */
    liveSnapshotReceived: (
      state,
      action: PayloadAction<Pick<LiveMatchesResponse, "data" | "revision">>
    ) => {
      applySnapshot(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveMatches.fulfilled, (state, action) => {
        applySnapshot(state, action.payload);
      })
      .addCase(fetchLiveMatches.rejected, (state, action) => {
        // A failed poll keeps the last good data on screen; the next tick retries.
        state.ready = true;
        state.error = action.payload ?? "Failed to load the live matches";
      });
  },
});

export const { liveSnapshotReceived } = liveSlice.actions;
export default liveSlice.reducer;

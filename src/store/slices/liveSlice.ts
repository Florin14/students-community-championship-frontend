import { createSlice } from "@reduxjs/toolkit";

import type { LiveMatch } from "../../types";
import { fetchLiveMatches } from "./thunks/liveThunks";

interface LiveState {
  matches: LiveMatch[];
  /** Last fingerprint seen; an unchanged one means nothing needs re-rendering. */
  revision: string;
  /** True once a first response has arrived, so the UI can tell empty from unknown. */
  ready: boolean;
  error: string | null;
}

const initialState: LiveState = {
  matches: [],
  revision: "",
  ready: false,
  error: null,
};

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveMatches.fulfilled, (state, action) => {
        state.ready = true;
        state.error = null;
        // Replacing the array on an unchanged revision would re-render every
        // subscriber on a poll where nothing happened.
        if (action.payload.revision !== state.revision) {
          state.revision = action.payload.revision;
          state.matches = action.payload.data ?? [];
        }
      })
      .addCase(fetchLiveMatches.rejected, (state, action) => {
        // A failed poll keeps the last good data on screen; the next tick retries.
        state.ready = true;
        state.error = action.payload ?? "Failed to load the live matches";
      });
  },
});

export default liveSlice.reducer;

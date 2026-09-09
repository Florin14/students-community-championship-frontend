import { createSlice } from "@reduxjs/toolkit";

import type { Standing } from "../../types";
import { fetchStandings } from "./thunks/standingsThunks";

interface StandingsState {
  standings: Standing[];
  loading: boolean;
  error: string | null;
}

const initialState: StandingsState = {
  standings: [],
  loading: false,
  error: null,
};

const standingsSlice = createSlice({
  name: "standings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStandings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandings.fulfilled, (state, action) => {
        state.loading = false;
        state.standings = action.payload || [];
      })
      .addCase(fetchStandings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch standings";
      });
  },
});

export default standingsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

import type { GoalsPerRound, StatsOverview, TopPlayer } from "../../types";
import {
  fetchDiscipline,
  fetchGoalsPerRound,
  fetchOverview,
  fetchTopAssists,
  fetchTopScorers,
} from "./thunks/statsThunks";

interface StatsState {
  overview: StatsOverview | null;
  topScorers: TopPlayer[];
  topAssists: TopPlayer[];
  discipline: TopPlayer[];
  goalsPerRound: GoalsPerRound[];
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  overview: null,
  topScorers: [],
  topAssists: [],
  discipline: [],
  goalsPerRound: [],
  loading: false,
  error: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch overview";
      })
      .addCase(fetchTopScorers.fulfilled, (state, action) => {
        state.topScorers = action.payload || [];
      })
      .addCase(fetchTopAssists.fulfilled, (state, action) => {
        state.topAssists = action.payload || [];
      })
      .addCase(fetchDiscipline.fulfilled, (state, action) => {
        state.discipline = action.payload || [];
      })
      .addCase(fetchGoalsPerRound.fulfilled, (state, action) => {
        state.goalsPerRound = action.payload || [];
      });
  },
});

export default statsSlice.reducer;

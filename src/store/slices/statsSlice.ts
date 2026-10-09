import { createSlice } from "@reduxjs/toolkit";

import type { AudienceStatistics, GoalsPerRound, StatsOverview, TopPlayer } from "../../types";
import {
  fetchDiscipline,
  fetchAudienceStats,
  fetchGoalsPerRound,
  fetchOverview,
  fetchTopAssists,
  fetchTopScorers,
} from "./thunks/statsThunks";

interface StatsState {
  audience: AudienceStatistics | null;
  audienceLoading: boolean;
  audienceError: string | null;
  audienceRequestId: string | null;
  overview: StatsOverview | null;
  overviewRequestId: string | null;
  topScorers: TopPlayer[];
  topAssists: TopPlayer[];
  discipline: TopPlayer[];
  goalsPerRound: GoalsPerRound[];
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  audience: null,
  audienceLoading: false,
  audienceError: null,
  audienceRequestId: null,
  overview: null,
  overviewRequestId: null,
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
      .addCase(fetchAudienceStats.pending, (state, action) => {
        state.audienceRequestId = action.meta.requestId;
        state.audienceLoading = true;
        state.audienceError = null;
        state.audience = null;
      })
      .addCase(fetchAudienceStats.fulfilled, (state, action) => {
        if (state.audienceRequestId !== action.meta.requestId) return;
        state.audienceLoading = false;
        state.audience = action.payload;
      })
      .addCase(fetchAudienceStats.rejected, (state, action) => {
        if (state.audienceRequestId !== action.meta.requestId) return;
        state.audienceLoading = false;
        if (!action.meta.aborted) state.audienceError = action.payload ?? "stats.audienceError";
      });
    builder
      .addCase(fetchOverview.pending, (state, action) => {
        state.overviewRequestId = action.meta.requestId;
        state.overview = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        if (state.overviewRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        if (state.overviewRequestId !== action.meta.requestId) return;
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

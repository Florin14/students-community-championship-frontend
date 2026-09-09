import { createSlice } from "@reduxjs/toolkit";

import type { Match, MatchDetails } from "../../types";
import {
  addMatchThunk,
  deleteMatchThunk,
  fetchMatchById,
  fetchMatches,
  setMatchOperatorsThunk,
  updateMatchThunk,
} from "./thunks/matchesThunks";

interface MatchesState {
  matches: Match[];
  selectedMatch: MatchDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: MatchesState = {
  matches: [],
  selectedMatch: null,
  loading: false,
  error: null,
};

const setLoading = (state: MatchesState) => {
  state.loading = true;
  state.error = null;
};

const setError = (
  state: MatchesState,
  payload: string | undefined,
  fallback: string
) => {
  state.loading = false;
  state.error = payload ?? fallback;
};

const upsertMatch = (state: MatchesState, match: Match) => {
  const index = state.matches.findIndex((m) => m.id === match.id);
  if (index >= 0) {
    state.matches[index] = { ...state.matches[index], ...match };
  } else {
    state.matches.push(match);
  }
};

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    clearSelectedMatch: (state) => {
      state.selectedMatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, setLoading)
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload || [];
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch matches");
      })
      .addCase(fetchMatchById.pending, setLoading)
      .addCase(fetchMatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMatch = action.payload;
      })
      .addCase(fetchMatchById.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch match");
      })
      .addCase(addMatchThunk.fulfilled, (state, action) => {
        upsertMatch(state, action.payload);
      })
      .addCase(updateMatchThunk.fulfilled, (state, action) => {
        upsertMatch(state, action.payload);
        if (state.selectedMatch?.id === action.payload.id) {
          state.selectedMatch = { ...state.selectedMatch, ...action.payload };
        }
      })
      .addCase(setMatchOperatorsThunk.fulfilled, (state, action) => {
        upsertMatch(state, action.payload);
        state.selectedMatch = action.payload;
      })
      .addCase(deleteMatchThunk.fulfilled, (state, action) => {
        state.matches = state.matches.filter((m) => m.id !== action.payload);
        if (state.selectedMatch?.id === action.payload) {
          state.selectedMatch = null;
        }
      });
  },
});

export const { clearSelectedMatch } = matchesSlice.actions;
export default matchesSlice.reducer;

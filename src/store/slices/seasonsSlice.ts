import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { Season } from "../../types";
import {
  addSeasonThunk,
  deleteSeasonThunk,
  fetchActiveSeason,
  fetchSeasons,
  updateSeasonThunk,
} from "./thunks/seasonsThunks";

interface SeasonsState {
  seasons: Season[];
  activeSeason: Season | null;
  selectedSeasonId: number | null;
  // true once the active season lookup settled; pages fetch only after that
  ready: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: SeasonsState = {
  seasons: [],
  activeSeason: null,
  selectedSeasonId: null,
  ready: false,
  loading: false,
  error: null,
};

const setLoading = (state: SeasonsState) => {
  state.loading = true;
  state.error = null;
};

const setError = (
  state: SeasonsState,
  payload: string | undefined,
  fallback: string
) => {
  state.loading = false;
  state.error = payload ?? fallback;
};

const seasonsSlice = createSlice({
  name: "seasons",
  initialState,
  reducers: {
    setSelectedSeasonId: (state, action: PayloadAction<number | null>) => {
      state.selectedSeasonId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeasons.pending, setLoading)
      .addCase(fetchSeasons.fulfilled, (state, action) => {
        state.loading = false;
        state.seasons = action.payload || [];
        if (
          state.selectedSeasonId !== null &&
          !state.seasons.some((s) => s.id === state.selectedSeasonId)
        ) {
          state.selectedSeasonId = null;
        }
      })
      .addCase(fetchSeasons.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch seasons");
      })
      .addCase(fetchActiveSeason.fulfilled, (state, action) => {
        state.activeSeason = action.payload;
        state.ready = true;
        if (state.selectedSeasonId === null) {
          state.selectedSeasonId = action.payload.id;
        }
      })
      .addCase(fetchActiveSeason.rejected, (state) => {
        state.ready = true;
      })
      .addCase(addSeasonThunk.fulfilled, (state, action) => {
        state.seasons.unshift(action.payload);
      })
      .addCase(updateSeasonThunk.fulfilled, (state, action) => {
        const index = state.seasons.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index >= 0) state.seasons[index] = action.payload;
        if (state.activeSeason?.id === action.payload.id) {
          state.activeSeason = action.payload;
        }
      })
      .addCase(deleteSeasonThunk.fulfilled, (state, action) => {
        state.seasons = state.seasons.filter((s) => s.id !== action.payload);
        if (state.selectedSeasonId === action.payload) {
          state.selectedSeasonId = null;
        }
        if (state.activeSeason?.id === action.payload) {
          state.activeSeason = null;
        }
      });
  },
});

export const { setSelectedSeasonId } = seasonsSlice.actions;
export default seasonsSlice.reducer;

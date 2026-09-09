import { createSlice } from "@reduxjs/toolkit";

import type { Team } from "../../types";
import {
  addTeamThunk,
  deleteTeamThunk,
  fetchTeamById,
  fetchTeams,
  updateTeamThunk,
} from "./thunks/teamsThunks";

interface TeamsState {
  teams: Team[];
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  selectedTeam: null,
  loading: false,
  error: null,
};

const setLoading = (state: TeamsState) => {
  state.loading = true;
  state.error = null;
};

const setError = (
  state: TeamsState,
  payload: string | undefined,
  fallback: string
) => {
  state.loading = false;
  state.error = payload ?? fallback;
};

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, setLoading)
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload || [];
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch teams");
      })
      .addCase(fetchTeamById.pending, setLoading)
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch team");
      })
      .addCase(addTeamThunk.fulfilled, (state, action) => {
        state.teams.push(action.payload);
        state.teams.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateTeamThunk.fulfilled, (state, action) => {
        const index = state.teams.findIndex((t) => t.id === action.payload.id);
        if (index >= 0) state.teams[index] = action.payload;
        if (state.selectedTeam?.id === action.payload.id) {
          state.selectedTeam = action.payload;
        }
      })
      .addCase(deleteTeamThunk.fulfilled, (state, action) => {
        state.teams = state.teams.filter((t) => t.id !== action.payload);
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = null;
        }
      });
  },
});

export const { clearSelectedTeam } = teamsSlice.actions;
export default teamsSlice.reducer;

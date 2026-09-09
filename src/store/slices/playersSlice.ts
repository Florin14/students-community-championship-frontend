import { createSlice } from "@reduxjs/toolkit";

import type { Player, PlayerEvent } from "../../types";
import {
  addPlayerThunk,
  deletePlayerThunk,
  fetchPlayerById,
  fetchPlayerEvents,
  fetchPlayers,
  updatePlayerThunk,
} from "./thunks/playersThunks";

interface PlayersState {
  players: Player[];
  selectedPlayer: Player | null;
  selectedPlayerEvents: PlayerEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: PlayersState = {
  players: [],
  selectedPlayer: null,
  selectedPlayerEvents: [],
  loading: false,
  error: null,
};

const setLoading = (state: PlayersState) => {
  state.loading = true;
  state.error = null;
};

const setError = (
  state: PlayersState,
  payload: string | undefined,
  fallback: string
) => {
  state.loading = false;
  state.error = payload ?? fallback;
};

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    clearSelectedPlayer: (state) => {
      state.selectedPlayer = null;
      state.selectedPlayerEvents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, setLoading)
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload || [];
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch players");
      })
      .addCase(fetchPlayerById.pending, setLoading)
      .addCase(fetchPlayerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlayer = action.payload;
      })
      .addCase(fetchPlayerById.rejected, (state, action) => {
        setError(state, action.payload, "Failed to fetch player");
      })
      .addCase(fetchPlayerEvents.fulfilled, (state, action) => {
        state.selectedPlayerEvents = action.payload || [];
      })
      .addCase(addPlayerThunk.fulfilled, (state, action) => {
        state.players.push(action.payload);
        state.players.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updatePlayerThunk.fulfilled, (state, action) => {
        const index = state.players.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index >= 0) state.players[index] = action.payload;
        if (state.selectedPlayer?.id === action.payload.id) {
          state.selectedPlayer = action.payload;
        }
      })
      .addCase(deletePlayerThunk.fulfilled, (state, action) => {
        state.players = state.players.filter((p) => p.id !== action.payload);
        if (state.selectedPlayer?.id === action.payload) {
          state.selectedPlayer = null;
        }
      });
  },
});

export const { clearSelectedPlayer } = playersSlice.actions;
export default playersSlice.reducer;

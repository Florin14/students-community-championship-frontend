import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { Player, PlayerEvent, PlayerPayload } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const fetchPlayers = createAsyncThunk<
  Player[],
  { teamId?: number; seasonId?: number; search?: string } | void,
  { rejectValue: string }
>("players/fetchAll", async (params, thunkAPI) => {
  try {
    const response = await api.get<{ data: Player[] }>("/players/", {
      params: params ?? {},
    });
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch players")
    );
  }
});

export const fetchPlayerById = createAsyncThunk<
  Player,
  { id: number; seasonId?: number },
  { rejectValue: string }
>("players/fetchById", async ({ id, seasonId }, thunkAPI) => {
  try {
    const response = await api.get<Player>(`/players/${id}`, {
      params: seasonId ? { seasonId } : undefined,
    });
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch player")
    );
  }
});

export const fetchPlayerEvents = createAsyncThunk<
  PlayerEvent[],
  { id: number },
  { rejectValue: string }
>("players/fetchEvents", async ({ id }, thunkAPI) => {
  try {
    const response = await api.get<{ data: PlayerEvent[] }>(
      `/players/${id}/events`
    );
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch player events")
    );
  }
});

export const addPlayerThunk = createAsyncThunk<
  Player,
  PlayerPayload,
  { rejectValue: string }
>("players/add", async (payload, thunkAPI) => {
  try {
    const response = await api.post<Player>("/players/", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to add player")
    );
  }
});

export const updatePlayerThunk = createAsyncThunk<
  Player,
  { id: number; data: Partial<PlayerPayload> },
  { rejectValue: string }
>("players/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<Player>(`/players/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update player")
    );
  }
});

export const deletePlayerThunk = createAsyncThunk<
  number,
  { id: number },
  { rejectValue: string }
>("players/delete", async ({ id }, thunkAPI) => {
  try {
    await api.delete(`/players/${id}`);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete player")
    );
  }
});

import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type {
  Match,
  MatchDetails,
  MatchPayload,
  MatchResultPayload,
  MatchState,
  MatchUpdatePayload,
} from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export interface MatchesFilter {
  seasonId?: number;
  teamId?: number;
  round?: number;
  state?: MatchState;
}

export const fetchMatches = createAsyncThunk<
  Match[],
  MatchesFilter | void,
  { rejectValue: string }
>("matches/fetchAll", async (params, thunkAPI) => {
  try {
    const response = await api.get<{ data: Match[] }>("/matches/", {
      params: params ?? {},
    });
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch matches")
    );
  }
});

export const fetchMatchById = createAsyncThunk<
  MatchDetails,
  { id: number },
  { rejectValue: string }
>("matches/fetchById", async ({ id }, thunkAPI) => {
  try {
    const response = await api.get<MatchDetails>(`/matches/${id}`);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch match")
    );
  }
});

export const addMatchThunk = createAsyncThunk<
  Match,
  MatchPayload,
  { rejectValue: string }
>("matches/add", async (payload, thunkAPI) => {
  try {
    const response = await api.post<Match>("/matches/", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to add match")
    );
  }
});

export const updateMatchThunk = createAsyncThunk<
  Match,
  { id: number; data: MatchUpdatePayload },
  { rejectValue: string }
>("matches/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<Match>(`/matches/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update match")
    );
  }
});

export const setMatchResultThunk = createAsyncThunk<
  MatchDetails,
  { id: number; data: MatchResultPayload },
  { rejectValue: string }
>("matches/setResult", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<MatchDetails>(
      `/matches/${id}/result`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to save the match result")
    );
  }
});

export const deleteMatchThunk = createAsyncThunk<
  number,
  { id: number },
  { rejectValue: string }
>("matches/delete", async ({ id }, thunkAPI) => {
  try {
    await api.delete(`/matches/${id}`);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete match")
    );
  }
});

import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { Season, SeasonPayload } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const fetchSeasons = createAsyncThunk<
  Season[],
  void,
  { rejectValue: string }
>("seasons/fetchAll", async (_, thunkAPI) => {
  try {
    const response = await api.get<{ data: Season[] }>("/seasons/");
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch seasons")
    );
  }
});

export const fetchActiveSeason = createAsyncThunk<
  Season,
  void,
  { rejectValue: string }
>("seasons/fetchActive", async (_, thunkAPI) => {
  try {
    const response = await api.get<Season>("/seasons/active");
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch active season")
    );
  }
});

export const addSeasonThunk = createAsyncThunk<
  Season,
  SeasonPayload,
  { rejectValue: string }
>("seasons/add", async (payload, thunkAPI) => {
  try {
    const response = await api.post<Season>("/seasons/", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to add season")
    );
  }
});

export const updateSeasonThunk = createAsyncThunk<
  Season,
  { id: number; data: Partial<SeasonPayload> },
  { rejectValue: string }
>("seasons/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<Season>(`/seasons/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update season")
    );
  }
});

export const deleteSeasonThunk = createAsyncThunk<
  number,
  { id: number },
  { rejectValue: string }
>("seasons/delete", async ({ id }, thunkAPI) => {
  try {
    await api.delete(`/seasons/${id}`);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete season")
    );
  }
});

export const setSeasonTeamsThunk = createAsyncThunk<
  void,
  { seasonId: number; teamIds: number[] },
  { rejectValue: string }
>("seasons/setTeams", async ({ seasonId, teamIds }, thunkAPI) => {
  try {
    await api.post(`/seasons/${seasonId}/teams`, { teamIds });
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to enroll teams")
    );
  }
});

export const removeSeasonTeamThunk = createAsyncThunk<
  void,
  { seasonId: number; teamId: number },
  { rejectValue: string }
>("seasons/removeTeam", async ({ seasonId, teamId }, thunkAPI) => {
  try {
    await api.delete(`/seasons/${seasonId}/teams/${teamId}`);
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to remove team from season")
    );
  }
});

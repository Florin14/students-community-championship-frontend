import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { Team, TeamPayload } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const fetchTeamDirectory = createAsyncThunk<Team[], void, { rejectValue: string }>(
  "teams/fetchDirectory", async (_, thunkAPI) => {
    try {
      return (await api.get<{ data: Team[] }>("/teams/")).data.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to fetch teams"));
    }
  }
);

export const fetchTeams = createAsyncThunk<
  Team[],
  { seasonId?: number; search?: string } | void,
  { rejectValue: string }
>("teams/fetchAll", async (params, thunkAPI) => {
  try {
    const response = await api.get<{ data: Team[] }>("/teams/", {
      params: params ?? {},
    });
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch teams")
    );
  }
});

export const fetchTeamById = createAsyncThunk<
  Team,
  { id: number },
  { rejectValue: string }
>("teams/fetchById", async ({ id }, thunkAPI) => {
  try {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch team")
    );
  }
});

export const addTeamThunk = createAsyncThunk<
  Team,
  TeamPayload,
  { rejectValue: string }
>("teams/add", async (payload, thunkAPI) => {
  try {
    const response = await api.post<Team>("/teams/", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to add team")
    );
  }
});

export const updateTeamThunk = createAsyncThunk<
  Team,
  { id: number; data: Partial<TeamPayload> },
  { rejectValue: string }
>("teams/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<Team>(`/teams/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update team")
    );
  }
});

export const deleteTeamThunk = createAsyncThunk<
  number,
  { id: number },
  { rejectValue: string }
>("teams/delete", async ({ id }, thunkAPI) => {
  try {
    await api.delete(`/teams/${id}`);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete team")
    );
  }
});

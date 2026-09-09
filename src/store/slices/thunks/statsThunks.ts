import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { GoalsPerRound, StatsOverview, TopPlayer } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

interface StatsParams {
  seasonId?: number;
  limit?: number;
}

const listThunk = (name: string, path: string) =>
  createAsyncThunk<TopPlayer[], StatsParams | void, { rejectValue: string }>(
    name,
    async (params, thunkAPI) => {
      try {
        const response = await api.get<{ data: TopPlayer[] }>(path, {
          params: params ?? {},
        });
        return response.data.data;
      } catch (error: unknown) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(error, "Failed to fetch stats")
        );
      }
    }
  );

export const fetchTopScorers = listThunk(
  "stats/fetchTopScorers",
  "/stats/top-scorers"
);
export const fetchTopAssists = listThunk(
  "stats/fetchTopAssists",
  "/stats/top-assists"
);
export const fetchDiscipline = listThunk(
  "stats/fetchDiscipline",
  "/stats/discipline"
);

export const fetchOverview = createAsyncThunk<
  StatsOverview,
  StatsParams | void,
  { rejectValue: string }
>("stats/fetchOverview", async (params, thunkAPI) => {
  try {
    const response = await api.get<StatsOverview>("/stats/overview", {
      params: params ?? {},
    });
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch overview")
    );
  }
});

export const fetchGoalsPerRound = createAsyncThunk<
  GoalsPerRound[],
  StatsParams | void,
  { rejectValue: string }
>("stats/fetchGoalsPerRound", async (params, thunkAPI) => {
  try {
    const response = await api.get<{ data: GoalsPerRound[] }>(
      "/stats/goals-per-round",
      { params: params ?? {} }
    );
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch goals per round")
    );
  }
});

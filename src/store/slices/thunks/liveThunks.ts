import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { LiveMatchesResponse } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

/**
 * The public live feed. Polled while any match is in progress, so it must stay
 * a single request: one call returns every live match with its timeline.
 */
export const fetchLiveMatches = createAsyncThunk<
  LiveMatchesResponse,
  { seasonId?: number } | void,
  { rejectValue: string }
>("live/fetch", async (params, thunkAPI) => {
  try {
    const response = await api.get<LiveMatchesResponse>("/matches/live", {
      params: params ?? {},
    });
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to load the live matches")
    );
  }
});

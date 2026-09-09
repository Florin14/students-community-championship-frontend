import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { Standing } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const fetchStandings = createAsyncThunk<
  Standing[],
  { seasonId: number },
  { rejectValue: string }
>("standings/fetch", async ({ seasonId }, thunkAPI) => {
  try {
    const response = await api.get<{ data: Standing[] }>("/standings/", {
      params: { seasonId },
    });
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch standings")
    );
  }
});

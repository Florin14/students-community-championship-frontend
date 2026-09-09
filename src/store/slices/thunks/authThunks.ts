import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type {
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
} from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, thunkAPI) => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error, "LoginFailed"));
  }
});

export const changePasswordThunk = createAsyncThunk<
  void,
  ChangePasswordPayload,
  { rejectValue: string }
>("auth/changePassword", async (payload, thunkAPI) => {
  try {
    await api.post("/auth/change-password", payload);
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "ChangePasswordFailed")
    );
  }
});

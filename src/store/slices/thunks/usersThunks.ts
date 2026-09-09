import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type {
  PlatformUser,
  UserPayload,
  UserUpdatePayload,
} from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const fetchUsers = createAsyncThunk<
  PlatformUser[],
  void,
  { rejectValue: string }
>("users/fetchAll", async (_arg, thunkAPI) => {
  try {
    const response = await api.get<{ data: PlatformUser[] }>("/users/");
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch the accounts")
    );
  }
});

export const addUserThunk = createAsyncThunk<
  PlatformUser,
  UserPayload,
  { rejectValue: string }
>("users/add", async (payload, thunkAPI) => {
  try {
    const response = await api.post<PlatformUser>("/users/", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to create the account")
    );
  }
});

export const updateUserThunk = createAsyncThunk<
  PlatformUser,
  { id: number; data: UserUpdatePayload },
  { rejectValue: string }
>("users/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<PlatformUser>(`/users/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update the account")
    );
  }
});

export const deleteUserThunk = createAsyncThunk<
  number,
  { id: number },
  { rejectValue: string }
>("users/delete", async ({ id }, thunkAPI) => {
  try {
    await api.delete(`/users/${id}`);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete the account")
    );
  }
});

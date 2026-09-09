import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/config";
import type { Field, FieldPayload } from "../../../types";
import { getErrorMessage } from "./thunkUtils";

export const fetchFields = createAsyncThunk<
  Field[],
  void,
  { rejectValue: string }
>("fields/fetchAll", async (_arg, thunkAPI) => {
  try {
    const response = await api.get<{ data: Field[] }>("/fields/");
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch the fields")
    );
  }
});

export const addFieldThunk = createAsyncThunk<
  Field,
  FieldPayload,
  { rejectValue: string }
>("fields/add", async (payload, thunkAPI) => {
  try {
    const response = await api.post<Field>("/fields/", payload);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to add the field")
    );
  }
});

export const updateFieldThunk = createAsyncThunk<
  Field,
  { id: number; data: FieldPayload },
  { rejectValue: string }
>("fields/update", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<Field>(`/fields/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to update the field")
    );
  }
});

export const deleteFieldThunk = createAsyncThunk<
  number,
  { id: number },
  { rejectValue: string }
>("fields/delete", async ({ id }, thunkAPI) => {
  try {
    await api.delete(`/fields/${id}`);
    return id;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to delete the field")
    );
  }
});

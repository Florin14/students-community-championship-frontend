import { createSlice } from "@reduxjs/toolkit";

import type { Field } from "../../types";
import {
  addFieldThunk,
  deleteFieldThunk,
  fetchFields,
  updateFieldThunk,
} from "./thunks/fieldsThunks";

interface FieldsState {
  fields: Field[];
  loading: boolean;
  error: string | null;
}

const initialState: FieldsState = {
  fields: [],
  loading: false,
  error: null,
};

const upsert = (state: FieldsState, field: Field) => {
  const index = state.fields.findIndex((item) => item.id === field.id);
  if (index >= 0) {
    state.fields[index] = field;
  } else {
    state.fields.push(field);
  }
  state.fields.sort((a, b) => a.name.localeCompare(b.name));
};

const fieldsSlice = createSlice({
  name: "fields",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload ?? [];
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch the fields";
      })
      .addCase(addFieldThunk.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(updateFieldThunk.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(deleteFieldThunk.fulfilled, (state, action) => {
        state.fields = state.fields.filter((item) => item.id !== action.payload);
      });
  },
});

export default fieldsSlice.reducer;

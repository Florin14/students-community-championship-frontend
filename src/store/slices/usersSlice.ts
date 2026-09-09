import { createSlice } from "@reduxjs/toolkit";

import type { PlatformUser } from "../../types";
import {
  addUserThunk,
  deleteUserThunk,
  fetchUsers,
  updateUserThunk,
} from "./thunks/usersThunks";

interface UsersState {
  users: PlatformUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

const upsert = (state: UsersState, user: PlatformUser) => {
  const index = state.users.findIndex((item) => item.id === user.id);
  if (index >= 0) {
    state.users[index] = user;
  } else {
    state.users.push(user);
  }
  state.users.sort((a, b) => a.name.localeCompare(b.name));
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload ?? [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch the accounts";
      })
      .addCase(addUserThunk.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.users = state.users.filter((item) => item.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;

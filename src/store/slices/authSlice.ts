import { createSlice } from "@reduxjs/toolkit";

import type { AuthUser } from "../../types";
import { AUTH_STORAGE_KEY } from "../../utils/storageKeys";
import { loginThunk } from "./thunks/authThunks";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface StoredAuth {
  user: AuthUser;
  accessToken: string;
}

const loadStoredAuth = (): StoredAuth | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed?.accessToken && parsed?.user) return parsed;
  } catch {
    // storage unavailable or corrupted
  }
  return null;
};

const stored = loadStoredAuth();

const initialState: AuthState = {
  user: stored?.user ?? null,
  accessToken: stored?.accessToken ?? null,
  isAuthenticated: Boolean(stored),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // storage unavailable
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { accessToken, ...user } = action.payload;
        state.user = user;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        try {
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ user, accessToken })
          );
        } catch {
          // storage unavailable
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "LoginFailed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { ThemeMode } from "../../theme";
import { THEME_STORAGE_KEY } from "../../utils/storageKeys";

const applyTheme = (mode: ThemeMode) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", mode);
  }
};

const loadTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable
  }
  return "dark";
};

const saveTheme = (mode: ThemeMode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // storage unavailable
  }
};

interface ThemeState {
  mode: ThemeMode;
}

const initialMode = loadTheme();
applyTheme(initialMode);

const initialState: ThemeState = { mode: initialMode };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      saveTheme(action.payload);
      applyTheme(action.payload);
    },
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      saveTheme(state.mode);
      applyTheme(state.mode);
    },
  },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;

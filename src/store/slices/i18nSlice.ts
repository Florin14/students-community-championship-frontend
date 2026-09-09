import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { Language } from "../../i18n";
import { LANGUAGE_STORAGE_KEY } from "../../utils/storageKeys";

const loadLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "ro" || stored === "en") return stored;
  } catch {
    // storage unavailable
  }
  return "ro";
};

interface I18nState {
  language: Language;
}

const initialState: I18nState = { language: loadLanguage() };

const i18nSlice = createSlice({
  name: "i18n",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, action.payload);
      } catch {
        // storage unavailable
      }
    },
  },
});

export const { setLanguage } = i18nSlice.actions;
export default i18nSlice.reducer;

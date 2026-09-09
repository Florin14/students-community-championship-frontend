import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import i18nReducer from "./slices/i18nSlice";
import matchesReducer from "./slices/matchesSlice";
import playersReducer from "./slices/playersSlice";
import seasonsReducer from "./slices/seasonsSlice";
import snackbarReducer from "./slices/snackbarSlice";
import standingsReducer from "./slices/standingsSlice";
import statsReducer from "./slices/statsSlice";
import teamsReducer from "./slices/teamsSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    i18n: i18nReducer,
    matches: matchesReducer,
    players: playersReducer,
    seasons: seasonsReducer,
    snackbar: snackbarReducer,
    standings: standingsReducer,
    stats: statsReducer,
    teams: teamsReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

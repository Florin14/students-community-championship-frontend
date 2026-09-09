import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import fieldsReducer from "./slices/fieldsSlice";
import i18nReducer from "./slices/i18nSlice";
import liveReducer from "./slices/liveSlice";
import liveScoringReducer from "./slices/liveScoringSlice";
import matchesReducer from "./slices/matchesSlice";
import playersReducer from "./slices/playersSlice";
import seasonsReducer from "./slices/seasonsSlice";
import snackbarReducer from "./slices/snackbarSlice";
import standingsReducer from "./slices/standingsSlice";
import statsReducer from "./slices/statsSlice";
import teamsReducer from "./slices/teamsSlice";
import usersReducer from "./slices/usersSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fields: fieldsReducer,
    i18n: i18nReducer,
    live: liveReducer,
    liveScoring: liveScoringReducer,
    matches: matchesReducer,
    players: playersReducer,
    seasons: seasonsReducer,
    snackbar: snackbarReducer,
    standings: standingsReducer,
    stats: statsReducer,
    teams: teamsReducer,
    theme: themeReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createSlice } from "@reduxjs/toolkit";
import type { TranslationKey } from "../../i18n";
import type { AttendancePreview, AttendanceStatistics, MatchAttendance, PlayerQr } from "../../types/attendance";
import { confirmPlayerAttendance, fetchAttendanceStats, fetchMatchAttendance, issuePlayerQr, revokePlayerQr, scanPlayerQr, voidPlayerAttendance } from "./thunks/attendanceThunks";

interface AttendanceState {
  roster: MatchAttendance | null;
  preview: AttendancePreview | null;
  statistics: AttendanceStatistics | null;
  qr: PlayerQr | null;
  rosterLoading: boolean;
  scanLoading: boolean;
  confirming: boolean;
  statsLoading: boolean;
  qrLoading: boolean;
  rosterError: TranslationKey | null;
  scanError: TranslationKey | null;
  statsError: TranslationKey | null;
  qrError: TranslationKey | null;
  rosterRequest: string | null;
  scanRequest: string | null;
  statsRequest: string | null;
  qrRequest: string | null;
}

const initialState: AttendanceState = {
  roster: null, preview: null, statistics: null, qr: null,
  rosterLoading: false, scanLoading: false, confirming: false, statsLoading: false, qrLoading: false,
  rosterError: null, scanError: null, statsError: null, qrError: null,
  rosterRequest: null, scanRequest: null, statsRequest: null, qrRequest: null,
};

const slice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendance: (state) => {
      state.roster = null; state.preview = null; state.rosterRequest = null; state.scanRequest = null;
      state.rosterError = null; state.scanError = null; state.scanLoading = false;
    },
    clearAttendancePreview: (state) => {
      state.preview = null; state.scanRequest = null; state.scanError = null; state.scanLoading = false;
    },
    clearPlayerQr: (state) => {
      state.qr = null; state.qrError = null; state.qrRequest = null; state.qrLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchAttendance.pending, (state, action) => { state.rosterLoading = true; state.rosterRequest = action.meta.requestId; state.rosterError = null; })
      .addCase(fetchMatchAttendance.fulfilled, (state, action) => {
        if (state.rosterRequest !== action.meta.requestId) return;
        state.roster = action.payload; state.rosterLoading = false;
      })
      .addCase(fetchMatchAttendance.rejected, (state, action) => {
        if (state.rosterRequest !== action.meta.requestId) return;
        state.rosterLoading = false; if (!action.meta.aborted) state.rosterError = action.payload ?? "attendance.errorGeneric";
      })
      .addCase(scanPlayerQr.pending, (state, action) => { state.scanLoading = true; state.preview = null; state.scanError = null; state.scanRequest = action.meta.requestId; })
      .addCase(scanPlayerQr.fulfilled, (state, action) => {
        if (state.scanRequest !== action.meta.requestId) return;
        state.preview = action.payload; state.scanLoading = false;
      })
      .addCase(scanPlayerQr.rejected, (state, action) => {
        if (state.scanRequest !== action.meta.requestId) return;
        state.scanLoading = false; if (!action.meta.aborted) state.scanError = action.payload ?? "attendance.errorGeneric";
      })
      .addCase(confirmPlayerAttendance.pending, (state) => { state.confirming = true; state.scanError = null; })
      .addCase(confirmPlayerAttendance.fulfilled, (state, action) => {
        state.confirming = false;
        if (state.preview?.matchId === action.meta.arg.matchId) {
          state.preview.alreadyPresent = true; state.preview.attendance = action.payload.attendance;
        }
      })
      .addCase(confirmPlayerAttendance.rejected, (state, action) => { state.confirming = false; state.scanError = action.payload ?? "attendance.errorGeneric"; })
      .addCase(voidPlayerAttendance.pending, (state) => { state.confirming = true; state.scanError = null; })
      .addCase(voidPlayerAttendance.fulfilled, (state) => { state.confirming = false; state.preview = null; })
      .addCase(voidPlayerAttendance.rejected, (state, action) => { state.confirming = false; state.scanError = action.payload ?? "attendance.errorGeneric"; })
      .addCase(fetchAttendanceStats.pending, (state, action) => { state.statsLoading = true; state.statsError = null; state.statsRequest = action.meta.requestId; })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        if (state.statsRequest !== action.meta.requestId) return;
        state.statistics = action.payload; state.statsLoading = false;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        if (state.statsRequest !== action.meta.requestId) return;
        state.statsLoading = false; if (!action.meta.aborted) state.statsError = action.payload ?? "attendance.errorGeneric";
      })
      .addCase(issuePlayerQr.pending, (state, action) => { state.qrLoading = true; state.qr = null; state.qrError = null; state.qrRequest = action.meta.requestId; })
      .addCase(issuePlayerQr.fulfilled, (state, action) => {
        if (state.qrRequest !== action.meta.requestId) return;
        state.qr = action.payload; state.qrLoading = false;
      })
      .addCase(issuePlayerQr.rejected, (state, action) => {
        if (state.qrRequest !== action.meta.requestId) return;
        state.qrLoading = false; state.qrError = action.payload ?? "attendance.errorGeneric";
      })
      .addCase(revokePlayerQr.pending, (state) => { state.qrLoading = true; state.qrError = null; })
      .addCase(revokePlayerQr.fulfilled, (state) => { state.qrLoading = false; state.qr = null; })
      .addCase(revokePlayerQr.rejected, (state, action) => { state.qrLoading = false; state.qrError = action.payload ?? "attendance.errorGeneric"; })
      .addCase("auth/logout", () => initialState);
  },
});

export const { clearAttendance, clearAttendancePreview, clearPlayerQr } = slice.actions;
export default slice.reducer;

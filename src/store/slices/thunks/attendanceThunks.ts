import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import api from "../../../api/config";
import { extractPlayerQrToken } from "../../../utils/playerQr";
import type { TranslationKey } from "../../../i18n";
import type { AttendancePreview, AttendanceRecord, AttendanceStatistics, MatchAttendance, PlayerQr } from "../../../types/attendance";

const errorKey = (error: unknown): TranslationKey => {
  const code = axios.isAxiosError(error) ? error.response?.data?.code as string | undefined : undefined;
  const keys: Record<string, TranslationKey> = {
    E0010: "attendance.errorAuth", E0011: "attendance.errorAuth",
    E0012: "attendance.errorAuth", E0013: "attendance.errorForbidden",
    E0014: "attendance.errorAuth", E0015: "attendance.errorForbidden",
    E0032: "attendance.errorConflict", E0054: "attendance.errorTeam",
    E0060: "attendance.errorQR", E0061: "attendance.errorSeason",
    E0062: "attendance.closed", E0063: "attendance.errorPhoto",
    E0064: "attendance.errorIdentity",
  };
  return (code && keys[code]) || "attendance.errorGeneric";
};

export const fetchMatchAttendance = createAsyncThunk<MatchAttendance, number, { rejectValue: TranslationKey }>(
  "attendance/fetchMatch", async (id, thunkAPI) => {
    try { return (await api.get<MatchAttendance>(`/attendance/matches/${id}`, { signal: thunkAPI.signal })).data; }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

export const scanPlayerQr = createAsyncThunk<AttendancePreview, { matchId: number; token: string }, { rejectValue: TranslationKey }>(
  "attendance/scan", async ({ matchId, token }, thunkAPI) => {
    const credential = extractPlayerQrToken(token);
    if (!credential) return thunkAPI.rejectWithValue("attendance.errorQR");
    try { return (await api.post<AttendancePreview>(`/attendance/matches/${matchId}/scan`, { token: credential }, { signal: thunkAPI.signal })).data; }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

export const confirmPlayerAttendance = createAsyncThunk<{ attendance: AttendanceRecord; alreadyPresent: boolean }, { matchId: number; token: string; identityConfirmed: boolean }, { rejectValue: TranslationKey }>(
  "attendance/confirm", async ({ matchId, token, identityConfirmed }, thunkAPI) => {
    const credential = extractPlayerQrToken(token);
    if (!credential) return thunkAPI.rejectWithValue("attendance.errorQR");
    try { return (await api.post(`/attendance/matches/${matchId}/confirm`, { token: credential, identityConfirmed })).data; }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

export const voidPlayerAttendance = createAsyncThunk<AttendanceRecord, { id: number; reason: string }, { rejectValue: TranslationKey }>(
  "attendance/void", async ({ id, reason }, thunkAPI) => {
    try { return (await api.post<AttendanceRecord>(`/attendance/${id}/void`, { reason })).data; }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

export const fetchAttendanceStats = createAsyncThunk<AttendanceStatistics, { seasonId?: number; teamId?: number }, { rejectValue: TranslationKey }>(
  "attendance/stats", async (params, thunkAPI) => {
    try { return (await api.get<AttendanceStatistics>("/stats/attendance", { params, signal: thunkAPI.signal })).data; }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

export const issuePlayerQr = createAsyncThunk<PlayerQr, { id: number; seasonId: number; regenerate?: boolean }, { rejectValue: TranslationKey }>(
  "attendance/issueQr", async ({ id, ...data }, thunkAPI) => {
    try { return (await api.post<PlayerQr>(`/players/${id}/qr`, data)).data; }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

export const revokePlayerQr = createAsyncThunk<void, { id: number; seasonId: number }, { rejectValue: TranslationKey }>(
  "attendance/revokeQr", async ({ id, seasonId }, thunkAPI) => {
    try { await api.post(`/players/${id}/qr/revoke`, { seasonId }); }
    catch (error) { return thunkAPI.rejectWithValue(errorKey(error)); }
  }
);

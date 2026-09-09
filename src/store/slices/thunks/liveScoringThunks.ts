import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import api from "../../../api/config";
import type {
  Match,
  MatchDetails,
  MatchEvent,
  MatchEventInput,
  MatchEventWriteResponse,
} from "../../../types";
import { isRetryable } from "../../../utils/eventQueue";
import { getErrorMessage } from "./thunkUtils";

/** Why a submission failed, so the console knows whether to keep retrying. */
export interface SubmitEventFailure {
  clientEventId: string;
  message: string;
  retryable: boolean;
}

const describeFailure = (
  error: unknown,
  clientEventId: string,
  fallback: string
): SubmitEventFailure => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return {
    clientEventId,
    message: getErrorMessage(error, fallback),
    retryable: isRetryable(status),
  };
};

/** The matches the signed-in account may score - the operator's home screen. */
export const fetchMyMatches = createAsyncThunk<
  Match[],
  void,
  { rejectValue: string }
>("liveScoring/fetchMyMatches", async (_arg, thunkAPI) => {
  try {
    const response = await api.get<{ data: Match[] }>("/matches/mine");
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to load your matches")
    );
  }
});

export const fetchScoringMatch = createAsyncThunk<
  MatchDetails,
  { id: number },
  { rejectValue: string }
>("liveScoring/fetchMatch", async ({ id }, thunkAPI) => {
  try {
    const response = await api.get<MatchDetails>(`/matches/${id}`);
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to load the match")
    );
  }
});

/** The full record, voided entries included, for the correction list. */
export const fetchScoringEvents = createAsyncThunk<
  MatchEvent[],
  { id: number },
  { rejectValue: string }
>("liveScoring/fetchEvents", async ({ id }, thunkAPI) => {
  try {
    const response = await api.get<{ data: MatchEvent[] }>(
      `/matches/${id}/events`,
      { params: { includeVoided: true } }
    );
    return response.data.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to load the match timeline")
    );
  }
});

/**
 * Send one scoring action.
 *
 * The caller has already queued it locally, so a retryable failure leaves the
 * entry in the queue rather than losing it. Replaying the same clientEventId is
 * safe: the server returns the stored event instead of a second goal.
 */
export const submitEvent = createAsyncThunk<
  MatchEventWriteResponse & { clientEventId: string },
  { matchId: number; payload: MatchEventInput },
  { rejectValue: SubmitEventFailure }
>("liveScoring/submitEvent", async ({ matchId, payload }, thunkAPI) => {
  try {
    const response = await api.post<MatchEventWriteResponse>(
      `/matches/${matchId}/events`,
      payload
    );
    return { ...response.data, clientEventId: payload.clientEventId };
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      describeFailure(error, payload.clientEventId, "Failed to save the event")
    );
  }
});

export const undoLastEvent = createAsyncThunk<
  MatchEventWriteResponse,
  { matchId: number; reason?: string },
  { rejectValue: string }
>("liveScoring/undoLast", async ({ matchId, reason }, thunkAPI) => {
  try {
    const response = await api.post<MatchEventWriteResponse>(
      `/matches/${matchId}/events/undo`,
      { reason: reason ?? null }
    );
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Nothing could be undone")
    );
  }
});

export const voidEvent = createAsyncThunk<
  MatchEventWriteResponse,
  { matchId: number; eventId: number; reason?: string },
  { rejectValue: string }
>("liveScoring/voidEvent", async ({ matchId, eventId, reason }, thunkAPI) => {
  try {
    const response = await api.post<MatchEventWriteResponse>(
      `/matches/${matchId}/events/${eventId}/void`,
      { reason: reason ?? null }
    );
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to cancel the event")
    );
  }
});

type Lifecycle = "start" | "pause" | "resume" | "finish";

const lifecycleThunk = (action: Lifecycle, fallback: string) =>
  createAsyncThunk<MatchDetails, { matchId: number }, { rejectValue: string }>(
    `liveScoring/${action}`,
    async ({ matchId }, thunkAPI) => {
      try {
        const response = await api.post<MatchDetails>(
          `/matches/${matchId}/${action}`
        );
        return response.data;
      } catch (error: unknown) {
        return thunkAPI.rejectWithValue(getErrorMessage(error, fallback));
      }
    }
  );

export const startMatchThunk = lifecycleThunk(
  "start",
  "Failed to start the match"
);
export const pauseMatchThunk = lifecycleThunk(
  "pause",
  "Failed to pause the match"
);
export const resumeMatchThunk = lifecycleThunk(
  "resume",
  "Failed to resume the match"
);
export const finishMatchThunk = lifecycleThunk(
  "finish",
  "Failed to confirm the result"
);

export const reopenMatchThunk = createAsyncThunk<
  MatchDetails,
  { matchId: number; reason: string },
  { rejectValue: string }
>("liveScoring/reopen", async ({ matchId, reason }, thunkAPI) => {
  try {
    const response = await api.post<MatchDetails>(
      `/matches/${matchId}/reopen`,
      { reason }
    );
    return response.data;
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to reopen the match")
    );
  }
});

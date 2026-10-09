import {
  ArrowLeft,
  CircleDot,
  Flag,
  Goal,
  Lock,
  Pause,
  Play,
  Undo2,
  Unlock,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

import ConfirmDialog from "../../components/reusable/ConfirmDialog";
import AudienceField from "../../components/reusable/AudienceField";
import { isValidAudience } from "../../utils/audience";
import LoadingState from "../../components/reusable/LoadingState";
import StyledTextField from "../../components/reusable/StyledTextField";
import { usePolling, useOnlineStatus } from "../../hooks/usePolling";
import { t } from "../../i18n";
import {
  discardQueueEntry,
  enqueueEvent,
  resetScoring,
  retryQueueEntry,
} from "../../store/slices/liveScoringSlice";
import { showSnackbar } from "../../store/slices/snackbarSlice";
import {
  fetchScoringEvents,
  fetchScoringMatch,
  finishMatchThunk,
  pauseMatchThunk,
  reopenMatchThunk,
  resumeMatchThunk,
  startMatchThunk,
  submitEvent,
  updateAudienceThunk,
  undoLastEvent,
  voidEvent,
} from "../../store/slices/thunks/liveScoringThunks";
import { fetchPlayers } from "../../store/slices/thunks/playersThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { MatchEvent, MatchEventInput, MatchEventType } from "../../types";
import { newClientEventId } from "../../utils/eventQueue";
import { covers } from "../../utils/roles";
import ConsoleTimeline from "./ConsoleTimeline";
import EventSheet, { type EventDraft } from "./EventSheet";
import SyncStatus from "./SyncStatus";
import {
  ActionGrid,
  Banner,
  BigButton,
  ClockRow,
  ConsoleCard,
  ConsoleShell,
  LiveDot,
  ScoreTeam,
  ScoreValue,
  Scoreboard,
} from "./consoleUi";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  color: var(--text-secondary);
  font-size: 0.87rem;
  font-weight: 600;
  text-decoration: none;
`;

const SectionLabel = styled.div`
  padding: 14px 16px 10px;
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--divider);
`;

const LifecycleRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 0 14px 14px;
`;

/** How often an unsent action is retried while the connection is back. */
const QUEUE_RETRY_MS = 5000;
/** How often the clock display is recomputed. */
const CLOCK_TICK_MS = 1000;

const ScoringConsole = () => {
  const { matchId: matchIdParam } = useParams();
  const matchId = Number(matchIdParam);
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const user = useAppSelector((state) => state.auth.user);
  const { match, clockSyncedAt, scoringRequestId, events, queue, loading, busy, audienceSaving, error } = useAppSelector(
    (state) => state.liveScoring
  );
  const allPlayers = useAppSelector((state) => state.players.players);
  const online = useOnlineStatus();

  const [sheetType, setSheetType] = useState<MatchEventType | null>(null);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [pendingVoid, setPendingVoid] = useState<MatchEvent | null>(null);
  const [audience, setAudience] = useState("");
  // Bumped by the interval below purely to re-render the clock.
  const [, setClockTick] = useState(0);

  const isSuperAdmin = covers(user?.role, "SUPER_ADMIN");

  useEffect(() => {
    setAudience(match?.audience == null ? "" : String(match.audience));
  }, [match?.id, match?.audience]);

  const saveAudience = async () => {
    if (!match || match.id !== matchId || match.isLocked || busy || audienceSaving || !online || !isValidAudience(audience)) return;
    const nextAudience = audience === "" ? null : Number(audience);
    if (nextAudience === (match.audience ?? null)) return;
    const action = await dispatch(updateAudienceThunk({
      matchId, audience: nextAudience,
    }));
    if (updateAudienceThunk.fulfilled.match(action)) {
      dispatch(showSnackbar({ message: t(language, "matches.audienceSaved"), severity: "success" }));
    }
  };

  useEffect(() => {
    if (!Number.isFinite(matchId)) return;
    dispatch(fetchScoringMatch({ id: matchId }));
    dispatch(fetchScoringEvents({ id: matchId }));
    dispatch(fetchPlayers());
    return () => {
      dispatch(resetScoring());
    };
  }, [dispatch, matchId]);

  useEffect(() => {
    if (error) {
      dispatch(showSnackbar({ message: error, severity: "error" }));
    }
  }, [dispatch, error]);

  const pending = useMemo(
    () => queue.filter((entry) => entry.matchId === matchId),
    [queue, matchId]
  );

  /**
   * Resend anything the server has not acknowledged. Safe to fire repeatedly:
   * the request carries a clientEventId, so a submission already stored comes
   * back as the same event rather than a duplicate.
   */
  usePolling(
    () => {
      if (!online) return;
      pending
        .filter((entry) => entry.status === "pending")
        .forEach((entry) => {
          dispatch(submitEvent({ matchId, payload: entry.payload }));
        });
    },
    {
      intervalMs: QUEUE_RETRY_MS,
      enabled: pending.some((entry) => entry.status === "pending"),
    }
  );

  usePolling(() => setClockTick((value) => value + 1), {
    intervalMs: CLOCK_TICK_MS,
    enabled: Boolean(match?.isClockRunning),
    immediate: false,
  });

  usePolling(() => {
    if (scoringRequestId === null) dispatch(fetchScoringMatch({ id: matchId }));
  }, {
    intervalMs: 10000,
    enabled: online && Boolean(match?.startedAt) && !match?.isLocked,
    immediate: false,
  });

  // Computed on every render rather than memoised: `clockTick` advancing is
  // exactly what should recompute it, and the arithmetic is free.
  const displayMinute = (() => {
    if (
      !match ||
      match.currentMinute === null ||
      match.currentMinute === undefined
    ) {
      return null;
    }
    if (!match.isClockRunning) return match.currentMinute;
    // The server reported the minute when the match was loaded; carry it
    // forward locally rather than polling once a minute just for the clock.
    const elapsed = Math.floor((Date.now() - (clockSyncedAt ?? Date.now())) / 60000);
    return match.currentMinute + Math.max(0, elapsed);
  })();

  // By shirt number, not by name: the operator is reading the number off the
  // shirt in front of them, and a squad ordered any other way costs a search.
  const squadFor = useCallback(
    (teamId: number | undefined) =>
      allPlayers
        .filter((player) => player.teamId === teamId)
        .sort((a, b) => {
          const left = a.shirtNumber ?? Number.MAX_SAFE_INTEGER;
          const right = b.shirtNumber ?? Number.MAX_SAFE_INTEGER;
          if (left !== right) return left - right;
          return a.name.localeCompare(b.name);
        }),
    [allPlayers]
  );

  const homePlayers = useMemo(
    () => squadFor(match?.homeTeamId),
    [squadFor, match?.homeTeamId]
  );
  const awayPlayers = useMemo(
    () => squadFor(match?.awayTeamId),
    [squadFor, match?.awayTeamId]
  );

  const submitDraft = useCallback(
    (draft: EventDraft) => {
      const clientEventId = newClientEventId();
      const payload: MatchEventInput = {
        type: draft.type,
        teamId: draft.teamId,
        clientEventId,
        playerId: draft.playerId,
        assistPlayerId: draft.assistPlayerId,
        minute: draft.minute,
      };

      // Queued before it is sent: if the request never leaves the phone, the
      // action is still recorded and retried.
      dispatch(
        enqueueEvent({
          clientEventId,
          matchId,
          payload,
          status: "pending",
          attempts: 0,
          error: null,
          queuedAt: new Date().toISOString(),
        })
      );
      dispatch(submitEvent({ matchId, payload }));
      setSheetType(null);
    },
    [dispatch, matchId]
  );

  const runUndo = async () => {
    const action = await dispatch(undoLastEvent({ matchId }));
    if (undoLastEvent.fulfilled.match(action)) {
      dispatch(
        showSnackbar({
          message: t(language, "console.undone"),
          severity: "success",
        })
      );
    }
  };

  const runVoid = async () => {
    if (!pendingVoid) return;
    const target = pendingVoid;
    setPendingVoid(null);
    const action = await dispatch(
      voidEvent({ matchId, eventId: target.id })
    );
    if (voidEvent.fulfilled.match(action)) {
      dispatch(
        showSnackbar({
          message: t(language, "console.undone"),
          severity: "success",
        })
      );
    }
  };

  const runFinish = async () => {
    setConfirmFinish(false);
    const action = await dispatch(finishMatchThunk({ matchId }));
    if (finishMatchThunk.fulfilled.match(action)) {
      dispatch(fetchScoringEvents({ id: matchId }));
      dispatch(
        showSnackbar({
          message: t(language, "console.locked"),
          severity: "success",
        })
      );
    }
  };

  const runReopen = async () => {
    const action = await dispatch(
      reopenMatchThunk({ matchId, reason: reopenReason.trim() })
    );
    if (reopenMatchThunk.fulfilled.match(action)) {
      setReopenOpen(false);
      setReopenReason("");
    }
  };

  const runStart = async () => {
    if (!match || match.id !== matchId || match.isLocked || match.startedAt != null || !online || busy || audienceSaving) return;
    setConfirmStart(false);
    await dispatch(startMatchThunk({ matchId }));
  };

  const runLifecycle = async (thunk: typeof pauseMatchThunk | typeof resumeMatchThunk) => {
    if (!online || busy || audienceSaving) return;
    await dispatch(thunk({ matchId }));
  };

  if (loading && !match) return <LoadingState />;
  if (!match) {
    return (
      <ConsoleShell>
        <BackLink to="/live">
          <ArrowLeft size={16} />
          {t(language, "console.back")}
        </BackLink>
        <Banner $tone="danger">
          <span>{t(language, "matchDetails.notFound")}</span>
        </Banner>
      </ConsoleShell>
    );
  }

  const notStarted = match.startedAt === null || match.startedAt === undefined;
  const canScore = !match.isLocked && !notStarted;

  return (
    <ConsoleShell>
      <BackLink to="/live">
        <ArrowLeft size={16} />
        {t(language, "console.back")}
      </BackLink>

      <SyncStatus
        online={online}
        queue={pending}
        language={language}
        onRetry={(clientEventId) => {
          dispatch(retryQueueEntry(clientEventId));
          const entry = pending.find(
            (item) => item.clientEventId === clientEventId
          );
          if (entry) dispatch(submitEvent({ matchId, payload: entry.payload }));
        }}
        onDiscard={(clientEventId) =>
          dispatch(discardQueueEntry(clientEventId))
        }
      />

      <ConsoleCard>
        <Scoreboard>
          <ScoreTeam $align="left">
            <strong>{match.homeTeamName}</strong>
          </ScoreTeam>
          <ScoreValue>
            {notStarted ? "—" : match.scoreHome ?? 0} : {notStarted ? "—" : match.scoreAway ?? 0}
          </ScoreValue>
          <ScoreTeam $align="right">
            <strong>{match.awayTeamName}</strong>
          </ScoreTeam>
        </Scoreboard>

        <ClockRow>
          {match.isClockRunning && <LiveDot />}
          {match.isLocked ? (
            <>
              <Lock size={14} />
              {t(language, "console.locked")}
            </>
          ) : notStarted ? (
            t(language, "console.notStarted")
          ) : match.state === "HALF_TIME" ? (
            t(language, "live.halfTime")
          ) : (
            t(language, "live.minuteShort", { minute: displayMinute ?? 1 })
          )}
        </ClockRow>

        {match.isLocked ? (
          <div style={{ padding: 14 }}>
            <Banner $tone="info">
              <Lock size={17} />
              <span>{t(language, "console.lockedHint")}</span>
            </Banner>
            {isSuperAdmin && (
              <div style={{ marginTop: 12 }}>
                <BigButton
                  type="button"
                  $tone="neutral"
                  disabled={busy}
                  onClick={() => setReopenOpen(true)}
                >
                  <Unlock size={18} />
                  {t(language, "console.reopen")}
                </BigButton>
              </div>
            )}
          </div>
        ) : notStarted ? (
          <div style={{ padding: 14 }}>
            <Banner $tone="info">
              <CircleDot size={17} />
              <span>{t(language, "console.notStartedHint")}</span>
            </Banner>
            <div style={{ marginTop: 12 }}>
              <BigButton
                type="button"
                disabled={!online || busy || audienceSaving}
                onClick={() => setConfirmStart(true)}
              >
                <Play size={18} />
                {t(language, "console.start")}
              </BigButton>
            </div>
          </div>
        ) : (
          <>
            <ActionGrid>
              <BigButton
                type="button"
                onClick={() => setSheetType("GOAL")}
                disabled={!canScore}
              >
                <Goal size={19} />
                {t(language, "console.addGoal")}
              </BigButton>
              <BigButton
                type="button"
                $tone="neutral"
                onClick={() => setSheetType("OWN_GOAL")}
                disabled={!canScore}
              >
                {t(language, "console.addOwnGoal")}
              </BigButton>
              <BigButton
                type="button"
                $tone="warning"
                onClick={() => setSheetType("YELLOW_CARD")}
                disabled={!canScore}
              >
                {t(language, "console.addYellow")}
              </BigButton>
              <BigButton
                type="button"
                $tone="danger"
                onClick={() => setSheetType("RED_CARD")}
                disabled={!canScore}
              >
                {t(language, "console.addRed")}
              </BigButton>
            </ActionGrid>

            <LifecycleRow>
              <BigButton
                type="button"
                $tone="neutral"
                disabled={busy}
                onClick={() => runUndo()}
              >
                <Undo2 size={17} />
                {t(language, "console.undo")}
              </BigButton>
            </LifecycleRow>

            {pending.length > 0 && (
              <div style={{ padding: "0 14px 12px" }}>
                <Banner $tone="warning">
                  <span>{t(language, "console.queueTitle")}</span>
                </Banner>
              </div>
            )}

            <LifecycleRow>
              {match.state === "HALF_TIME" ? (
                <BigButton
                  type="button"
                  $tone="neutral"
                  disabled={!online || busy || audienceSaving}
                  onClick={() => runLifecycle(resumeMatchThunk)}
                >
                  <Play size={17} />
                  {t(language, "console.resume")}
                </BigButton>
              ) : (
                <BigButton
                  type="button"
                  $tone="neutral"
                  disabled={!online || busy || audienceSaving}
                  onClick={() => runLifecycle(pauseMatchThunk)}
                >
                  <Pause size={17} />
                  {t(language, "console.pause")}
                </BigButton>
              )}
              <BigButton
                type="button"
                disabled={busy || audienceSaving || pending.length > 0}
                onClick={() => setConfirmFinish(true)}
              >
                <Flag size={17} />
                {t(language, "console.finish")}
              </BigButton>
            </LifecycleRow>
          </>
        )}
      </ConsoleCard>

      <ConsoleCard>
        <SectionLabel>{t(language, "matches.audience")}</SectionLabel>
        <form style={{ padding: 14, display: "grid", gap: 12 }} onSubmit={(event) => {
          event.preventDefault();
          void saveAudience();
        }}>
          <AudienceField value={audience} onChange={setAudience} disabled={match.isLocked || busy || audienceSaving} />
          {!match.isLocked && (
            <>
              {!online && <Banner $tone="warning">{t(language, "matches.audienceOnline")}</Banner>}
              <BigButton type="submit" $tone="neutral" disabled={!online || busy || audienceSaving || !isValidAudience(audience) || (audience === "" ? null : Number(audience)) === (match.audience ?? null)}>
                {t(language, "matches.audienceSave")}
              </BigButton>
            </>
          )}
        </form>
      </ConsoleCard>

      <ConsoleCard>
        <SectionLabel>{t(language, "console.timeline")}</SectionLabel>
        <ConsoleTimeline
          match={match}
          events={events}
          language={language}
          canEdit={canScore}
          onVoid={setPendingVoid}
        />
      </ConsoleCard>

      {sheetType && (
        <EventSheet
          type={sheetType}
          match={match}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
          defaultMinute={displayMinute}
          language={language}
          onSubmit={submitDraft}
          onClose={() => setSheetType(null)}
        />
      )}

      <ConfirmDialog
        open={confirmStart && notStarted && !match.isLocked}
        title={t(language, "console.startTitle")}
        description={t(language, "console.startText")}
        confirmLabel={t(language, "console.start")}
        cancelLabel={t(language, "common.cancel")}
        confirmDisabled={!online || busy || audienceSaving}
        onConfirm={runStart}
        onClose={() => setConfirmStart(false)}
      />

      <ConfirmDialog
        open={confirmFinish}
        title={t(language, "console.finishTitle")}
        description={t(language, "console.finishText")}
        confirmLabel={t(language, "console.finish")}
        cancelLabel={t(language, "common.cancel")}
        onConfirm={runFinish}
        onClose={() => setConfirmFinish(false)}
      />

      <ConfirmDialog
        open={Boolean(pendingVoid)}
        title={t(language, "console.voidTitle")}
        description={t(language, "console.voidText")}
        confirmLabel={t(language, "console.voidEvent")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={runVoid}
        onClose={() => setPendingVoid(null)}
      />

      <ConfirmDialog
        open={reopenOpen}
        title={t(language, "console.reopenTitle")}
        description={t(language, "console.reopenReasonHint")}
        confirmLabel={t(language, "console.reopen")}
        cancelLabel={t(language, "common.cancel")}
        confirmDisabled={reopenReason.trim().length < 3 || busy}
        onConfirm={runReopen}
        onClose={() => {
          setReopenOpen(false);
          setReopenReason("");
        }}
      >
        <StyledTextField
          fullWidth
          autoFocus
          multiline
          minRows={2}
          label={t(language, "console.reopenReason")}
          value={reopenReason}
          onChange={(event) => setReopenReason(event.target.value)}
        />
      </ConfirmDialog>
    </ConsoleShell>
  );
};

export default ScoringConsole;

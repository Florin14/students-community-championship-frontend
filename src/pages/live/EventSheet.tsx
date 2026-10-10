import { ArrowLeft, Check, Pencil, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import TeamIdentity from "../../components/reusable/TeamIdentity";

import { t, type Language, type TranslationKey } from "../../i18n";
import type { MatchDetails, MatchEventType, Player } from "../../types";
import {
  Banner,
  BigButton,
  MinuteControl,
  PlayerButton,
  Sheet,
  SheetBackdrop,
  SheetBody,
  SheetFooter,
  SheetHeader,
  ShirtNumber,
  SquadColumn,
  SquadColumns,
  SquadLabel,
} from "./consoleUi";

export interface EventDraft {
  type: MatchEventType;
  teamId: number;
  playerId: number | null;
  assistPlayerId: number | null;
  minute: number | null;
}

interface EventSheetProps {
  type: MatchEventType;
  match: MatchDetails;
  homePlayers: Player[];
  awayPlayers: Player[];
  defaultMinute: number | null;
  language: Language;
  onSubmit: (draft: EventDraft) => void;
  onClose: () => void;
}

const LABEL_KEY: Record<MatchEventType, TranslationKey> = {
  GOAL: "event.GOAL",
  OWN_GOAL: "event.OWN_GOAL",
  YELLOW_CARD: "event.YELLOW_CARD",
  RED_CARD: "event.RED_CARD",
};

const MinutePanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--divider);
  > strong { font-size: 0.8rem; color: var(--text-secondary); }
  > small { font-size: 0.75rem; color: var(--text-secondary); }
  > div { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  output { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--accent); }
  .minute-action {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    font-size: 0.78rem;
  }
`;

const ScorerButton = styled(PlayerButton)`
  &[aria-pressed="true"] {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
`;

const ScorerSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: var(--bg-surface);

  strong {
    color: var(--text-primary);
    font-size: 0.95rem;
    overflow-wrap: anywhere;
  }
`;

const AssistOptions = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;

  legend {
    padding: 0 0 8px;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--text-primary);
  }

  p {
    margin: 0 0 6px;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--text-secondary);
  }
`;

const AssistOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid ${({ $selected }) => $selected ? "var(--accent)" : "var(--border)"};
  border-radius: 12px;
  background: ${({ $selected }) => $selected ? "var(--accent-soft)" : "var(--bg-surface)"};
  color: var(--text-primary);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;

  input {
    width: 20px;
    height: 20px;
    margin: 0;
    flex: none;
    accent-color: var(--accent);
  }

  &:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const GoalFooter = styled(SheetFooter)`
  flex-direction: column;

  > small {
    font-size: 0.82rem;
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }

  > div {
    display: flex;
    gap: 10px;
  }
`;

/**
 * Picking a goal scorer opens a review with an optional teammate assist.
 * Only the Save goal button submits it. Cards and own goals keep direct entry.
 */
const EventSheet = ({
  type,
  match,
  homePlayers,
  awayPlayers,
  defaultMinute,
  language,
  onSubmit,
  onClose,
}: EventSheetProps) => {
  const [manualMinute, setManualMinute] = useState<number | null>(null);
  const minute = manualMinute ?? defaultMinute ?? 1;
  const [assistPlayerId, setAssistPlayerId] = useState<number | null>(null);
  const [choosingScorer, setChoosingScorer] = useState(true);
  const [scorer, setScorer] = useState<{
    playerId: number | null;
    teamId: number;
  } | null>(null);

  const isGoal = type === "GOAL";
  const isOwnGoal = type === "OWN_GOAL";
  const isCard = type === "YELLOW_CARD" || type === "RED_CARD";

  /** For an own goal the credited team is the opponent of the player's own. */
  const creditedTeamFor = (playerTeamId: number) =>
    isOwnGoal
      ? playerTeamId === match.homeTeamId
        ? match.awayTeamId
        : match.homeTeamId
      : playerTeamId;

  const submit = (
    playerTeamId: number,
    playerId: number | null,
    assistPlayerId: number | null
  ) => {
    onSubmit({
      type,
      teamId: creditedTeamFor(playerTeamId),
      playerId,
      assistPlayerId,
      minute,
    });
  };

  const pickPlayer = (playerTeamId: number, playerId: number | null) => {
    if (isGoal) {
      if (scorer?.teamId !== playerTeamId || assistPlayerId === playerId) {
        setAssistPlayerId(null);
      }
      setScorer({ playerId, teamId: playerTeamId });
      setChoosingScorer(false);
      return;
    }
    submit(playerTeamId, playerId, null);
  };

  const assistCandidates = useMemo(() => {
    if (!scorer) return [];
    const squad =
      scorer.teamId === match.homeTeamId ? homePlayers : awayPlayers;
    return squad.filter((player) => player.id !== scorer.playerId);
  }, [scorer, match.homeTeamId, homePlayers, awayPlayers]);

  const heading = t(language, LABEL_KEY[type]);
  const scorerPlayer = [...homePlayers, ...awayPlayers].find((player) => player.id === scorer?.playerId);
  const scorerName = scorerPlayer
    ? `${scorerPlayer.shirtNumber == null ? "" : `#${scorerPlayer.shirtNumber} · `}${scorerPlayer.name}`
    : t(language, "console.unknownPlayer");
  const selectedAssist = assistCandidates.find((player) => player.id === assistPlayerId);
  const selectedAssistId = selectedAssist?.id ?? null;
  const showGoalDetails = isGoal && scorer !== null && !choosingScorer;

  const promptKey = showGoalDetails
    ? "console.goalDetails"
    : isCard
      ? "console.pickCardPlayer"
      : isOwnGoal
        ? "console.pickOwnGoalPlayer"
        : "console.pickScorer";

  const renderSquad = (
    teamId: number,
    teamName: string | null | undefined,
    color: string | null | undefined,
    squad: Player[]
  ) => (
    <SquadColumn>
      <SquadLabel $color={color}><TeamIdentity teamId={teamId} name={teamName} logo={teamId === match.homeTeamId ? match.homeTeamLogo : match.awayTeamLogo} color={color} /></SquadLabel>
      {squad.length === 0 && (
        <span
          style={{
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            padding: "6px 2px",
          }}
        >
          {t(language, "console.emptySquad")}
        </span>
      )}
      {squad.map((player) => (
        <ScorerButton
          key={player.id}
          type="button"
          aria-pressed={isGoal ? scorer?.teamId === teamId && scorer.playerId === player.id : undefined}
          onClick={() => pickPlayer(teamId, player.id)}
        >
          <ShirtNumber>
            {player.shirtNumber !== null && player.shirtNumber !== undefined
              ? player.shirtNumber
              : "–"}
          </ShirtNumber>
          <span style={{ overflowWrap: "anywhere" }}>{player.name}</span>
        </ScorerButton>
      ))}
      {!isCard && (
        <ScorerButton
          type="button"
          aria-pressed={isGoal ? scorer?.teamId === teamId && scorer.playerId === null : undefined}
          onClick={() => pickPlayer(teamId, null)}
        >
          <ShirtNumber>?</ShirtNumber>
          <span>{t(language, "console.unknownPlayer")}</span>
        </ScorerButton>
      )}
    </SquadColumn>
  );

  return createPortal(
    <SheetBackdrop
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-sheet-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Sheet onClick={(event) => event.stopPropagation()}>
        <SheetHeader style={{ flexWrap: "wrap" }}>
          <div>
            <h3 id="event-sheet-title">{heading}</h3>
            <small>{t(language, promptKey)}</small>
          </div>
          <MinutePanel>
            <strong>{t(language, "console.eventMinute")}</strong>
            <div>
              {manualMinute === null ? (
                <>
                  <output aria-label={t(language, "console.liveMinute")}>{minute}′</output>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{t(language, "console.liveMinute")}</span>
                  <button type="button" className="minute-action" onClick={() => setManualMinute(minute)}>
                    <Pencil size={14} />{t(language, "console.correctMinute")}
                  </button>
                </>
              ) : (
                <>
          <MinuteControl>
            <button
              type="button"
              aria-label={t(language, "console.minuteDecrease")}
              onClick={() => setManualMinute(Math.max(0, minute - 1))}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={minute}
              min={0}
              max={200}
              aria-label={t(language, "console.eventMinute")}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isNaN(next)) {
                  setManualMinute(Math.min(200, Math.max(0, next)));
                }
              }}
            />
            <button
              type="button"
              aria-label={t(language, "console.minuteIncrease")}
              onClick={() => setManualMinute(Math.min(200, minute + 1))}
            >
              +
            </button>
          </MinuteControl>
                  <button type="button" className="minute-action" onClick={() => setManualMinute(null)}>{t(language, "console.useLiveMinute")}</button>
                </>
              )}
            </div>
            {manualMinute !== null && <small>{t(language, "console.minuteCorrectionHint")}</small>}
          </MinutePanel>
        </SheetHeader>

        <SheetBody>
          {isOwnGoal && (
            <div style={{ marginBottom: 12 }}>
              <Banner $tone="warning">
                <span>
                  {t(language, "console.addOwnGoal")} —{" "}
                  {t(language, "matchDetails.ownGoal")}
                </span>
              </Banner>
            </div>
          )}

          {showGoalDetails ? (
            <>
              <ScorerSummary>
                <SquadLabel $color={scorer.teamId === match.homeTeamId ? match.homeTeamColor : match.awayTeamColor}>
                  <TeamIdentity teamId={scorer.teamId} name={scorer.teamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName} logo={scorer.teamId === match.homeTeamId ? match.homeTeamLogo : match.awayTeamLogo} color={scorer.teamId === match.homeTeamId ? match.homeTeamColor : match.awayTeamColor} />
                </SquadLabel>
                <strong>{t(language, "console.selectedScorer", { player: scorerName })}</strong>
              </ScorerSummary>
              <AssistOptions>
                <legend>{t(language, "console.pickAssist")}</legend>
                <p>{t(language, "console.assistHint")}</p>
                <AssistOption $selected={selectedAssistId === null}>
                  <input
                    type="radio"
                    name="goal-assist"
                    checked={selectedAssistId === null}
                    onChange={() => setAssistPlayerId(null)}
                  />
                  <span>{t(language, "console.skipAssist")}</span>
                </AssistOption>
                {assistCandidates.map((player) => (
                  <AssistOption key={player.id} $selected={selectedAssistId === player.id}>
                    <input
                      type="radio"
                      name="goal-assist"
                      checked={selectedAssistId === player.id}
                      onChange={() => setAssistPlayerId(player.id)}
                    />
                    <ShirtNumber>{player.shirtNumber ?? "–"}</ShirtNumber>
                    <span style={{ overflowWrap: "anywhere" }}>{player.name}</span>
                  </AssistOption>
                ))}
                {assistCandidates.length === 0 && <p>{t(language, "console.noAssistCandidates")}</p>}
              </AssistOptions>
            </>
          ) : (
            <SquadColumns>
              {renderSquad(
                match.homeTeamId,
                match.homeTeamName,
                match.homeTeamColor,
                homePlayers
              )}
              {renderSquad(
                match.awayTeamId,
                match.awayTeamName,
                match.awayTeamColor,
                awayPlayers
              )}
            </SquadColumns>
          )}
        </SheetBody>

        {showGoalDetails ? (
          <GoalFooter>
            <small aria-live="polite">
              {selectedAssist
                ? t(language, "console.selectedAssist", { player: selectedAssist.name })
                : t(language, "console.skipAssist")}
            </small>
            <div>
              <BigButton type="button" $tone="neutral" onClick={() => setChoosingScorer(true)}>
                <ArrowLeft size={18} />{t(language, "console.backToScorer")}
              </BigButton>
              <BigButton
                type="button"
                onClick={() => submit(scorer.teamId, scorer.playerId, selectedAssistId)}
              >
                <Check size={18} />{t(language, "console.saveGoal")}
              </BigButton>
            </div>
          </GoalFooter>
        ) : (
          <SheetFooter>
            <BigButton type="button" $tone="neutral" onClick={onClose}>
              <X size={18} />
              {t(language, "common.cancel")}
            </BigButton>
          </SheetFooter>
        )}
      </Sheet>
    </SheetBackdrop>,
    document.body
  );
};

export default EventSheet;

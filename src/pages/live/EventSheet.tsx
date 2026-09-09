import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { t, type Language } from "../../i18n";
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

const LABEL_KEY: Record<MatchEventType, string> = {
  GOAL: "event.GOAL",
  OWN_GOAL: "event.OWN_GOAL",
  YELLOW_CARD: "event.YELLOW_CARD",
  RED_CARD: "event.RED_CARD",
};

const AssistToggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      minHeight: 44,
      padding: "0 2px 10px",
      cursor: "pointer",
      fontSize: "0.88rem",
      color: "var(--text-secondary)",
      fontWeight: 600,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      style={{ width: 20, height: 20, accentColor: "var(--accent)" }}
    />
    {label}
  </label>
);

/**
 * The two-tap entry flow.
 *
 * Both squads are shown side by side so picking the player also settles the
 * team: one tap on the action, one on the name, and the event is on its way. An
 * assist costs one extra tap and is opt-in through the toggle, so the common
 * case stays at two.
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
  const [minute, setMinute] = useState<number>(defaultMinute ?? 1);
  const [wantsAssist, setWantsAssist] = useState(false);
  const [scorer, setScorer] = useState<{
    playerId: number | null;
    teamId: number;
  } | null>(null);

  useEffect(() => {
    setMinute(defaultMinute ?? 1);
  }, [defaultMinute]);

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
    if (isGoal && wantsAssist && playerId !== null) {
      setScorer({ playerId, teamId: playerTeamId });
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

  const heading = t(language, LABEL_KEY[type] as never);

  const promptKey = scorer
    ? "console.pickAssist"
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
      <SquadLabel $color={color}>{teamName}</SquadLabel>
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
        <PlayerButton
          key={player.id}
          type="button"
          onClick={() => pickPlayer(teamId, player.id)}
        >
          <ShirtNumber>
            {player.shirtNumber !== null && player.shirtNumber !== undefined
              ? player.shirtNumber
              : "–"}
          </ShirtNumber>
          <span style={{ overflowWrap: "anywhere" }}>{player.name}</span>
        </PlayerButton>
      ))}
      {!isCard && (
        <PlayerButton type="button" onClick={() => pickPlayer(teamId, null)}>
          <ShirtNumber>?</ShirtNumber>
          <span>{t(language, "console.unknownPlayer")}</span>
        </PlayerButton>
      )}
    </SquadColumn>
  );

  return (
    <SheetBackdrop
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Sheet onClick={(event) => event.stopPropagation()}>
        <SheetHeader>
          <div>
            <h3>{heading}</h3>
            <small>{t(language, promptKey as never)}</small>
          </div>
          <MinuteControl>
            <button
              type="button"
              aria-label="-1"
              onClick={() => setMinute((value) => Math.max(0, value - 1))}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={minute}
              min={0}
              max={200}
              aria-label={t(language, "console.minuteLabel", {
                minute,
              })}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isNaN(next)) {
                  setMinute(Math.min(200, Math.max(0, next)));
                }
              }}
            />
            <button
              type="button"
              aria-label="+1"
              onClick={() => setMinute((value) => Math.min(200, value + 1))}
            >
              +
            </button>
          </MinuteControl>
        </SheetHeader>

        <SheetBody>
          {isOwnGoal && !scorer && (
            <div style={{ marginBottom: 12 }}>
              <Banner $tone="warning">
                <span>
                  {t(language, "console.addOwnGoal")} —{" "}
                  {t(language, "matchDetails.ownGoal")}
                </span>
              </Banner>
            </div>
          )}

          {isGoal && !scorer && (
            <AssistToggle
              checked={wantsAssist}
              onChange={setWantsAssist}
              label={t(language, "console.pickAssist")}
            />
          )}

          {scorer ? (
            <SquadColumn>
              {assistCandidates.map((player) => (
                <PlayerButton
                  key={player.id}
                  type="button"
                  onClick={() =>
                    submit(scorer.teamId, scorer.playerId, player.id)
                  }
                >
                  <ShirtNumber>
                    {player.shirtNumber !== null &&
                    player.shirtNumber !== undefined
                      ? player.shirtNumber
                      : "–"}
                  </ShirtNumber>
                  <span style={{ overflowWrap: "anywhere" }}>
                    {player.name}
                  </span>
                </PlayerButton>
              ))}
            </SquadColumn>
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

        <SheetFooter>
          {scorer ? (
            <BigButton
              type="button"
              $tone="accent"
              onClick={() => submit(scorer.teamId, scorer.playerId, null)}
            >
              <Check size={18} />
              {t(language, "console.skipAssist")}
            </BigButton>
          ) : (
            <BigButton type="button" $tone="neutral" onClick={onClose}>
              <X size={18} />
              {t(language, "common.cancel")}
            </BigButton>
          )}
        </SheetFooter>
      </Sheet>
    </SheetBackdrop>
  );
};

export default EventSheet;

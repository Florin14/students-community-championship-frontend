import { Goal, Undo2 } from "lucide-react";
import styled from "styled-components";

import { t, type Language } from "../../i18n";
import type { MatchDetails, MatchEvent } from "../../types";

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Row = styled.li<{ $voided: boolean; $away: boolean }>`
  display: grid;
  grid-template-columns: 38px 26px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--divider);
  opacity: ${({ $voided }) => ($voided ? 0.5 : 1)};

  /* A left accent marks whose event it is; the action column stays put so it
     is always in the same place under the thumb. */
  border-left: 3px solid
    ${({ $away }) => ($away ? "var(--violet)" : "var(--accent)")};

  &:last-child {
    border-bottom: none;
  }
`;

const Minute = styled.span`
  min-width: 38px;
  flex: none;
  font-family: "Sora", sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  small {
    font-size: 0.76rem;
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
`;

const Marker = styled.span<{ $type: MatchEvent["type"] }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 8px;
  background: ${({ $type }) =>
    $type === "YELLOW_CARD"
      ? "var(--warning)"
      : $type === "RED_CARD"
        ? "var(--danger)"
        : "var(--accent-soft)"};
  color: ${({ $type }) =>
    $type === "GOAL" || $type === "OWN_GOAL"
      ? "var(--accent)"
      : "var(--accent-contrast)"};
`;

const VoidButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 36px;
  padding: 6px 10px;
  flex: none;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: "Sora", sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
`;

const Empty = styled.p`
  padding: 22px 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.88rem;
`;

interface ConsoleTimelineProps {
  match: MatchDetails;
  events: MatchEvent[];
  language: Language;
  canEdit: boolean;
  onVoid: (event: MatchEvent) => void;
}

/**
 * The full record for this match, voided entries included and visibly greyed.
 * Showing what was cancelled - rather than hiding it - is what lets an operator
 * see that their correction actually landed.
 */
const ConsoleTimeline = ({
  match,
  events,
  language,
  canEdit,
  onVoid,
}: ConsoleTimelineProps) => {
  if (events.length === 0) {
    return <Empty>{t(language, "console.timelineEmpty")}</Empty>;
  }

  const ordered = [...events].sort((a, b) => {
    const minuteA = a.minute ?? 0;
    const minuteB = b.minute ?? 0;
    if (minuteA !== minuteB) return minuteA - minuteB;
    return a.id - b.id;
  });

  return (
    <List>
      {ordered.map((event) => {
        const voided = event.status !== "ACTIVE";
        const isGoal = event.type === "GOAL" || event.type === "OWN_GOAL";
        return (
          <Row
            key={event.id}
            $voided={voided}
            $away={event.teamId === match.awayTeamId}
          >
            <Minute>
              {event.minute !== null && event.minute !== undefined
                ? `${event.minute}′`
                : "—"}
            </Minute>
            <Marker $type={event.type}>
              {isGoal && <Goal size={15} />}
            </Marker>
            <Info>
              <strong>
                {event.playerName ?? t(language, "console.unknownPlayer")}
              </strong>
              <small>
                {t(language, ("event." + event.type) as never)}
                {event.assistName && ` · ${event.assistName}`}
                {voided &&
                  ` · ${t(
                    language,
                    event.status === "VOIDED"
                      ? "event.voided"
                      : "event.corrected"
                  )}`}
                {event.createdByName &&
                  ` · ${t(language, "event.enteredBy", {
                    name: event.createdByName,
                  })}`}
              </small>
            </Info>
            {canEdit && !voided ? (
              <VoidButton type="button" onClick={() => onVoid(event)}>
                <Undo2 size={14} />
                {t(language, "console.voidShort")}
              </VoidButton>
            ) : (
              <span />
            )}
          </Row>
        );
      })}
    </List>
  );
};

export default ConsoleTimeline;

import { Goal as GoalIcon } from "lucide-react";
import styled from "styled-components";

import { t, type Language } from "../../i18n";
import type { MatchEvent } from "../../types";

/**
 * The public match timeline: what happened, in minute order, with each event on
 * the side of the team it belongs to.
 *
 * Only active events are ever passed in - a viewer sees the match, not the
 * corrections. The admin console has its own timeline that shows cancelled
 * entries too.
 */

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
`;

const Row = styled.div<{ $away: boolean }>`
  display: grid;
  grid-template-columns: 46px 1fr;
  align-items: start;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--divider);
  direction: ${({ $away }) => ($away ? "rtl" : "ltr")};
  text-align: ${({ $away }) => ($away ? "right" : "left")};

  &:last-child {
    border-bottom: none;
  }

  /* The rtl flip is only for layout; the text inside reads normally. */
  > * {
    direction: ltr;
  }
`;

const Minute = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  font-family: var(--font-heading);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
`;

const Info = styled.div<{ $away: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  align-items: ${({ $away }) => ($away ? "flex-end" : "flex-start")};

  strong {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.94rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  small {
    font-size: 0.79rem;
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
`;

const CardMark = styled.span<{ $red: boolean }>`
  width: 11px;
  height: 15px;
  flex: none;
  border-radius: 2px;
  background: ${({ $red }) => ($red ? "var(--danger)" : "var(--warning)")};
`;

const Empty = styled.p`
  padding: 26px 18px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeamId: number;
  language: Language;
  emptyLabel?: string;
}

const MatchTimeline = ({
  events,
  homeTeamId,
  language,
  emptyLabel,
}: MatchTimelineProps) => {
  if (events.length === 0) {
    return (
      <Card>
        <Empty>{emptyLabel ?? t(language, "matchDetails.noEvents")}</Empty>
      </Card>
    );
  }

  const ordered = [...events].sort((a, b) => {
    const minuteA = a.minute ?? 0;
    const minuteB = b.minute ?? 0;
    if (minuteA !== minuteB) return minuteA - minuteB;
    return a.id - b.id;
  });

  return (
    <Card>
      {ordered.map((event) => {
        const away = event.teamId !== homeTeamId;
        const isGoal = event.type === "GOAL" || event.type === "OWN_GOAL";
        const isCard =
          event.type === "YELLOW_CARD" || event.type === "RED_CARD";

        return (
          <Row key={event.id} $away={away}>
            <Minute>
              {event.minute !== null && event.minute !== undefined
                ? `${event.minute}′`
                : "—"}
            </Minute>
            <Info $away={away}>
              <strong>
                {isGoal && (
                  <GoalIcon
                    size={15}
                    color="var(--accent)"
                    style={{ flexShrink: 0 }}
                  />
                )}
                {isCard && <CardMark $red={event.type === "RED_CARD"} />}
                {event.playerName ?? "—"}
              </strong>
              {event.type === "OWN_GOAL" && (
                <small>{t(language, "matchDetails.ownGoal")}</small>
              )}
              {event.assistName && (
                <small>
                  {t(language, "matchDetails.assist")}: {event.assistName}
                </small>
              )}
            </Info>
          </Row>
        );
      })}
    </Card>
  );
};

export default MatchTimeline;

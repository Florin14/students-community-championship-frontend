import { Radio, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import LoadingState from "../components/reusable/LoadingState";
import MatchClockLabel from "../components/reusable/MatchClockLabel";
import MatchTimeline from "../components/reusable/MatchTimeline";
import TeamBadge from "../components/reusable/TeamBadge";
import { useLiveFeed } from "../hooks/useLiveFeed";
import { t } from "../i18n";
import { useAppSelector } from "../store/hooks";

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MatchBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Board = styled(Link)`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  padding: 20px 18px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  text-decoration: none;

  &:hover {
    border-color: var(--accent);
  }
`;

const Side = styled.div<{ $align: "left" | "right" }>`
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  flex-direction: ${({ $align }) => ($align === "right" ? "row-reverse" : "row")};

  strong {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
`;

const Middle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const Score = styled.span`
  font-family: var(--font-heading);
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const StreamMark = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;

  @media (max-width: 480px) {
    span {
      display: none;
    }
  }
`;

const Clock = styled.span`
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--danger-soft);
  color: var(--danger);
  font-family: var(--font-heading);
  font-size: 0.71rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

/**
 * Public live scores. Subscribes to the live feed - pushed by the live service,
 * polled when that is unavailable - and repaints only when the feed's revision
 * changes, so an idle afternoon costs nothing and no re-renders.
 */
const LiveScores = () => {
  const language = useAppSelector((state) => state.i18n.language);
  const { matches, ready, receivedAt } = useAppSelector((state) => state.live);

  useLiveFeed();

  if (!ready) return <LoadingState />;

  return (
    <>
      {matches.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={t(language, "live.none")}
          subtitle={t(language, "live.noneHint")}
        />
      ) : (
        <Grid>
          {matches.map((match) => (
            <MatchBlock key={match.id}>
              <Board to={`/matches/${match.id}`}>
                <Side $align="left">
                  <TeamBadge
                    name={match.homeTeamName}
                    shortName={match.homeTeamShortName}
                    logo={match.homeTeamLogo}
                    color={match.homeTeamColor}
                    size={44}
                  />
                  <strong>{match.homeTeamName}</strong>
                </Side>
                <Middle>
                  <Score>
                    {match.scoreHome ?? 0} : {match.scoreAway ?? 0}
                  </Score>
                  <Clock>
                    <MatchClockLabel
                      match={match}
                      receivedAt={receivedAt}
                      language={language}
                    />
                  </Clock>
                  {match.streamUrl && (
                    <StreamMark>
                      <Tv size={13} />
                      <span>{t(language, "live.streamAvailable")}</span>
                    </StreamMark>
                  )}
                </Middle>
                <Side $align="right">
                  <TeamBadge
                    name={match.awayTeamName}
                    shortName={match.awayTeamShortName}
                    logo={match.awayTeamLogo}
                    color={match.awayTeamColor}
                    size={44}
                  />
                  <strong>{match.awayTeamName}</strong>
                </Side>
              </Board>

              {match.events.length > 0 && (
                <MatchTimeline
                  events={match.events}
                  homeTeamId={match.homeTeamId}
                  language={language}
                />
              )}
            </MatchBlock>
          ))}
        </Grid>
      )}
    </>
  );
};

export default LiveScores;

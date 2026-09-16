import { ArrowRight, Radio, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { useLiveFeed } from "../../hooks/useLiveFeed";
import { t } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import TeamBadge from "./TeamBadge";
import MatchClockLabel from "./MatchClockLabel";

const Wrap = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--danger-soft);
  color: var(--danger);
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const More = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
`;

const Rail = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
`;

const Tile = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--danger);
  background: var(--bg-card);
  text-decoration: none;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Team = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;

  span {
    font-family: var(--font-heading);
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
`;

const Goals = styled.strong`
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`;

const Minute = styled.small`
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--danger);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  svg {
    color: var(--text-secondary);
  }
`;

/**
 * The live band on the home page.
 *
 * Renders nothing when no match is in progress, so the page is not padded with
 * an empty placeholder for most of the week. It shares the live feed (and its
 * slice) with the live page, so having both mounted costs one subscription.
 */
const LiveStrip = () => {
  const language = useAppSelector((state) => state.i18n.language);
  const matches = useAppSelector((state) => state.live.matches);
  const receivedAt = useAppSelector((state) => state.live.receivedAt);

  useLiveFeed();

  if (matches.length === 0) return null;

  return (
    <Wrap>
      <Head>
        <Badge>
          <Radio size={13} />
          {t(language, "live.badge")}
        </Badge>
        <More to="/live">
          {t(language, "common.viewAll")}
          <ArrowRight size={14} />
        </More>
      </Head>

      <Rail>
        {matches.map((match) => (
          <Tile key={match.id} to={`/matches/${match.id}`}>
            <Row>
              <Team>
                <TeamBadge
                  name={match.homeTeamName}
                  shortName={match.homeTeamShortName}
                  logo={match.homeTeamLogo}
                  color={match.homeTeamColor}
                  size={26}
                />
                <span>{match.homeTeamShortName ?? match.homeTeamName}</span>
              </Team>
              <Goals>{match.scoreHome ?? 0}</Goals>
            </Row>
            <Row>
              <Team>
                <TeamBadge
                  name={match.awayTeamName}
                  shortName={match.awayTeamShortName}
                  logo={match.awayTeamLogo}
                  color={match.awayTeamColor}
                  size={26}
                />
                <span>{match.awayTeamShortName ?? match.awayTeamName}</span>
              </Team>
              <Goals>{match.scoreAway ?? 0}</Goals>
            </Row>
            <Minute>
              <MatchClockLabel
                match={match}
                receivedAt={receivedAt}
                language={language}
              />
              {match.streamUrl && (
                <Tv size={13} aria-label={t(language, "live.streamAvailable")} />
              )}
            </Minute>
          </Tile>
        ))}
      </Rail>
    </Wrap>
  );
};

export default LiveStrip;

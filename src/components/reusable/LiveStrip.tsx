import { ArrowRight, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { usePolling } from "../../hooks/usePolling";
import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchLiveMatches } from "../../store/slices/thunks/liveThunks";
import TeamBadge from "./TeamBadge";

/** Matches the poll interval used by the dedicated live page. */
const POLL_MS = 10000;

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
  font-family: "Sora", sans-serif;
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
    font-family: "Sora", sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
`;

const Goals = styled.strong`
  font-family: "Sora", sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
`;

const Minute = styled.small`
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--danger);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

/**
 * The live band on the home page.
 *
 * Renders nothing when no match is in progress, so the page is not padded with
 * an empty placeholder for most of the week. It polls the same single live
 * endpoint as the live page and shares its slice, so having both mounted costs
 * one request per interval.
 */
const LiveStrip = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const matches = useAppSelector((state) => state.live.matches);

  usePolling(() => void dispatch(fetchLiveMatches()), {
    intervalMs: POLL_MS,
  });

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
              {match.state === "HALF_TIME"
                ? t(language, "live.halfTime")
                : t(language, "live.minuteShort", {
                    minute: match.currentMinute ?? 1,
                  })}
            </Minute>
          </Tile>
        ))}
      </Rail>
    </Wrap>
  );
};

export default LiveStrip;

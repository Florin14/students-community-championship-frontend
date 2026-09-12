import { Radio } from "lucide-react";
import { useEffect } from "react";
import styled from "styled-components";

import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatches } from "../store/slices/thunks/matchesThunks";
import {
  fetchOverview,
  fetchTopScorers,
} from "../store/slices/thunks/statsThunks";
import NavTabs, { NavTab } from "./NavTabs";
import LiveStrip from "./reusable/LiveStrip";
import SeasonSelector from "./reusable/SeasonSelector";
import StatStrip from "./reusable/StatStrip";
import TopScorerHero from "./reusable/TopScorerHero";

// The headline numbers run edge to edge, like a second header row.
const StatsBand = styled.div`
  border-bottom: 1px solid var(--divider);
  background: var(--bg-band);
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

const Hero = styled(Inner)`
  padding-top: 24px;

  @media (max-width: 640px) {
    padding-top: 18px;
  }
`;

const TabRow = styled(Inner)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--divider);

  @media (max-width: 720px) {
    flex-wrap: wrap;
    padding-bottom: 10px;
  }
`;

// The tab row keeps its divider full-width while the tabs scroll under it;
// on a phone the season selector drops to its own line.
const TabScroll = styled.div`
  min-width: 0;
  flex: 1;

  @media (max-width: 720px) {
    flex-basis: 100%;
  }
`;

interface DashboardBandProps {
  /** Show the stat strip and top-scorer hero above the tabs. */
  showStats: boolean;
}

/**
 * Everything between the header and the page: the season's headline numbers,
 * the live band, the top-scorer hero and the single row of navigation tabs.
 * Rendered by the Layout on every public page, so the tabs never move.
 */
const DashboardBand = ({ showStats }: DashboardBandProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );
  const { overview, topScorers } = useAppSelector((state) => state.stats);
  const liveCount = useAppSelector((state) => state.live.matches.length);

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    if (!showStats) return;
    const params = seasonId ? { seasonId } : undefined;
    dispatch(fetchOverview(params));
    dispatch(fetchTopScorers({ ...(params ?? {}), limit: 1 }));
  }, [dispatch, seasonId, showStats]);

  // The round chip in the header reads the season's matches on every page.
  useEffect(() => {
    dispatch(fetchMatches(seasonId ? { seasonId } : undefined));
  }, [dispatch, seasonId]);

  const dash = "—";
  const totalCards = overview
    ? overview.yellowCards + overview.redCards
    : dash;

  const tabs: NavTab[] = [
    { to: "/", label: t(language, "nav.standings"), end: true },
    { to: "/matches", label: t(language, "nav.matches") },
    {
      to: "/live",
      label: t(language, "nav.live"),
      icon: Radio,
      live: liveCount > 0,
    },
    { to: "/players", label: t(language, "nav.players") },
    { to: "/teams", label: t(language, "nav.teams") },
    { to: "/stats", label: t(language, "nav.stats") },
  ];

  return (
    <>
      {showStats && (
        <StatsBand>
          <Inner>
            <StatStrip
              items={[
                {
                  value: overview?.goals ?? dash,
                  label: t(language, "home.statGoals"),
                },
                {
                  value: overview?.matchesPlayed ?? dash,
                  label: t(language, "home.statMatchesPlayed"),
                },
                {
                  value:
                    overview && overview.matchesPlayed > 0
                      ? overview.avgGoalsPerMatch.toFixed(1)
                      : dash,
                  label: t(language, "home.statAvgGoals"),
                },
                {
                  value: overview?.teams ?? dash,
                  label: t(language, "home.statTeams"),
                },
                { value: totalCards, label: t(language, "home.statCards") },
              ]}
            />
          </Inner>
        </StatsBand>
      )}

      {showStats && (
        <Hero>
          <LiveStrip />
          {overview?.topScorerName && (
            <TopScorerHero
              playerId={topScorers[0]?.playerId}
              name={overview.topScorerName}
              teamName={overview.topScorerTeamName}
              avatar={topScorers[0]?.avatar}
              goals={overview.topScorerGoals}
              eyebrow={t(language, "home.topScorerLabel")}
              unit={t(language, "common.goals")}
            />
          )}
        </Hero>
      )}

      <TabRow>
        <TabScroll>
          <NavTabs tabs={tabs} />
        </TabScroll>
        <SeasonSelector minWidth={170} />
      </TabRow>
    </>
  );
};

export default DashboardBand;

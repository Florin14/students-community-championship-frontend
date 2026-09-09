import { Button } from "@mui/material";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Flame,
  Goal,
  ListOrdered,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

import MatchCard from "../components/reusable/MatchCard";
import EmptyState from "../components/reusable/EmptyState";
import SectionHeading from "../components/reusable/SectionHeading";
import StatCard from "../components/reusable/StatCard";
import TeamBadge from "../components/reusable/TeamBadge";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatches } from "../store/slices/thunks/matchesThunks";
import { fetchStandings } from "../store/slices/thunks/standingsThunks";
import {
  fetchOverview,
  fetchTopScorers,
} from "../store/slices/thunks/statsThunks";

const Hero = styled(motion.section)`
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--border);
  background:
    radial-gradient(
      620px 260px at 85% -20%,
      var(--violet-soft),
      transparent 70%
    ),
    radial-gradient(
      520px 300px at -10% 110%,
      var(--accent-soft),
      transparent 70%
    ),
    var(--bg-card);
  padding: 48px 40px;
  margin-bottom: 28px;

  @media (max-width: 640px) {
    padding: 32px 22px;
  }
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: "Sora", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 18px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  font-weight: 800;
  line-height: 1.12;
  color: var(--text-primary);
  max-width: 640px;

  em {
    font-style: normal;
    background: linear-gradient(90deg, var(--accent), var(--violet));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  margin-top: 14px;
  color: var(--text-secondary);
  font-size: 1rem;
  max-width: 520px;
`;

const HeroActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 36px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SideCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-card);
`;

const MiniRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  border-radius: 12px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-surface);
  }
`;

const MiniPos = styled.span<{ $top: boolean }>`
  width: 22px;
  text-align: center;
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  color: ${({ $top }) => ($top ? "var(--accent)" : "var(--text-disabled)")};
`;

const MiniName = styled.span`
  flex: 1;
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MiniValue = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  color: var(--text-primary);
`;

const MiniLabel = styled.span`
  font-size: 0.72rem;
  color: var(--text-disabled);
  margin-left: 4px;
`;

const SideDivider = styled.div`
  height: 1px;
  background: var(--divider);
  margin: 16px 0;
`;

const ViewAll = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
`;

const SectionSpacer = styled.div`
  height: 36px;
`;

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );
  const { matches } = useAppSelector((state) => state.matches);
  const { standings } = useAppSelector((state) => state.standings);
  const { overview, topScorers } = useAppSelector((state) => state.stats);

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    const params = seasonId ? { seasonId } : undefined;
    dispatch(fetchMatches(params));
    dispatch(fetchOverview(params));
    dispatch(fetchTopScorers({ ...(params ?? {}), limit: 5 }));
    if (seasonId) {
      dispatch(fetchStandings({ seasonId }));
    }
  }, [dispatch, seasonId]);

  const now = Date.now();
  const upcoming = useMemo(
    () =>
      matches
        .filter(
          (m) =>
            m.state === "SCHEDULED" &&
            new Date(m.timestamp.replace(" ", "T")).getTime() >= now - 3600000
        )
        .slice(0, 4),
    [matches, now]
  );
  const latest = useMemo(
    () =>
      [...matches]
        .filter((m) => m.state === "FINISHED")
        .reverse()
        .slice(0, 4),
    [matches]
  );

  return (
    <>
      <Hero
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <HeroBadge>
          <Flame size={13} />
          {activeSeason?.name ?? t(language, "app.tagline")}
        </HeroBadge>
        <HeroTitle>
          {t(language, "home.heroTitle1")}{" "}
          <em>{t(language, "home.heroTitleAccent")}</em>{" "}
          {t(language, "home.heroTitle2")}
        </HeroTitle>
        <HeroSubtitle>{t(language, "home.heroSubtitle")}</HeroSubtitle>
        <HeroActions>
          <Button
            variant="contained"
            size="large"
            startIcon={<CalendarDays size={17} />}
            onClick={() => navigate("/matches")}
          >
            {t(language, "home.ctaMatches")}
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="inherit"
            startIcon={<ListOrdered size={17} />}
            onClick={() => navigate("/standings")}
            sx={{ borderColor: "var(--border-strong)" }}
          >
            {t(language, "home.ctaStandings")}
          </Button>
        </HeroActions>
      </Hero>

      <StatsGrid>
        <StatCard
          icon={Users}
          value={overview?.teams ?? "—"}
          label={t(language, "home.statTeams")}
          tone="accent"
        />
        <StatCard
          icon={CalendarDays}
          value={overview?.matchesPlayed ?? "—"}
          label={t(language, "home.statMatchesPlayed")}
          hint={
            overview
              ? `${overview.matchesUpcoming} ${t(language, "home.statUpcomingHint")}`
              : undefined
          }
          tone="violet"
        />
        <StatCard
          icon={Goal}
          value={overview?.goals ?? "—"}
          label={t(language, "home.statGoals")}
          hint={
            overview && overview.matchesPlayed > 0
              ? `${overview.avgGoalsPerMatch} ${t(language, "home.statAvgHint")}`
              : undefined
          }
          tone="warning"
        />
        <StatCard
          icon={Target}
          value={overview?.topScorerGoals || "—"}
          label={t(language, "home.statTopScorer")}
          hint={overview?.topScorerName ?? undefined}
          tone="danger"
        />
      </StatsGrid>

      <TwoCols>
        <div>
          <SectionHeading
            title={t(language, "home.upcoming")}
            action={
              <ViewAll to="/matches">
                {t(language, "common.viewAll")}
                <ArrowRight size={14} />
              </ViewAll>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={t(language, "home.noUpcoming")}
              subtitle={t(language, "home.noUpcomingHint")}
            />
          ) : (
            <MatchList>
              {upcoming.map((match) => (
                <MatchCard key={match.id} match={match} language={language} />
              ))}
            </MatchList>
          )}

          <SectionSpacer />

          <SectionHeading
            title={t(language, "home.latestResults")}
            action={
              <ViewAll to="/matches">
                {t(language, "common.viewAll")}
                <ArrowRight size={14} />
              </ViewAll>
            }
          />
          {latest.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title={t(language, "home.noResults")}
              subtitle={t(language, "home.noResultsHint")}
            />
          ) : (
            <MatchList>
              {latest.map((match) => (
                <MatchCard key={match.id} match={match} language={language} />
              ))}
            </MatchList>
          )}
        </div>

        <div>
          <SideCard>
            <SectionHeading title={t(language, "home.miniStandings")} />
            {standings.slice(0, 5).map((standing, index) => (
              <MiniRow key={standing.id} to={`/teams/${standing.teamId}`}>
                <MiniPos $top={index === 0}>{index + 1}</MiniPos>
                <TeamBadge
                  name={standing.teamName}
                  shortName={standing.teamShortName}
                  logo={standing.teamLogo}
                  color={standing.teamColor}
                  size={30}
                />
                <MiniName>{standing.teamName}</MiniName>
                <MiniValue>{standing.points}</MiniValue>
                <MiniLabel>{t(language, "standings.ptsShort")}</MiniLabel>
              </MiniRow>
            ))}
            {standings.length === 0 && (
              <EmptyState
                icon={ListOrdered}
                title={t(language, "home.noStandings")}
              />
            )}
            {standings.length > 0 && (
              <ViewAll to="/standings">
                {t(language, "common.viewAll")}
                <ArrowRight size={14} />
              </ViewAll>
            )}

            <SideDivider />

            <SectionHeading title={t(language, "home.topScorers")} />
            {topScorers.map((player, index) => (
              <MiniRow key={player.playerId} to={`/players/${player.playerId}`}>
                <MiniPos $top={index === 0}>{index + 1}</MiniPos>
                <MiniName>
                  {player.name}
                  <MiniLabel>{player.teamName}</MiniLabel>
                </MiniName>
                <MiniValue>{player.goals}</MiniValue>
                <MiniLabel>{t(language, "common.goalsShort")}</MiniLabel>
              </MiniRow>
            ))}
            {topScorers.length === 0 && (
              <EmptyState
                icon={Target}
                title={t(language, "home.noScorers")}
              />
            )}
            {topScorers.length > 0 && (
              <ViewAll to="/stats">
                {t(language, "common.viewAll")}
                <ArrowRight size={14} />
              </ViewAll>
            )}
          </SideCard>
        </div>
      </TwoCols>
    </>
  );
};

export default Home;

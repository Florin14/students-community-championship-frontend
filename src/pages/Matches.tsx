import { MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import LoadingState from "../components/reusable/LoadingState";
import MatchCard from "../components/reusable/MatchCard";
import CompetitionCalendar from "../components/reusable/CompetitionCalendar";
import StyledSelect from "../components/reusable/StyledSelect";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatches } from "../store/slices/thunks/matchesThunks";
import { fetchTeams } from "../store/slices/thunks/teamsThunks";
import type { Match } from "../types";

type Tab = "all" | "upcoming" | "results";

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px;
`;

const TabPill = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 999px;
  font-family: var(--font-heading);
  font-size: 0.82rem;
  font-weight: 700;
  background: ${({ $active }) =>
    $active ? "var(--accent)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--accent-contrast)" : "var(--text-secondary)"};
  transition: all 0.15s ease;

  &:hover {
    color: ${({ $active }) =>
      $active ? "var(--accent-contrast)" : "var(--text-primary)"};
  }
`;

const RoundGroup = styled(motion.section)`
  margin-bottom: 30px;
`;

const RoundHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const RoundCount = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  font-family: var(--font-heading);
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--violet-soft);
  color: var(--violet);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

interface RoundBucket {
  key: string;
  label: string | null;
  round: number | null;
  matches: Match[];
}

const Matches = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason, seasons } = useAppSelector(
    (state) => state.seasons
  );
  const { matches, loading } = useAppSelector((state) => state.matches);
  const { teams } = useAppSelector((state) => state.teams);

  const [tab, setTab] = useState<Tab>("all");
  const [teamFilter, setTeamFilter] = useState<number | "">("");

  const seasonId = selectedSeasonId ?? activeSeason?.id;
  const season = seasons.find((item) => item.id === seasonId) ??
    (activeSeason?.id === seasonId ? activeSeason : null);

  useEffect(() => {
    const params = seasonId ? { seasonId } : undefined;
    dispatch(fetchMatches(params));
    dispatch(fetchTeams(params));
    setTeamFilter("");
  }, [dispatch, seasonId]);

  const buckets = useMemo<RoundBucket[]>(() => {
    const filtered = matches.filter((match) => {
      if (tab === "upcoming" && match.state === "FINISHED") return false;
      if (tab === "results" && match.state !== "FINISHED") return false;
      if (
        teamFilter !== "" &&
        match.homeTeamId !== teamFilter &&
        match.awayTeamId !== teamFilter
      ) {
        return false;
      }
      return true;
    });

    const byRound = new Map<string, RoundBucket>();
    filtered.forEach((match) => {
      const round = match.round ?? null;
      const label = round === null ? match.calendarLabel ?? null : null;
      const key = round === null ? `phase:${label ?? "none"}` : `round:${round}`;
      const bucket = byRound.get(key) ?? { key, round, label, matches: [] };
      bucket.matches.push(match);
      byRound.set(key, bucket);
    });

    return [...byRound.values()].sort((a, b) =>
      Math.max(...b.matches.map((match) => new Date(match.timestamp.replace(" ", "T")).getTime())) -
      Math.max(...a.matches.map((match) => new Date(match.timestamp.replace(" ", "T")).getTime()))
    );
  }, [matches, tab, teamFilter]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t(language, "matches.tabAll") },
    { key: "upcoming", label: t(language, "matches.tabUpcoming") },
    { key: "results", label: t(language, "matches.tabResults") },
  ];

  return (
    <>
      {season && <CompetitionCalendar season={season} language={language} />}
      <FilterBar>
        <Tabs>
          {tabs.map(({ key, label }) => (
            <TabPill
              key={key}
              $active={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
            </TabPill>
          ))}
        </Tabs>
        <StyledSelect
          size="small"
          value={teamFilter}
          onChange={(event) =>
            setTeamFilter(
              event.target.value === "" ? "" : Number(event.target.value)
            )
          }
          displayEmpty
          sx={{ minWidth: 210 }}
        >
          <MenuItem value="">{t(language, "matches.allTeams")}</MenuItem>
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </StyledSelect>
      </FilterBar>

      {loading ? (
        <LoadingState />
      ) : buckets.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={t(language, "matches.empty")}
          subtitle={t(language, "matches.emptyHint")}
        />
      ) : (
        buckets.map(({ key, round, label, matches: roundMatches }) => (
          <RoundGroup
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <RoundHeader>
              <h3>
                {round !== null
                  ? `${t(language, "matches.round")} ${round}`
                  : label ?? t(language, "matches.noRound")}
              </h3>
              <RoundCount>{roundMatches.length}</RoundCount>
            </RoundHeader>
            <Grid>
              {roundMatches.map((match) => (
                <MatchCard key={match.id} match={match} language={language} />
              ))}
            </Grid>
          </RoundGroup>
        ))
      )}
    </>
  );
};

export default Matches;

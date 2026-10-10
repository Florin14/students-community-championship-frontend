import { motion } from "framer-motion";
import { GraduationCap, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import LoadingState from "../components/reusable/LoadingState";
import StyledTextField from "../components/reusable/StyledTextField";
import TeamBadge from "../components/reusable/TeamBadge";
import { usePageNavigation } from "../hooks/usePageNavigation";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTeams } from "../store/slices/thunks/teamsThunks";

const Filters = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const Card = styled(motion(Link))`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-card-hover);
    border-color: var(--border-strong);
  }
`;

const TeamName = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const Faculty = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: var(--text-secondary);

  svg {
    flex-shrink: 0;
    color: var(--text-disabled);
  }
`;

const PlayerCount = styled.div`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-heading);
`;

const Teams = () => {
  const dispatch = useAppDispatch();
  const { linkState } = usePageNavigation();
  const language = useAppSelector((state) => state.i18n.language);
  const { teams, loading } = useAppSelector((state) => state.teams);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );
  const [search, setSearch] = useState("");

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    dispatch(fetchTeams(seasonId ? { seasonId } : undefined));
  }, [dispatch, seasonId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        (team.university ?? "").toLowerCase().includes(query) ||
        (team.faculty ?? "").toLowerCase().includes(query)
    );
  }, [teams, search]);

  return (
    <>
      <Filters>
        <StyledTextField
          size="small"
          placeholder={t(language, "common.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Filters>

      {loading && teams.length === 0 ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t(language, "teams.empty")}
          subtitle={t(language, "teams.emptyHint")}
        />
      ) : (
        <Grid>
          {filtered.map((team, index) => (
            <Card
              key={team.id}
              to={`/teams/${team.id}`}
              state={linkState}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
            >
              <TeamBadge
                name={team.name}
                shortName={team.shortName}
                logo={team.logo}
                color={team.color}
                size={56}
              />
              <TeamName>{team.name}</TeamName>
              {team.university && (
                <Faculty><GraduationCap size={15} />{team.university}</Faculty>
              )}
              {team.faculty && (
                <Faculty>
                  <GraduationCap size={15} />
                  {team.faculty}
                </Faculty>
              )}
              <PlayerCount>
                <Users size={13} />
                {t(language, "teams.playersCount", {
                  count: team.playerCount,
                })}
              </PlayerCount>
            </Card>
          ))}
        </Grid>
      )}
    </>
  );
};

export default Teams;

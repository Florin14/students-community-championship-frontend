import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, GraduationCap, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import FormPills from "../components/reusable/FormPills";
import MatchCard from "../components/reusable/MatchCard";
import SectionHeading from "../components/reusable/SectionHeading";
import TeamBadge from "../components/reusable/TeamBadge";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatches } from "../store/slices/thunks/matchesThunks";
import { fetchPlayers } from "../store/slices/thunks/playersThunks";
import { fetchStandings } from "../store/slices/thunks/standingsThunks";
import { fetchTeamById } from "../store/slices/thunks/teamsThunks";
import { parseApiDate } from "../utils/dateFormat";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 18px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
`;

const HeaderCard = styled(motion.section)`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 26px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TeamName = styled.h1`
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const Faculty = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.88rem;
  color: var(--text-secondary);
`;

const Description = styled.p`
  font-size: 0.88rem;
  color: var(--text-secondary);
  max-width: 560px;
`;

const ChipsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const StatChip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border);

  strong {
    font-family: "Sora", sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  span {
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
  }
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const RosterCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-card);
`;

const RosterRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 12px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-surface);
  }
`;

const ShirtNumber = styled.span`
  min-width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  color: var(--text-primary);
`;

const PlayerName = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PositionTag = styled.span`
  font-size: 0.72rem;
  color: var(--text-disabled);
`;

const GoalsCount = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--accent);
`;

const MatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TeamDetails = () => {
  const { id } = useParams();
  const teamId = Number(id);
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedTeam } = useAppSelector((state) => state.teams);
  const { players } = useAppSelector((state) => state.players);
  const { matches } = useAppSelector((state) => state.matches);
  const { standings } = useAppSelector((state) => state.standings);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    if (!Number.isFinite(teamId)) return;
    dispatch(fetchTeamById({ id: teamId }));
    dispatch(fetchPlayers({ teamId }));
  }, [dispatch, teamId]);

  useEffect(() => {
    if (!Number.isFinite(teamId)) return;
    dispatch(fetchMatches({ teamId, ...(seasonId ? { seasonId } : {}) }));
    if (seasonId) {
      dispatch(fetchStandings({ seasonId }));
    }
  }, [dispatch, teamId, seasonId]);

  const standingIndex = standings.findIndex((s) => s.teamId === teamId);
  const standing = standingIndex >= 0 ? standings[standingIndex] : null;

  const roster = useMemo(
    () =>
      [...players]
        .filter((player) => player.teamId === teamId)
        .sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999)),
    [players, teamId]
  );

  const teamMatches = useMemo(
    () =>
      [...matches]
        .filter(
          (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
        )
        .sort(
          (a, b) =>
            parseApiDate(b.timestamp).getTime() -
            parseApiDate(a.timestamp).getTime()
        ),
    [matches, teamId]
  );

  if (!selectedTeam || selectedTeam.id !== teamId) {
    return (
      <>
        <BackLink to="/teams">
          <ArrowLeft size={15} />
          {t(language, "teamDetails.back")}
        </BackLink>
        <EmptyState icon={Users} title={t(language, "teamDetails.notFound")} />
      </>
    );
  }

  return (
    <>
      <BackLink to="/teams">
        <ArrowLeft size={15} />
        {t(language, "teamDetails.back")}
      </BackLink>

      <HeaderCard
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TeamBadge
          name={selectedTeam.name}
          shortName={selectedTeam.shortName}
          logo={selectedTeam.logo}
          color={selectedTeam.color}
          size={72}
        />
        <HeaderInfo>
          <TeamName>{selectedTeam.name}</TeamName>
          {selectedTeam.faculty && (
            <Faculty>
              <GraduationCap size={15} />
              {selectedTeam.faculty}
            </Faculty>
          )}
          {selectedTeam.description && (
            <Description>{selectedTeam.description}</Description>
          )}
          {standing && (
            <ChipsRow>
              <StatChip>
                <strong>#{standingIndex + 1}</strong>
                <span>{t(language, "teamDetails.position")}</span>
              </StatChip>
              <StatChip>
                <strong>{standing.points}</strong>
                <span>{t(language, "teamDetails.points")}</span>
              </StatChip>
              <StatChip>
                <strong>
                  {standing.wins}-{standing.draws}-{standing.losses}
                </strong>
                <span>{t(language, "teamDetails.record")}</span>
              </StatChip>
              <StatChip>
                <strong>
                  {standing.goalDiff > 0 ? "+" : ""}
                  {standing.goalDiff}
                </strong>
                <span>{t(language, "teamDetails.goalDiff")}</span>
              </StatChip>
              <FormPills form={standing.form} />
            </ChipsRow>
          )}
        </HeaderInfo>
      </HeaderCard>

      <Columns>
        <RosterCard>
          <SectionHeading title={t(language, "teamDetails.roster")} />
          {roster.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t(language, "teamDetails.noPlayers")}
            />
          ) : (
            roster.map((player) => (
              <RosterRow key={player.id} to={`/players/${player.id}`}>
                <ShirtNumber>
                  {player.shirtNumber !== null &&
                  player.shirtNumber !== undefined
                    ? player.shirtNumber
                    : "–"}
                </ShirtNumber>
                <PlayerName>
                  {player.name}
                  {player.position && (
                    <>
                      {" "}
                      <PositionTag>
                        {t(
                          language,
                          ("position." + player.position) as never
                        )}
                      </PositionTag>
                    </>
                  )}
                </PlayerName>
                <GoalsCount>
                  {player.goals} {t(language, "common.goalsShort")}
                </GoalsCount>
              </RosterRow>
            ))
          )}
        </RosterCard>

        <div>
          <SectionHeading title={t(language, "teamDetails.matches")} />
          {teamMatches.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={t(language, "teamDetails.noMatches")}
            />
          ) : (
            <MatchList>
              {teamMatches.map((match) => (
                <MatchCard key={match.id} match={match} language={language} />
              ))}
            </MatchList>
          )}
        </div>
      </Columns>
    </>
  );
};

export default TeamDetails;

import { motion } from "framer-motion";
import { ListOrdered } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import FormPills from "../components/reusable/FormPills";
import LoadingState from "../components/reusable/LoadingState";
import SeasonSelector from "../components/reusable/SeasonSelector";
import SectionHeading from "../components/reusable/SectionHeading";
import TeamBadge from "../components/reusable/TeamBadge";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStandings } from "../store/slices/thunks/standingsThunks";

const TableCard = styled(motion.div)`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const Th = styled.th<{ $align?: string }>`
  padding: 14px 12px;
  font-family: "Sora", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  text-align: ${({ $align }) => $align ?? "center"};
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
`;

const FormTh = styled(Th)`
  @media (max-width: 860px) {
    display: none;
  }
`;

const Row = styled.tr<{ $leader: boolean }>`
  cursor: pointer;
  background: ${({ $leader }) =>
    $leader ? "var(--accent-soft)" : "transparent"};
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-surface);
  }
`;

const Td = styled.td<{ $align?: string }>`
  padding: 12px;
  font-size: 0.88rem;
  color: var(--text-primary);
  text-align: ${({ $align }) => $align ?? "center"};
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
`;

const FormTd = styled(Td)`
  @media (max-width: 860px) {
    display: none;
  }
`;

const Pos = styled.span<{ $leader: boolean }>`
  font-family: "Sora", sans-serif;
  font-weight: 800;
  color: ${({ $leader }) =>
    $leader ? "var(--accent)" : "var(--text-disabled)"};
`;

const TeamCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const TeamName = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Diff = styled.span<{ $value: number }>`
  font-weight: 700;
  color: ${({ $value }) =>
    $value > 0
      ? "var(--accent)"
      : $value < 0
        ? "var(--danger)"
        : "var(--text-secondary)"};
`;

const Points = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--accent);
`;

const Standings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );
  const { standings, loading } = useAppSelector((state) => state.standings);

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    if (seasonId) {
      dispatch(fetchStandings({ seasonId }));
    }
  }, [dispatch, seasonId]);

  return (
    <>
      <SectionHeading
        title={t(language, "standings.title")}
        subtitle={t(language, "standings.subtitle")}
        action={<SeasonSelector />}
      />

      {loading ? (
        <LoadingState />
      ) : !seasonId || standings.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title={t(language, "standings.empty")}
          subtitle={t(language, "standings.emptyHint")}
        />
      ) : (
        <TableCard
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th $align="left">{t(language, "standings.hdrTeam")}</Th>
                <Th>{t(language, "standings.hdrPlayed")}</Th>
                <Th>{t(language, "standings.hdrWins")}</Th>
                <Th>{t(language, "standings.hdrDraws")}</Th>
                <Th>{t(language, "standings.hdrLosses")}</Th>
                <Th>{t(language, "standings.hdrGoalsFor")}</Th>
                <Th>{t(language, "standings.hdrGoalsAgainst")}</Th>
                <Th>+/-</Th>
                <Th>{t(language, "standings.hdrPoints")}</Th>
                <FormTh>{t(language, "standings.hdrForm")}</FormTh>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <Row
                  key={standing.id}
                  $leader={index === 0}
                  onClick={() => navigate(`/teams/${standing.teamId}`)}
                >
                  <Td>
                    <Pos $leader={index === 0}>{index + 1}</Pos>
                  </Td>
                  <Td $align="left">
                    <TeamCell>
                      <TeamBadge
                        name={standing.teamName}
                        shortName={standing.teamShortName}
                        logo={standing.teamLogo}
                        color={standing.teamColor}
                        size={34}
                      />
                      <TeamName>{standing.teamName}</TeamName>
                    </TeamCell>
                  </Td>
                  <Td>{standing.played}</Td>
                  <Td>{standing.wins}</Td>
                  <Td>{standing.draws}</Td>
                  <Td>{standing.losses}</Td>
                  <Td>{standing.goalsFor}</Td>
                  <Td>{standing.goalsAgainst}</Td>
                  <Td>
                    <Diff $value={standing.goalDiff}>
                      {standing.goalDiff > 0 ? "+" : ""}
                      {standing.goalDiff}
                    </Diff>
                  </Td>
                  <Td>
                    <Points>{standing.points}</Points>
                  </Td>
                  <FormTd>
                    <FormPills form={standing.form} />
                  </FormTd>
                </Row>
              ))}
            </tbody>
          </Table>
        </TableCard>
      )}
    </>
  );
};

export default Standings;

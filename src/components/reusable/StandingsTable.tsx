import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Language, t } from "../../i18n";
import { Standing } from "../../types";
import FormPills from "./FormPills";
import TeamBadge from "./TeamBadge";
import { usePageNavigation } from "../../hooks/usePageNavigation";

const Wrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;

  @media (max-width: 640px) {
    min-width: 0;
  }
`;

// On a phone only played / goal difference / points survive: the breakdown
// columns are what the row is made of, not what the reader is looking for.
const narrowColumn = `
  @media (max-width: 640px) {
    display: none;
  }
`;

const Th = styled.th<{ $align?: string }>`
  padding: 12px 10px;
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
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

const NarrowTh = styled(Th)`
  ${narrowColumn}
`;

const Row = styled.tr`
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-surface);
  }
  &:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
`;

const Td = styled.td<{ $align?: string; $muted?: boolean }>`
  padding: 12px 10px;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  color: ${({ $muted }) =>
    $muted ? "var(--text-secondary)" : "var(--text-primary)"};
  text-align: ${({ $align }) => $align ?? "center"};
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
`;

const FormTd = styled(Td)`
  @media (max-width: 860px) {
    display: none;
  }
`;

const NarrowTd = styled(Td)`
  ${narrowColumn}
`;

// The first cell carries a coloured bar for the qualifying places, so the
// top of the table reads without counting rows.
const RankCell = styled(Td)<{ $qualifying: boolean }>`
  position: relative;
  width: 44px;
  padding-left: 18px;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-secondary);

  &::before {
    content: "";
    position: absolute;
    left: 6px;
    top: 12px;
    bottom: 12px;
    width: 3px;
    border-radius: 2px;
    background: ${({ $qualifying }) =>
      $qualifying ? "var(--accent)" : "transparent"};
  }
`;

const ClubCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const ClubText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;

  strong {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-disabled);
  }
`;

const Diff = styled.span<{ $value: number }>`
  font-weight: 700;
  color: ${({ $value }) =>
    $value > 0
      ? "var(--success)"
      : $value < 0
        ? "var(--danger)"
        : "var(--text-secondary)"};
`;

const Points = styled.span<{ $highlight: boolean }>`
  display: inline-block;
  min-width: 34px;
  padding: 3px 8px;
  border-radius: 6px;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.92rem;
  color: ${({ $highlight }) =>
    $highlight ? "var(--accent)" : "var(--text-primary)"};
  background: ${({ $highlight }) =>
    $highlight ? "var(--accent-soft)" : "transparent"};
`;

interface StandingsTableProps {
  standings: Standing[];
  language: Language;
  /** Rows shown with the coloured rank bar. */
  qualifyingPlaces?: number;
  limit?: number;
}

const StandingsTable = ({
  standings,
  language,
  qualifyingPlaces = 3,
  limit,
}: StandingsTableProps) => {
  const navigate = useNavigate();
  const { linkState } = usePageNavigation();
  const rows = limit ? standings.slice(0, limit) : standings;

  return (
    <Wrapper>
      <Table>
        <thead>
          <tr>
            <Th $align="left">#</Th>
            <Th $align="left">{t(language, "standings.hdrTeam")}</Th>
            <Th>{t(language, "standings.hdrPlayed")}</Th>
            <NarrowTh>{t(language, "standings.hdrWins")}</NarrowTh>
            <NarrowTh>{t(language, "standings.hdrDraws")}</NarrowTh>
            <NarrowTh>{t(language, "standings.hdrLosses")}</NarrowTh>
            <NarrowTh>{t(language, "standings.hdrGoalsFor")}</NarrowTh>
            <NarrowTh>{t(language, "standings.hdrGoalsAgainst")}</NarrowTh>
            <Th>{t(language, "standings.hdrDiff")}</Th>
            <Th>{t(language, "standings.hdrPoints")}</Th>
            <FormTh $align="left">{t(language, "standings.hdrForm")}</FormTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((standing, index) => {
            const qualifying = index < qualifyingPlaces;
            return (
              <Row
                key={standing.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/teams/${standing.teamId}`, { state: linkState })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/teams/${standing.teamId}`, { state: linkState });
                  }
                }}
              >
                <RankCell $align="left" $qualifying={qualifying}>
                  {index + 1}
                </RankCell>
                <Td $align="left">
                  <ClubCell>
                    <TeamBadge
                      name={standing.teamName}
                      shortName={standing.teamShortName}
                      logo={standing.teamLogo}
                      color={standing.teamColor}
                      size={32}
                    />
                    <ClubText>
                      <strong>{standing.teamName}</strong>
                      {standing.teamShortName && (
                        <span>{standing.teamShortName}</span>
                      )}
                    </ClubText>
                  </ClubCell>
                </Td>
                <Td $muted>{standing.played}</Td>
                <NarrowTd $muted>{standing.wins}</NarrowTd>
                <NarrowTd $muted>{standing.draws}</NarrowTd>
                <NarrowTd $muted>{standing.losses}</NarrowTd>
                <NarrowTd $muted>{standing.goalsFor}</NarrowTd>
                <NarrowTd $muted>{standing.goalsAgainst}</NarrowTd>
                <Td>
                  <Diff $value={standing.goalDiff}>
                    {standing.goalDiff > 0 ? "+" : ""}
                    {standing.goalDiff}
                  </Diff>
                </Td>
                <Td>
                  <Points $highlight={qualifying}>{standing.points}</Points>
                </Td>
                <FormTd $align="left">
                  <FormPills form={standing.form} />
                </FormTd>
              </Row>
            );
          })}
        </tbody>
      </Table>
    </Wrapper>
  );
};

export default StandingsTable;

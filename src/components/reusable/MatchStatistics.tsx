import styled from "styled-components";

import { t, type Language } from "../../i18n";
import type { MatchDetails } from "../../types";
import TeamIdentity from "./TeamIdentity";

const Table = styled.table`
  width: 100%;
  border: 1px solid var(--border);
  border-spacing: 0;
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-card);
  table-layout: fixed;

  th, td { padding: 14px 16px; border-bottom: 1px solid var(--divider); }
  thead th {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
  tbody th { font-weight: 500; font-size: 0.85rem; color: var(--text-secondary); }
  td { text-align: center; font-weight: 800; color: var(--text-primary); font-variant-numeric: tabular-nums; }
  tr:last-child td, tr:last-child th { border-bottom: none; }
  thead th { border-bottom: 1px solid var(--divider); }
  @media (max-width: 640px) { th, td { padding: 12px 8px; } }
`;

const MatchStatistics = ({ match, language }: { match: MatchDetails; language: Language }) => {
  const events = match.events.filter((event) => event.status === "ACTIVE");
  const count = (teamId: number, type: string) =>
    events.filter((event) => event.teamId === teamId && event.type === type).length;
  const assists = (teamId: number) =>
    events.filter((event) => event.teamId === teamId && event.type === "GOAL" &&
      (event.assistPlayerId != null || Boolean(event.assistName))).length;
  const rows = [
    { label: "playerDetails.goals", home: match.scoreHome ?? "—", away: match.scoreAway ?? "—" },
    { label: "playerDetails.assists", home: assists(match.homeTeamId), away: assists(match.awayTeamId) },
    { label: "playerDetails.yellowCards", home: count(match.homeTeamId, "YELLOW_CARD"), away: count(match.awayTeamId, "YELLOW_CARD") },
    { label: "playerDetails.redCards", home: count(match.homeTeamId, "RED_CARD"), away: count(match.awayTeamId, "RED_CARD") },
    { label: "matchDetails.checkedPlayers", home: match.attendanceHome ?? 0, away: match.attendanceAway ?? 0 },
  ] as const;
  return (
    <Table aria-label={t(language, "matchDetails.statistics")}>
      <thead><tr><th scope="col"><TeamIdentity teamId={match.homeTeamId} name={match.homeTeamName} logo={match.homeTeamLogo} color={match.homeTeamColor} linked /></th><th scope="col">{t(language, "matchDetails.statistics")}</th><th scope="col"><TeamIdentity teamId={match.awayTeamId} name={match.awayTeamName} logo={match.awayTeamLogo} color={match.awayTeamColor} linked /></th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.label}><td>{row.home}</td><th scope="row">{t(language, row.label)}</th><td>{row.away}</td></tr>)}</tbody>
    </Table>
  );
};

export default MatchStatistics;

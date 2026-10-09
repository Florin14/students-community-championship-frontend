import styled from "styled-components";

import { t, type Language } from "../../i18n";
import type { CalendarPhase, Season } from "../../types";
import { formatDateDot, parseApiDate } from "../../utils/dateFormat";

const Card = styled.details`
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--bg-card);
  overflow: hidden;
  summary { padding: 18px 20px; cursor: pointer; font-family: var(--font-heading); font-weight: 700; color: var(--text-primary); }
  > p { padding: 0 20px 16px; font-size: 0.82rem; color: var(--text-secondary); }
`;
const Scroll = styled.div`overflow-x: auto;`;
const Table = styled.table`
  width: 100%;
  min-width: 580px;
  border-collapse: collapse;
  font-size: 0.82rem;
  color: var(--text-primary);
  th, td { padding: 12px 16px; text-align: left; border-top: 1px solid var(--divider); }
  thead th { background: var(--bg-surface); font-family: var(--font-heading); color: var(--text-secondary); }
  tbody th { width: 150px; font-family: var(--font-heading); font-weight: 800; }
  .period { white-space: nowrap; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
  .break { background: var(--bg-surface); color: var(--text-secondary); }
  .LEAGUE, .PLAY_OFF { background: var(--violet-soft); color: var(--violet); }
  .ACADEMIC_BREAK { background: var(--bg-surface); color: var(--text-secondary); }
  .FINAL_STAGES, .SEMIFINALS, .FINAL { background: var(--accent-soft); color: var(--accent); }
`;

const CompetitionCalendar = ({ season, language }: { season: Season; language: Language }) => {
  const periods = [...(season.calendar ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (periods.length === 0) return null;
  const groups: { phase: CalendarPhase; periods: typeof periods }[] = [];
  periods.forEach((period) => {
    const last = groups[groups.length - 1];
    if (last?.phase === period.phase) last.periods.push(period);
    else groups.push({ phase: period.phase, periods: [period] });
  });
  return (
    <Card>
      <summary>{t(language, "calendar.title")} — {season.name}</summary>
      <p>{t(language, "calendar.publicHint")}</p>
      <Scroll>
        <Table aria-label={t(language, "calendar.title")}>
          <thead><tr><th scope="col">{t(language, "calendar.phase")}</th><th scope="col">{t(language, "calendar.period")}</th><th scope="col">{t(language, "calendar.activity")}</th></tr></thead>
          {groups.map((group, index) => (
            <tbody key={index}>
              {group.periods.map((period, i) => (
                <tr key={period.startDate} className={period.isBreak ? "break" : undefined}>
                  {i === 0 && <th scope="rowgroup" rowSpan={group.periods.length} className={group.phase}>{t(language, `calendar.phase.${group.phase}`)}</th>}
                  <td className="period">{formatDateDot(parseApiDate(period.startDate + "T00:00:00"))}
                    {period.endDate !== period.startDate && <> – {formatDateDot(parseApiDate(period.endDate + "T00:00:00"))}</>}</td>
                  <td>{period.label}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </Table>
      </Scroll>
    </Card>
  );
};

export default CompetitionCalendar;

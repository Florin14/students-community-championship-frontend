import { Alert, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import styled from "styled-components";

import StyledSelect from "../../../components/reusable/StyledSelect";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t, type Language } from "../../../i18n";
import type { CalendarPhase, SeasonCalendarPeriod } from "../../../types";
import { calendarError } from "../../../utils/scheduling";

const Editor = styled.div`
  margin-top: 16px;
  summary { cursor: pointer; font-family: var(--font-heading); font-weight: 700; padding: 12px 0; color: var(--text-primary); }
  p { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px; }
`;
const PeriodCard = styled.div`
  padding: 20px 14px 14px;
  margin-bottom: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  > .full { grid-column: 1 / -1; }
  @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); }
`;
const Actions = styled.div`display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;`;

const PHASES: CalendarPhase[] = ["LEAGUE", "ACADEMIC_BREAK", "PLAY_OFF", "FINAL_STAGES", "SEMIFINALS", "FINAL"];

interface Props {
  periods: SeasonCalendarPeriod[];
  language: Language;
  onChange: (periods: SeasonCalendarPeriod[]) => void;
  onTemplate: () => void;
}

const SeasonCalendarEditor = ({ periods, language, onChange, onTemplate }: Props) => {
  const update = (index: number, values: Partial<SeasonCalendarPeriod>) =>
    onChange(periods.map((period, i) => i === index ? { ...period, ...values } : period));
  const error = calendarError(periods);
  return (
    <Editor>
      <Actions>
        <Button type="button" onClick={onTemplate}>{t(language, "calendar.loadTemplate")}</Button>
        <Button type="button" startIcon={<Plus size={16} />} disabled={periods.length >= 128}
          onClick={() => onChange([...periods, { startDate: "", endDate: "", label: "", phase: "LEAGUE", round: null, isBreak: false }])}>
          {t(language, "calendar.addPeriod")}
        </Button>
      </Actions>
      <p>{t(language, "calendar.editorHint")}</p>
      {error && <Alert severity="error">{t(language, error as never)}</Alert>}
      <details>
        <summary>{t(language, "calendar.editPeriods", { count: periods.length })}</summary>
        {periods.length === 0 && <p>{t(language, "calendar.empty")}</p>}
        {periods.map((period, index) => (
          <PeriodCard key={index}>
            <StyledTextField label={t(language, "calendar.start")} type="date" value={period.startDate} required
              InputLabelProps={{ shrink: true }} onChange={(event) => update(index, { startDate: event.target.value })} />
            <StyledTextField label={t(language, "calendar.end")} type="date" value={period.endDate} required
              InputLabelProps={{ shrink: true }} onChange={(event) => update(index, { endDate: event.target.value })} />
            <StyledTextField className="full" label={t(language, "calendar.activity")} value={period.label} required
              inputProps={{ maxLength: 160 }} onChange={(event) => update(index, { label: event.target.value })} />
            <FormControl>
              <InputLabel>{t(language, "calendar.phase")}</InputLabel>
              <StyledSelect label={t(language, "calendar.phase")} value={period.phase}
                onChange={(event) => update(index, { phase: event.target.value as CalendarPhase })}>
                {PHASES.map((phase) => <MenuItem key={phase} value={phase}>{t(language, `calendar.phase.${phase}`)}</MenuItem>)}
              </StyledSelect>
            </FormControl>
            <StyledTextField label={t(language, "admin.matches.round")} type="number" value={period.round ?? ""}
              inputProps={{ min: 1, max: 999, step: 1 }} disabled={period.isBreak}
              onChange={(event) => update(index, { round: event.target.value === "" ? null : Number(event.target.value) })} />
            <div className="full" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <FormControlLabel label={t(language, "calendar.break")} control={
                <Checkbox checked={period.isBreak} onChange={(event) => update(index, { isBreak: event.target.checked, ...(event.target.checked ? { round: null } : {}) })} />
              } />
              <Button type="button" color="inherit" startIcon={<Trash2 size={16} />}
                aria-label={t(language, "calendar.removePeriod", { label: period.label || String(index + 1) })}
                onClick={() => onChange(periods.filter((_, i) => i !== index))}>{t(language, "common.delete")}</Button>
            </div>
          </PeriodCard>
        ))}
      </details>
    </Editor>
  );
};

export default SeasonCalendarEditor;

import {
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import StyledSelect from "../../../components/reusable/StyledSelect";
import AudienceField from "../../../components/reusable/AudienceField";
import { isValidAudience } from "../../../utils/audience";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  addMatchThunk,
  fetchMatches,
  updateMatchThunk,
} from "../../../store/slices/thunks/matchesThunks";
import type { Match, MatchState } from "../../../types";
import { parseApiDate, toInputDateTimeLocal } from "../../../utils/dateFormat";
import { findCalendarPeriod, weeklyRound } from "../../../utils/scheduling";
import { FieldGrid, FullRow } from "../adminUi";

// A finished match is only ever moved by the console (finish / reopen), so the
// scheduling form never offers FINISHED or HALF_TIME.
const EDIT_STATES: MatchState[] = ["SCHEDULED", "LIVE", "POSTPONED"];

interface MatchModalProps {
  open: boolean;
  match: Match | null;
  seasonId: number | null;
  onClose: () => void;
}

const MatchModal = ({ open, match, seasonId, onClose }: MatchModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { seasons, activeSeason } = useAppSelector((state) => state.seasons);
  const { teams } = useAppSelector((state) => state.teams);
  const { fields } = useAppSelector((state) => state.fields);

  const [formSeasonId, setFormSeasonId] = useState<number | "">("");
  const [homeTeamId, setHomeTeamId] = useState<number | "">("");
  const [awayTeamId, setAwayTeamId] = useState<number | "">("");
  const [round, setRound] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [fieldId, setFieldId] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("");
  const [state, setState] = useState<MatchState>("SCHEDULED");
  const [saving, setSaving] = useState(false);
  const [manualRound, setManualRound] = useState(false);
  const initialized = useRef(false);
  const formSeason = seasons.find((season) => season.id === formSeasonId) ??
    (activeSeason?.id === formSeasonId ? activeSeason : null);
  const hasCalendar = Boolean(formSeason?.calendar?.length);
  const calendarPeriod = useMemo(() => findCalendarPeriod(timestamp, formSeason?.calendar),
    [timestamp, formSeason?.calendar]);

  useEffect(() => {
    if (!open) { initialized.current = false; return; }
    if (!initialized.current) {
      initialized.current = true;
      setFormSeasonId(match?.seasonId ?? seasonId ?? activeSeason?.id ?? "");
      setHomeTeamId(match?.homeTeamId ?? "");
      setAwayTeamId(match?.awayTeamId ?? "");
      setRound(match?.round ? String(match.round) : "");
      setTimestamp(
        match ? toInputDateTimeLocal(parseApiDate(match.timestamp)) : toInputDateTimeLocal(new Date())
      );
      setFieldId(match?.fieldId ?? "");
      setLocation(match?.location ?? "");
      setAudience(match?.audience == null ? "" : String(match.audience));
      setState(match?.state === "FINISHED" ? "SCHEDULED" : match?.state ?? "SCHEDULED");
      setManualRound(false);
    }
  }, [open, match, seasonId, activeSeason]);

  useEffect(() => {
    if (!open || match) return;
    if (formSeasonId === "" && (seasonId ?? activeSeason?.id)) {
      setFormSeasonId(seasonId ?? activeSeason?.id ?? "");
    }
    if (!manualRound) {
      const next = hasCalendar
        ? calendarPeriod && !calendarPeriod.isBreak ? calendarPeriod.round : null
        : weeklyRound(timestamp, formSeason?.startDate);
      setRound(next == null ? "" : String(next));
    }
  }, [open, match, formSeasonId, formSeason?.startDate, formSeason?.calendar, hasCalendar,
    calendarPeriod, manualRound, timestamp, seasonId, activeSeason?.id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (formSeasonId === "" || homeTeamId === "" || awayTeamId === "" || (match && !isValidAudience(audience))) return;
    setSaving(true);

    const common = {
      round: round === "" ? null : Number(round),
      timestamp,
      fieldId: fieldId === "" ? null : fieldId,
      location: location || null,
    };

    const action = match
      ? await dispatch(
          updateMatchThunk({
            id: match.id,
            data: {
              ...common,
              audience: audience === "" ? null : Number(audience),
              homeTeamId,
              awayTeamId,
              ...(match.state !== "FINISHED" && { state }),
            },
          })
        )
      : await dispatch(
          addMatchThunk({
            ...common,
            seasonId: formSeasonId,
            homeTeamId,
            awayTeamId,
          })
        );
    setSaving(false);

    if (
      addMatchThunk.fulfilled.match(action) ||
      updateMatchThunk.fulfilled.match(action)
    ) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.saved"),
          severity: "success",
        })
      );
      dispatch(
        fetchMatches(
          typeof formSeasonId === "number"
            ? { seasonId: formSeasonId }
            : undefined
        )
      );
      onClose();
    } else {
      dispatch(
        showSnackbar({
          message: String(action.payload ?? t(language, "admin.saveFailed")),
          severity: "error",
        })
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          {match
            ? t(language, "admin.matches.editTitle")
            : t(language, "admin.matches.addTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <FieldGrid>
            {hasCalendar && <FullRow>
              <Alert severity={!calendarPeriod || calendarPeriod.isBreak ? "warning" : "info"}>
                {calendarPeriod
                  ? t(language, calendarPeriod.isBreak ? "calendar.breakDate" : "calendar.selectedPeriod", { label: calendarPeriod.label })
                  : t(language, "calendar.outsideDate")}
              </Alert>
            </FullRow>}
            <FullRow>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: "var(--text-secondary)" }}>
                  {t(language, "admin.matches.season")}
                </InputLabel>
                <StyledSelect
                  label={t(language, "admin.matches.season")}
                  value={formSeasonId}
                  onChange={(event) =>
                    setFormSeasonId(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value)
                    )
                  }
                  disabled={Boolean(match)}
                >
                  {seasons.map((season) => (
                    <MenuItem key={season.id} value={season.id}>
                      {season.name}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </FullRow>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "var(--text-secondary)" }}>
                {t(language, "admin.matches.homeTeam")}
              </InputLabel>
              <StyledSelect
                label={t(language, "admin.matches.homeTeam")}
                value={homeTeamId}
                onChange={(event) =>
                  setHomeTeamId(
                    event.target.value === "" ? "" : Number(event.target.value)
                  )
                }
              >
                {teams
                  .filter((team) => team.id !== awayTeamId)
                  .map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
              </StyledSelect>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel sx={{ color: "var(--text-secondary)" }}>
                {t(language, "admin.matches.awayTeam")}
              </InputLabel>
              <StyledSelect
                label={t(language, "admin.matches.awayTeam")}
                value={awayTeamId}
                onChange={(event) =>
                  setAwayTeamId(
                    event.target.value === "" ? "" : Number(event.target.value)
                  )
                }
              >
                {teams
                  .filter((team) => team.id !== homeTeamId)
                  .map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
              </StyledSelect>
            </FormControl>
            <StyledTextField
              label={t(language, "admin.matches.round")}
              type="number"
              value={round}
              onChange={(event) => { setManualRound(true); setRound(event.target.value); }}
              fullWidth
              inputProps={{ min: 1 }}
              helperText={!match ? t(language, manualRound ? "admin.matches.roundManual" :
                hasCalendar ? "calendar.roundHint" : formSeason?.startDate ? "admin.matches.roundAuto" : "admin.matches.roundNoStart") : undefined}
            />
            <StyledTextField
              label={t(language, "admin.matches.dateTime")}
              type="datetime-local"
              value={timestamp}
              onChange={(event) => setTimestamp(event.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {!match && manualRound && (
              <FullRow><Button size="small" onClick={() => setManualRound(false)}>{t(language, "admin.matches.recalculateRound")}</Button></FullRow>
            )}
            <FormControl fullWidth>
              <InputLabel sx={{ color: "var(--text-secondary)" }}>
                {t(language, "admin.matches.field")}
              </InputLabel>
              <StyledSelect
                label={t(language, "admin.matches.field")}
                value={fieldId}
                onChange={(event) => {
                  const next = event.target.value === "" ? "" : Number(event.target.value);
                  setFieldId(next);
                  setLocation(fields.find((field) => field.id === next)?.location ?? "");
                }}
              >
                <MenuItem value="">
                  {t(language, "admin.matches.noField")}
                </MenuItem>
                {fields.map((field) => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.name}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
            <StyledTextField
              label={t(language, "admin.matches.location")}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              fullWidth
            />
            {match && (
              <FullRow>
                <AudienceField value={audience} onChange={setAudience} />
              </FullRow>
            )}
            {match && match.state !== "FINISHED" && (
              <FullRow>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "var(--text-secondary)" }}>
                    {t(language, "admin.matches.state")}
                  </InputLabel>
                  <StyledSelect
                    label={t(language, "admin.matches.state")}
                    value={state}
                    onChange={(event) =>
                      setState(event.target.value as MatchState)
                    }
                  >
                    {EDIT_STATES.map((value) => (
                      <MenuItem key={value} value={value}>
                        {t(language, ("matchState." + value) as never)}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </FullRow>
            )}
          </FieldGrid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              saving ||
              Boolean(match && !isValidAudience(audience)) ||
              formSeasonId === "" ||
              homeTeamId === "" ||
              awayTeamId === "" ||
              !timestamp
            }
          >
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MatchModal;

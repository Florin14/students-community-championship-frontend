import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  addSeasonThunk,
  fetchActiveSeason,
  fetchSeasons,
  updateSeasonThunk,
} from "../../../store/slices/thunks/seasonsThunks";
import type { Season, SeasonCalendarPeriod } from "../../../types";
import { calendar2026 } from "../../../utils/calendar2026";
import { calendarError } from "../../../utils/scheduling";
import SeasonCalendarEditor from "./SeasonCalendarEditor";
import { FieldGrid, FullRow } from "../adminUi";

interface SeasonModalProps {
  open: boolean;
  season: Season | null;
  onClose: () => void;
}

const SeasonModal = ({ open, season, onClose }: SeasonModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calendar, setCalendar] = useState<SeasonCalendarPeriod[]>([]);

  useEffect(() => {
    if (open) {
      setName(season?.name ?? "");
      setDescription(season?.description ?? "");
      setStartDate(season?.startDate ?? "");
      setEndDate(season?.endDate ?? "");
      setIsActive(season?.isActive ?? false);
      setCalendar(season?.calendar ?? []);
    }
  }, [open, season]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (calendarError(calendar)) return;
    setSaving(true);
    const payload = {
      name,
      description: description || null,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive,
      calendar,
    };
    const action = season
      ? await dispatch(updateSeasonThunk({ id: season.id, data: payload }))
      : await dispatch(addSeasonThunk(payload));
    setSaving(false);

    if (
      addSeasonThunk.fulfilled.match(action) ||
      updateSeasonThunk.fulfilled.match(action)
    ) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.saved"),
          severity: "success",
        })
      );
      dispatch(fetchSeasons());
      dispatch(fetchActiveSeason());
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          {season
            ? t(language, "admin.seasons.editTitle")
            : t(language, "admin.seasons.addTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <FieldGrid>
            <FullRow>
              <StyledTextField
                label={t(language, "admin.seasons.name")}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                fullWidth
              />
            </FullRow>
            <StyledTextField
              label={t(language, "admin.seasons.startDate")}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <StyledTextField
              label={t(language, "admin.seasons.endDate")}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FullRow>
              <StyledTextField
                label={t(language, "admin.seasons.description")}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </FullRow>
            <FullRow>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                }
                label={t(language, "admin.seasons.isActive")}
                sx={{ color: "var(--text-secondary)" }}
              />
            </FullRow>
            <FullRow>
              <SeasonCalendarEditor periods={calendar} language={language} onChange={setCalendar} onTemplate={() => {
                setCalendar(calendar2026());
                if (!name.trim()) setName("2026–2027");
                if (!startDate) setStartDate("2026-10-26");
                if (!endDate) setEndDate("2027-05-15");
              }} />
            </FullRow>
          </FieldGrid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={saving || !name.trim() || Boolean(calendarError(calendar))}>
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SeasonModal;

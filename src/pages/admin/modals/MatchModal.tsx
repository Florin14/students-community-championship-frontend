import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

import StyledSelect from "../../../components/reusable/StyledSelect";
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
import { FieldGrid, FullRow } from "../adminUi";

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
  const { seasons } = useAppSelector((state) => state.seasons);
  const { teams } = useAppSelector((state) => state.teams);

  const [formSeasonId, setFormSeasonId] = useState<number | "">("");
  const [homeTeamId, setHomeTeamId] = useState<number | "">("");
  const [awayTeamId, setAwayTeamId] = useState<number | "">("");
  const [round, setRound] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState<MatchState>("SCHEDULED");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormSeasonId(match?.seasonId ?? seasonId ?? "");
      setHomeTeamId(match?.homeTeamId ?? "");
      setAwayTeamId(match?.awayTeamId ?? "");
      setRound(match?.round ? String(match.round) : "");
      setTimestamp(
        match ? toInputDateTimeLocal(parseApiDate(match.timestamp)) : ""
      );
      setLocation(match?.location ?? "");
      setState(match?.state === "FINISHED" ? "SCHEDULED" : match?.state ?? "SCHEDULED");
    }
  }, [open, match, seasonId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (formSeasonId === "" || homeTeamId === "" || awayTeamId === "") return;
    setSaving(true);

    const common = {
      round: round === "" ? null : Number(round),
      timestamp,
      location: location || null,
    };

    const action = match
      ? await dispatch(
          updateMatchThunk({
            id: match.id,
            data: {
              ...common,
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
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700 }}>
          {match
            ? t(language, "admin.matches.editTitle")
            : t(language, "admin.matches.addTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <FieldGrid>
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
              onChange={(event) => setRound(event.target.value)}
              fullWidth
              inputProps={{ min: 1 }}
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
            <FullRow>
              <StyledTextField
                label={t(language, "admin.matches.location")}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                fullWidth
              />
            </FullRow>
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

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ImagePlus } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styled from "styled-components";

import TeamBadge from "../../../components/reusable/TeamBadge";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  addTeamThunk,
  updateTeamThunk,
} from "../../../store/slices/thunks/teamsThunks";
import type { Team } from "../../../types";
import { fileToDataUrl } from "../../../utils/images";
import { FieldGrid, FullRow } from "../adminUi";

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const UploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 9px 16px;
  border-radius: 12px;
  border: 1px dashed var(--border-strong);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  input {
    display: none;
  }
`;

interface TeamModalProps {
  open: boolean;
  team: Team | null;
  onClose: () => void;
}

const TeamModal = ({ open, team, onClose }: TeamModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [university, setUniversity] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#A3E635");
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(team?.name ?? "");
      setShortName(team?.shortName ?? "");
      setFaculty(team?.faculty ?? "");
      setUniversity(team?.university ?? "");
      setDescription(team?.description ?? "");
      setColor(team?.color ?? "#A3E635");
      setLogo(team?.logo ?? null);
    }
  }, [open, team]);

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(await fileToDataUrl(file));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      name: name.trim(),
      shortName: shortName || null,
      faculty: faculty || null,
      university: university.trim() || null,
      description: description || null,
      color: color || null,
      logo: logo ?? null,
    };
    const action = team
      ? await dispatch(updateTeamThunk({ id: team.id, data: payload }))
      : await dispatch(addTeamThunk(payload));
    setSaving(false);

    if (
      addTeamThunk.fulfilled.match(action) ||
      updateTeamThunk.fulfilled.match(action)
    ) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.saved"),
          severity: "success",
        })
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
          {team
            ? t(language, "admin.teams.editTitle")
            : t(language, "admin.teams.addTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <FieldGrid>
            <FullRow>
              <LogoRow>
                <TeamBadge
                  name={name}
                  shortName={shortName}
                  logo={logo}
                  color={color}
                  size={56}
                />
                <UploadLabel>
                  <ImagePlus size={16} />
                  {t(language, "admin.teams.uploadLogo")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </UploadLabel>
              </LogoRow>
            </FullRow>
            <StyledTextField
              label={t(language, "admin.teams.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
              inputProps={{ maxLength: 80 }}
              InputLabelProps={{ shrink: true }}
            />
            <StyledTextField
              label={t(language, "admin.teams.shortName")}
              value={shortName}
              onChange={(event) =>
                setShortName(event.target.value.toUpperCase().slice(0, 8))
              }
              fullWidth
            />
            <FullRow>
              <StyledTextField
                label={t(language, "admin.teams.university")}
                value={university}
                onChange={(event) => setUniversity(event.target.value)}
                fullWidth
                inputProps={{ maxLength: 160 }}
              />
            </FullRow>
            <FullRow>
              <StyledTextField
                label={t(language, "admin.teams.faculty")}
                value={faculty}
                onChange={(event) => setFaculty(event.target.value)}
                fullWidth
              />
            </FullRow>
            <StyledTextField
              label={t(language, "admin.teams.color")}
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FullRow>
              <StyledTextField
                label={t(language, "admin.teams.description")}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </FullRow>
          </FieldGrid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={saving || !name.trim()}>
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamModal;

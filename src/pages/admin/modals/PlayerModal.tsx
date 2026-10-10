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
import { ImagePlus } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styled from "styled-components";

import StyledSelect from "../../../components/reusable/StyledSelect";
import TeamIdentity from "../../../components/reusable/TeamIdentity";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  addPlayerThunk,
  updatePlayerThunk,
} from "../../../store/slices/thunks/playersThunks";
import type { Player, PlayerPosition } from "../../../types";
import { fileToDataUrl, imageSrc } from "../../../utils/images";
import { FieldGrid, FullRow } from "../adminUi";

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-surface);
  border: 2px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const POSITIONS: PlayerPosition[] = [
  "GOALKEEPER",
  "DEFENDER",
  "MIDFIELDER",
  "FORWARD",
];

interface PlayerModalProps {
  open: boolean;
  player: Player | null;
  onClose: () => void;
}

const PlayerModal = ({ open, player, onClose }: PlayerModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { teams } = useAppSelector((state) => state.teams);

  const [name, setName] = useState("");
  const [position, setPosition] = useState<PlayerPosition | "">("");
  const [shirtNumber, setShirtNumber] = useState("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photoReady, setPhotoReady] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(player?.name ?? "");
      setPosition(player?.position ?? "");
      setShirtNumber(
        player?.shirtNumber !== null && player?.shirtNumber !== undefined
          ? String(player.shirtNumber)
          : ""
      );
      setTeamId(player?.teamId ?? "");
      setAvatar(player?.avatar ?? null);
      setPhotoReady(false);
      setPhotoError(false);
    }
  }, [open, player]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const nextAvatar = await fileToDataUrl(file);
        if (nextAvatar !== avatar) {
          setPhotoReady(false);
          setPhotoError(false);
          setAvatar(nextAvatar);
        }
      } catch {
        dispatch(showSnackbar({ message: t(language, "admin.players.photoInvalid"), severity: "error" }));
      }
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!avatar || !photoReady) return;
    setSaving(true);
    const payload = {
      name,
      position: position === "" ? null : position,
      shirtNumber: shirtNumber === "" ? null : Number(shirtNumber),
      teamId: teamId === "" ? null : teamId,
      avatar,
    };
    const action = player
      ? await dispatch(updatePlayerThunk({ id: player.id, data: payload }))
      : await dispatch(addPlayerThunk(payload));
    setSaving(false);

    if (
      addPlayerThunk.fulfilled.match(action) ||
      updatePlayerThunk.fulfilled.match(action)
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

  const avatarUrl = imageSrc(avatar);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          {player
            ? t(language, "admin.players.editTitle")
            : t(language, "admin.players.addTitle")}
        </DialogTitle>
        <DialogContent sx={{ pt: "10px !important" }}>
          <FieldGrid>
            <FullRow>
              <AvatarRow>
                <Avatar>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      onLoad={() => setPhotoReady(true)}
                      onError={() => { setPhotoReady(false); setPhotoError(true); }}
                    />
                  ) : (
                    (name || "?").slice(0, 1).toUpperCase()
                  )}
                </Avatar>
                <UploadLabel>
                  <ImagePlus size={16} />
                  {t(language, "admin.players.uploadAvatar")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </UploadLabel>
              </AvatarRow>
              <p style={{ fontSize: "0.8rem", color: photoError ? "var(--danger)" : "var(--text-secondary)" }}>
                {t(language, photoError ? "admin.players.photoInvalid" : "admin.players.photoRequired")}
              </p>
            </FullRow>
            <FullRow>
              <StyledTextField
                label={t(language, "admin.players.name")}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                fullWidth
              />
            </FullRow>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "var(--text-secondary)" }}>
                {t(language, "admin.players.team")}
              </InputLabel>
              <StyledSelect
                label={t(language, "admin.players.team")}
                value={teamId}
                onChange={(event) =>
                  setTeamId(
                    event.target.value === ""
                      ? ""
                      : Number(event.target.value)
                  )
                }
              >
                <MenuItem value="">
                  {t(language, "admin.players.noTeam")}
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    <TeamIdentity teamId={team.id} name={team.name} logo={team.logo} color={team.color} />
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "var(--text-secondary)" }}>
                {t(language, "admin.players.position")}
              </InputLabel>
              <StyledSelect
                label={t(language, "admin.players.position")}
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value as PlayerPosition | "")
                }
              >
                <MenuItem value="">—</MenuItem>
                {POSITIONS.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {t(language, ("position." + pos) as never)}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
            <StyledTextField
              label={t(language, "admin.players.shirtNumber")}
              type="number"
              value={shirtNumber}
              onChange={(event) => setShirtNumber(event.target.value)}
              fullWidth
              inputProps={{ min: 0, max: 99 }}
            />
          </FieldGrid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={saving || !name.trim() || !photoReady}>
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PlayerModal;

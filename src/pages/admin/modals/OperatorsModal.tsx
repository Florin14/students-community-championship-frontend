import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  fetchMatchById,
  setMatchOperatorsThunk,
} from "../../../store/slices/thunks/matchesThunks";
import { fetchUsers } from "../../../store/slices/thunks/usersThunks";
import type { Match } from "../../../types";

interface OperatorsModalProps {
  open: boolean;
  match: Match | null;
  onClose: () => void;
}

/**
 * Assign the accounts allowed to score one match.
 *
 * Replaces the whole set, so clearing every box leaves the match to
 * administrators only - which is a legitimate choice, not an error state.
 */
const OperatorsModal = ({ open, match, onClose }: OperatorsModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const users = useAppSelector((state) => state.users.users);
  const selectedMatch = useAppSelector((state) => state.matches.selectedMatch);

  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const loaded = selectedMatch?.id === match?.id;

  useEffect(() => {
    if (!open || !match) return;
    dispatch(fetchUsers());
    // The list response carries no operators, so the current assignment has to
    // be read from the detail endpoint. Without it the boxes would open empty
    // and saving would silently clear a real assignment.
    dispatch(fetchMatchById({ id: match.id }));
  }, [dispatch, open, match]);

  useEffect(() => {
    if (!open || !match) return;
    if (selectedMatch?.id !== match.id) return;
    setSelected((selectedMatch.operators ?? []).map((entry) => entry.userId));
  }, [open, match, selectedMatch]);

  const assignable = useMemo(
    () => users.filter((user) => user.isActive),
    [users]
  );

  const toggle = (userId: number) => {
    setSelected((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const handleSave = async () => {
    if (!match) return;
    setSaving(true);
    const action = await dispatch(
      setMatchOperatorsThunk({ id: match.id, operatorIds: selected })
    );
    setSaving(false);
    if (setMatchOperatorsThunk.fulfilled.match(action)) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.matches.operatorsSaved"),
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700 }}>
        {t(language, "admin.matches.operators")}
      </DialogTitle>
      <DialogContent>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: 14,
          }}
        >
          {t(language, "admin.matches.operatorsHint")}
        </p>
        {assignable.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {t(language, "admin.users.empty")}
          </p>
        ) : (
          assignable.map((user) => (
            <FormControlLabel
              key={user.id}
              control={
                <Checkbox
                  checked={selected.includes(user.id)}
                  onChange={() => toggle(user.id)}
                />
              }
              label={`${user.name} · ${t(
                language,
                ("role." + user.role) as never
              )}`}
              sx={{ display: "flex", color: "var(--text-primary)" }}
            />
          ))
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          {t(language, "common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !loaded}
        >
          {t(language, "common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OperatorsModal;

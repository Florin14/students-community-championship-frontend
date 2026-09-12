import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";

import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  addFieldThunk,
  updateFieldThunk,
} from "../../../store/slices/thunks/fieldsThunks";
import type { Field } from "../../../types";
import { FieldGrid, FullRow } from "../adminUi";

interface FieldModalProps {
  open: boolean;
  field: Field | null;
  onClose: () => void;
}

const FieldModal = ({ open, field, onClose }: FieldModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(field?.name ?? "");
    setShortName(field?.shortName ?? "");
    setLocation(field?.location ?? "");
    setDescription(field?.description ?? "");
  }, [open, field]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: name.trim(),
      shortName: shortName.trim() || null,
      location: location.trim() || null,
      description: description.trim() || null,
    };

    const action = field
      ? await dispatch(updateFieldThunk({ id: field.id, data: payload }))
      : await dispatch(addFieldThunk(payload));
    setSaving(false);

    const succeeded = field
      ? updateFieldThunk.fulfilled.match(action)
      : addFieldThunk.fulfilled.match(action);

    if (succeeded) {
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
          {t(
            language,
            field ? "admin.fields.editTitle" : "admin.fields.addTitle"
          )}
        </DialogTitle>
        <DialogContent>
          <FieldGrid>
            <StyledTextField
              label={t(language, "admin.fields.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
            />
            <StyledTextField
              label={t(language, "admin.fields.shortName")}
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
              fullWidth
              inputProps={{ maxLength: 12 }}
            />
            <FullRow>
              <StyledTextField
                label={t(language, "admin.fields.location")}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                fullWidth
              />
            </FullRow>
            <FullRow>
              <StyledTextField
                label={t(language, "admin.fields.description")}
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
          <Button
            type="submit"
            variant="contained"
            disabled={saving || name.trim().length === 0}
          >
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FieldModal;

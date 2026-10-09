import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Switch,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";

import StyledSelect from "../../../components/reusable/StyledSelect";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  addUserThunk,
  updateUserThunk,
} from "../../../store/slices/thunks/usersThunks";
import type { PlatformRole, PlatformUser } from "../../../types";
import { covers } from "../../../utils/roles";
import { FieldGrid, FullRow } from "../adminUi";

const ALL_ROLES: PlatformRole[] = ["OPERATOR", "ADMIN", "SUPER_ADMIN"];

interface UserModalProps {
  open: boolean;
  user: PlatformUser | null;
  onClose: () => void;
}

const UserModal = ({ open, user, onClose }: UserModalProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PlatformRole>("OPERATOR");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const isSelf = user !== null && user.id === currentUser?.id;

  /** The API refuses a role above your own, so do not offer one. */
  const availableRoles = useMemo(
    () => ALL_ROLES.filter((candidate) => covers(currentUser?.role, candidate)),
    [currentUser?.role]
  );

  useEffect(() => {
    if (!open) return;
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRole(user?.role ?? "OPERATOR");
    setIsActive(user?.isActive ?? true);
  }, [open, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const action = user
      ? await dispatch(
          updateUserThunk({
            id: user.id,
            data: {
              name: name.trim(),
              email: email.trim(),
              // Changing your own role or disabling yourself is refused by the
              // API, so those fields are simply not sent for your own account.
              ...(isSelf ? {} : { role, isActive }),
              ...(password ? { password } : {}),
            },
          })
        )
      : await dispatch(
          addUserThunk({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          })
        );
    setSaving(false);

    const succeeded = user
      ? updateUserThunk.fulfilled.match(action)
      : addUserThunk.fulfilled.match(action);

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

  const passwordRequired = user === null;
  const passwordTooShort = password.length > 0 && password.length < 8;
  const canSave =
    !saving &&
    name.trim().length >= 2 &&
    email.trim().length > 3 &&
    !passwordTooShort &&
    (!passwordRequired || password.length >= 8);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          {t(
            language,
            user ? "admin.users.editTitle" : "admin.users.addTitle"
          )}
        </DialogTitle>
        <DialogContent>
          <FieldGrid>
            <StyledTextField
              label={t(language, "admin.users.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
            />
            <StyledTextField
              label={t(language, "admin.users.email")}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <StyledTextField
              label={t(
                language,
                user ? "admin.users.newPassword" : "admin.users.password"
              )}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required={passwordRequired}
              fullWidth
              error={passwordTooShort}
              helperText={t(language, "admin.users.passwordHint")}
            />
            <FormControl fullWidth disabled={isSelf}>
              <InputLabel sx={{ color: "var(--text-secondary)" }}>
                {t(language, "admin.users.role")}
              </InputLabel>
              <StyledSelect
                label={t(language, "admin.users.role")}
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as PlatformRole)
                }
              >
                {availableRoles.map((candidate) => (
                  <MenuItem key={candidate} value={candidate}>
                    {t(language, ("role." + candidate) as never)}
                  </MenuItem>
                ))}
              </StyledSelect>
              {role === "OPERATOR" && (
                <FormHelperText>{t(language, "admin.users.staffRoleHint")}</FormHelperText>
              )}
            </FormControl>
            {user && (
              <FullRow>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      disabled={isSelf}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                  }
                  label={t(language, "admin.users.isActive")}
                  sx={{ color: "var(--text-primary)" }}
                />
              </FullRow>
            )}
          </FieldGrid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={!canSave}>
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserModal;

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  /** Blocks confirmation while a required input inside `children` is incomplete. */
  confirmDisabled?: boolean;
  /** Extra content - a required reason field, for instance - under the description. */
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
      {title}
    </DialogTitle>
    {(description || children) && (
      <DialogContent>
        {description && (
          <DialogContentText sx={{ color: "var(--text-secondary)" }}>
            {description}
          </DialogContentText>
        )}
        {children && <div style={{ marginTop: description ? 18 : 0 }}>{children}</div>}
      </DialogContent>
    )}
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} color="inherit">
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        disabled={confirmDisabled}
        color={destructive ? "error" : "primary"}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;

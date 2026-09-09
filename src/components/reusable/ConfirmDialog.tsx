import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
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
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 700 }}>
      {title}
    </DialogTitle>
    {description && (
      <DialogContent>
        <DialogContentText sx={{ color: "var(--text-secondary)" }}>
          {description}
        </DialogContentText>
      </DialogContent>
    )}
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} color="inherit">
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color={destructive ? "error" : "primary"}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;

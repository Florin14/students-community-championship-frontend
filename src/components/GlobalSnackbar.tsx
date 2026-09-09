import { Alert, Snackbar } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { hideSnackbar } from "../store/slices/snackbarSlice";

const GlobalSnackbar = () => {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector(
    (state) => state.snackbar
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={severity}
        variant="filled"
        sx={{ borderRadius: "12px", fontWeight: 600 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;

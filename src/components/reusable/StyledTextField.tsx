import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    background: "var(--bg-input)",
    borderRadius: 12,
    color: "var(--text-primary)",
    minHeight: 48,
    "& fieldset": {
      borderColor: "var(--border-input)",
    },
    "&:hover fieldset": {
      borderColor: "var(--border-strong)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--accent)",
      borderWidth: 1.5,
    },
  },
  "& .MuiInputLabel-root": {
    color: "var(--text-secondary)",
    "&.Mui-focused": {
      color: "var(--accent)",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "var(--text-secondary)",
  },
});

export default StyledTextField;

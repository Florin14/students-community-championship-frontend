import { Select } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledSelect = styled(Select)({
  background: "var(--bg-input)",
  borderRadius: 12,
  color: "var(--text-primary)",
  minHeight: 48,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--border-input)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--border-strong)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--accent)",
    borderWidth: 1.5,
  },
  "& .MuiSelect-icon": {
    color: "var(--text-secondary)",
  },
}) as unknown as typeof Select;

export default StyledSelect;

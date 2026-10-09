import { t } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import { isValidAudience } from "../../utils/audience";
import StyledTextField from "./StyledTextField";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const AudienceField = ({ value, onChange, disabled }: Props) => {
  const language = useAppSelector((state) => state.i18n.language);
  const valid = isValidAudience(value);
  return (
    <StyledTextField
      label={t(language, "matches.audience")}
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      inputProps={{ min: 0, max: 2147483647, step: 1 }}
      fullWidth
      disabled={disabled}
      error={!valid}
      helperText={t(language, valid ? "matches.audienceHint" : "matches.audienceInvalid")}
    />
  );
};

export default AudienceField;

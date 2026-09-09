import { MenuItem } from "@mui/material";

import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSelectedSeasonId } from "../../store/slices/seasonsSlice";
import StyledSelect from "./StyledSelect";

interface SeasonSelectorProps {
  minWidth?: number;
}

const SeasonSelector = ({ minWidth = 220 }: SeasonSelectorProps) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { seasons, selectedSeasonId } = useAppSelector(
    (state) => state.seasons
  );

  if (seasons.length === 0) return null;

  return (
    <StyledSelect
      size="small"
      value={selectedSeasonId ?? ""}
      onChange={(event) =>
        dispatch(
          setSelectedSeasonId(
            event.target.value === "" ? null : Number(event.target.value)
          )
        )
      }
      displayEmpty
      sx={{ minWidth }}
    >
      <MenuItem value="">{t(language, "season.all")}</MenuItem>
      {seasons.map((season) => (
        <MenuItem key={season.id} value={season.id}>
          {season.name}
          {season.isActive ? ` · ${t(language, "season.activeTag")}` : ""}
        </MenuItem>
      ))}
    </StyledSelect>
  );
};

export default SeasonSelector;

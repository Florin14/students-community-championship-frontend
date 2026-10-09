import { Alert, Button, MenuItem, Stack } from "@mui/material";
import { ClipboardCheck, Users, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../../components/reusable/EmptyState";
import LoadingState from "../../components/reusable/LoadingState";
import SeasonSelector from "../../components/reusable/SeasonSelector";
import SectionHeading from "../../components/reusable/SectionHeading";
import StatCard from "../../components/reusable/StatCard";
import StyledSelect from "../../components/reusable/StyledSelect";
import StyledTextField from "../../components/reusable/StyledTextField";
import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAttendanceStats } from "../../store/slices/thunks/attendanceThunks";
import { fetchTeams } from "../../store/slices/thunks/teamsThunks";
import { formatDateTimeDot, parseApiDate } from "../../utils/dateFormat";
import { AdminCard, AdminTable, TableWrap } from "../admin/adminUi";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const AttendanceStats = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector((state) => state.seasons);
  const { statistics, statsLoading, statsError } = useAppSelector((state) => state.attendance);
  const teams = useAppSelector((state) => state.teams.teams);
  const [teamId, setTeamId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const seasonId = selectedSeasonId ?? activeSeason?.id;
  useEffect(() => { dispatch(fetchTeams()); }, [dispatch]);
  useEffect(() => {
    if (!seasonId) return;
    const request = dispatch(fetchAttendanceStats({ seasonId, teamId: teamId || undefined }));
    return () => { request.abort(); };
  }, [dispatch, seasonId, teamId]);
  const rows = statistics?.data.filter((player) => player.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) ?? [];
  return (
    <>
      <SectionHeading title={t(language, "attendance.stats")} subtitle={t(language, "attendance.statsHint")} />
      <Stack direction="row" gap={2} flexWrap="wrap">
        <SeasonSelector requireSelection />
        <StyledSelect value={teamId} displayEmpty onChange={(event) => setTeamId(event.target.value === "" ? "" : Number(event.target.value))}>
          <MenuItem value="">{t(language, "attendance.allTeams")}</MenuItem>
          {teams.map((team) => <MenuItem value={team.id} key={team.id}>{team.name}</MenuItem>)}
        </StyledSelect>
        <Button component={Link} to="/admin/attendance">{t(language, "attendance.back")}</Button>
      </Stack>
      {!seasonId && <Alert severity="info">{t(language, "attendance.noSeason")}</Alert>}
      {statsLoading && <LoadingState />}
      {statsError && <Alert severity="error" action={<Button color="inherit" onClick={() => { if (seasonId) dispatch(fetchAttendanceStats({ seasonId, teamId: teamId || undefined })); }}>{t(language, "attendance.refresh")}</Button>}>{t(language, statsError)}</Alert>}
      {seasonId && !statsLoading && !statsError && statistics && (
        <>
          <Grid>
            <StatCard icon={ClipboardCheck} value={statistics.totalAttendances} label={t(language, "attendance.presences")} tone="accent" />
            <StatCard icon={Users} value={statistics.uniquePlayers} label={t(language, "attendance.uniquePlayers")} tone="violet" />
            <StatCard icon={CalendarDays} value={statistics.matchesWithAttendance} label={t(language, "attendance.matches")} tone="accent" />
          </Grid>
          <AdminCard>
            <StyledTextField value={search} onChange={(event) => setSearch(event.target.value)} label={t(language, "attendance.search")} fullWidth />
            {rows.length === 0 ? <EmptyState icon={Users} title={t(language, "attendance.emptyStats")} /> : (
              <TableWrap>
                <AdminTable>
                  <thead><tr><th>{t(language, "attendance.player")}</th><th>{t(language, "attendance.team")}</th><th>{t(language, "attendance.presences")}</th><th>{t(language, "attendance.lastPresence")}</th></tr></thead>
                  <tbody>{rows.map((player) => (
                    <tr key={player.playerId}>
                      <td>{player.name}</td><td>{player.teamName ?? "—"}</td><td>{player.presences}</td><td>{player.lastPresentAt ? formatDateTimeDot(parseApiDate(player.lastPresentAt)) : "—"}</td>
                    </tr>
                  ))}</tbody>
                </AdminTable>
              </TableWrap>
            )}
          </AdminCard>
        </>
      )}
    </>
  );
};

export default AttendanceStats;

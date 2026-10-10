import { Alert, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, Tab, Tabs } from "@mui/material";
import { CheckCircle2, ClipboardCheck, RefreshCw, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../../components/reusable/EmptyState";
import ExpandablePlayerPhoto from "../../components/reusable/ExpandablePlayerPhoto";
import LoadingState from "../../components/reusable/LoadingState";
import QrScanner from "../../components/reusable/QrScanner";
import SeasonSelector from "../../components/reusable/SeasonSelector";
import SectionHeading from "../../components/reusable/SectionHeading";
import StyledSelect from "../../components/reusable/StyledSelect";
import StyledTextField from "../../components/reusable/StyledTextField";
import TeamIdentity from "../../components/reusable/TeamIdentity";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { usePolling } from "../../hooks/usePolling";
import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearAttendance, clearAttendancePreview } from "../../store/slices/attendanceSlice";
import { confirmPlayerAttendance, fetchMatchAttendance, scanPlayerQr, voidPlayerAttendance } from "../../store/slices/thunks/attendanceThunks";
import { fetchMatches } from "../../store/slices/thunks/matchesThunks";
import { fetchOverview } from "../../store/slices/thunks/statsThunks";
import { setSelectedSeasonId } from "../../store/slices/seasonsSlice";
import type { AttendanceRecord } from "../../types/attendance";
import { formatDateTimeDot, parseApiDate } from "../../utils/dateFormat";
import { imageSrc } from "../../utils/images";
import { readPlayerQrHash } from "../../utils/playerQr";
import { covers } from "../../utils/roles";
import { AdminTable, TableWrap } from "../admin/adminUi";

const Card = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  margin: 20px 0;
`;
const Photo = styled(ExpandablePlayerPhoto)`
  width: 40%;
  max-width: 160px;
  height: 160px;
  border-radius: 16px;
`;

const Attendance = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const incomingQr = readPlayerQrHash(location.hash);
  const linkedToken = incomingQr?.token ?? "";
  const linkedSeasonId = incomingQr?.seasonId;
  const language = useAppSelector((state) => state.i18n.language);
  const user = useAppSelector((state) => state.auth.user);
  const { selectedSeasonId, activeSeason } = useAppSelector((state) => state.seasons);
  const { matches, loading: matchesLoading, error: matchesError } = useAppSelector((state) => state.matches);
  const { roster, preview, rosterLoading, rosterError, scanError, scanLoading, confirming } = useAppSelector((state) => state.attendance);
  const seasonId = linkedSeasonId ?? selectedSeasonId ?? activeSeason?.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMatchId = Number(searchParams.get("matchId"));
  const matchId = Number.isSafeInteger(requestedMatchId) && requestedMatchId > 0 ? requestedMatchId : "";
  const rosterTeam = searchParams.get("team") === "away" ? "away" : "home";
  const previousSeasonId = useRef(seasonId);
  const { linkState } = usePageNavigation();
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [correction, setCorrection] = useState<AttendanceRecord | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (linkedSeasonId) dispatch(setSelectedSeasonId(linkedSeasonId));
  }, [dispatch, linkedSeasonId]);

  useEffect(() => {
    if (previousSeasonId.current !== seasonId) {
      previousSeasonId.current = seasonId;
      setSearchParams((params) => { params.delete("matchId"); params.delete("team"); return params; }, { replace: true });
    }
  }, [seasonId, setSearchParams]);

  useEffect(() => {
    setToken(""); setVerified(false); setCorrection(null);
    dispatch(clearAttendance());
    if (seasonId) dispatch(fetchMatches({ seasonId }));
  }, [dispatch, seasonId]);

  useEffect(() => {
    dispatch(clearAttendance()); setToken(linkedToken); setVerified(false); setCorrection(null);
    setPhotoReady(false); setPhotoError(false);
    if (!matchId) return;
    const request = dispatch(fetchMatchAttendance(matchId));
    const scanRequest = linkedToken ? dispatch(scanPlayerQr({ matchId, token: linkedToken })) : null;
    return () => { request.abort(); scanRequest?.abort(); };
  }, [dispatch, matchId, linkedToken]);

  usePolling(() => {
    if (matchId) dispatch(fetchMatchAttendance(matchId));
  }, { intervalMs: 15000, enabled: Boolean(matchId), immediate: false });

  const busy = scanLoading || confirming;
  const currentRoster = roster?.matchId === matchId ? roster : null;
  const currentPreview = preview?.matchId === matchId ? preview : null;
  const canConfirm = currentRoster?.canConfirm === true;
  const scan = (value: string) => {
    if (!matchId || !value.trim() || busy) return;
    setToken(value.trim()); setVerified(false); setPhotoReady(false); setPhotoError(false);
    dispatch(scanPlayerQr({ matchId, token: value.trim() }));
  };
  const confirm = async () => {
    if (!matchId || !verified || !photoReady || !currentPreview || busy) return;
    const result = await dispatch(confirmPlayerAttendance({ matchId, token, identityConfirmed: verified }));
    if (confirmPlayerAttendance.fulfilled.match(result)) {
      dispatch(fetchMatchAttendance(matchId));
      dispatch(fetchOverview(seasonId ? { seasonId } : undefined));
    }
  };
  const correct = async () => {
    if (!correction || !matchId || reason.trim().length < 3) return;
    const result = await dispatch(voidPlayerAttendance({ id: correction.id, reason: reason.trim() }));
    if (voidPlayerAttendance.fulfilled.match(result)) {
      setCorrection(null); setReason("");
      dispatch(fetchMatchAttendance(matchId));
      dispatch(fetchOverview(seasonId ? { seasonId } : undefined));
    }
  };
  const nextPlayer = () => {
    dispatch(clearAttendancePreview()); setToken(""); setVerified(false);
    if (linkedToken) navigate({ pathname: location.pathname, search: location.search, hash: "" }, { replace: true });
  };
  const seasonMatches = matches.filter((match) => match.seasonId === seasonId)
    .slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const currentMatch = seasonMatches.find((match) => match.id === matchId);
  const rosterTeamId = rosterTeam === "home" ? currentMatch?.homeTeamId : currentMatch?.awayTeamId;
  const teamRoster = currentRoster?.data.filter(({ player }) => player.teamId === rosterTeamId) ?? [];

  return (
    <>
      <SectionHeading title={t(language, "attendance.title")} subtitle={t(language, "attendance.subtitle")} />
      <Stack direction="row" gap={2} flexWrap="wrap">
        <SeasonSelector requireSelection disabled={busy || Boolean(linkedToken)} />
        {linkedToken && !currentPreview && <Button disabled={busy} onClick={nextPlayer}>{t(language, "attendance.next")}</Button>}
        <Button component={Link} to="/admin/attendance/stats" state={linkState} startIcon={<ClipboardCheck size={20} />}>{t(language, "attendance.stats")}</Button>
      </Stack>
      {!seasonId && <Alert severity="info">{t(language, "attendance.noSeason")}</Alert>}
      {matchesError && <Alert severity="error">{t(language, "attendance.errorGeneric")}</Alert>}
      {matchesLoading && seasonMatches.length === 0 && <LoadingState />}
      {seasonId && !matchesLoading && seasonMatches.length === 0 && !matchesError && <EmptyState icon={ClipboardCheck} title={t(language, "attendance.noMatches")} />}
      {seasonMatches.length > 0 && (
        <StyledSelect fullWidth displayEmpty value={matchId} disabled={busy} sx={{ mt: 2 }} onChange={(event) => setSearchParams((params) => {
          if (event.target.value === "") params.delete("matchId");
          else params.set("matchId", String(event.target.value));
          params.delete("team");
          return params;
        })}>
          <MenuItem value="">{t(language, "attendance.chooseMatch")}</MenuItem>
          {seasonMatches.map((match) => (
            <MenuItem key={match.id} value={match.id}>
              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                <span>{formatDateTimeDot(parseApiDate(match.timestamp))} ·</span>
                <TeamIdentity teamId={match.homeTeamId} name={match.homeTeamName} logo={match.homeTeamLogo} color={match.homeTeamColor} />
                <span>/</span>
                <TeamIdentity teamId={match.awayTeamId} name={match.awayTeamName} logo={match.awayTeamLogo} color={match.awayTeamColor} />
              </Stack>
            </MenuItem>
          ))}
        </StyledSelect>
      )}
      {matchId && (
        <>
          {rosterError && <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={() => dispatch(fetchMatchAttendance(matchId))}>{t(language, "attendance.refresh")}</Button>}>{t(language, rosterError)}</Alert>}
          {rosterLoading && !currentRoster && <LoadingState />}
          {currentRoster && (
            <Card>
              <SectionHeading title={t(language, "attendance.progress", { present: currentRoster.presentCount, total: currentRoster.totalPlayers })} />
              {!canConfirm && <Alert severity="info" sx={{ mb: 2 }}>{t(language, "attendance.closed")}</Alert>}
              {scanLoading && <LoadingState />}
              {!currentPreview && !linkedToken && <>
              <QrScanner key={matchId} disabled={busy || !canConfirm} onScan={scan} />
              <Stack component="form" gap={2} sx={{ mt: 2 }} onSubmit={(event) => { event.preventDefault(); scan(token); }}>
                <StyledTextField label={t(language, "attendance.code")} helperText={t(language, "attendance.codeHint")} value={token} onChange={(event) => { setToken(event.target.value); dispatch(clearAttendancePreview()); setVerified(false); }} disabled={busy || !canConfirm} fullWidth />
                <Button type="submit" variant="outlined" disabled={busy || !canConfirm || token.trim().length < 20} sx={{ minHeight: 48 }}>{t(language, scanLoading ? "attendance.scanning" : "attendance.scan")}</Button>
              </Stack>
              </>}
              {scanError && <Alert severity="error" sx={{ mt: 2 }} action={linkedToken && <Button color="inherit" disabled={busy} onClick={() => scan(linkedToken)}>{t(language, "attendance.refresh")}</Button>}>{t(language, scanError)}</Alert>}
              {currentPreview && (
                <Stack spacing={2} sx={{ mt: 3 }}>
                  <h2>{t(language, "attendance.profile")}</h2>
                  <Stack direction="row" gap={2} alignItems="center">
                    <Photo
                      src={imageSrc(currentPreview.player.avatar)}
                      name={currentPreview.player.name}
                      onLoad={() => setPhotoReady(true)}
                      onError={() => { setPhotoReady(false); setPhotoError(true); }}
                    />
                    <Stack spacing={1} sx={{ minWidth: 0 }}>
                      <h3>{currentPreview.player.name}</h3>
                      <p><TeamIdentity teamId={currentPreview.player.teamId} name={currentPreview.player.teamName} linked /> {currentPreview.player.shirtNumber != null && `· #${currentPreview.player.shirtNumber}`}</p>
                      <Button component={Link} to={`/players/${currentPreview.player.id}`} state={linkState} startIcon={<User size={18} />}>{t(language, "attendance.player")}</Button>
                    </Stack>
                  </Stack>
                  {photoError && <Alert severity="error">{t(language, "attendance.errorPhoto")}</Alert>}
                  {currentPreview.alreadyPresent ? (
                    <Alert severity="success">{t(language, "attendance.alreadyPresent")}</Alert>
                  ) : (
                    <>
                      <FormControlLabel control={<Checkbox checked={verified} onChange={(event) => setVerified(event.target.checked)} disabled={busy || !canConfirm || !photoReady} />} label={t(language, "attendance.identity")} />
                      <Button variant="contained" size="large" startIcon={<CheckCircle2 size={22} />} disabled={!verified || !photoReady || busy || !canConfirm || !currentPreview.canConfirm} onClick={() => void confirm()} sx={{ minHeight: 56 }}>{t(language, confirming ? "attendance.confirming" : "attendance.confirm")}</Button>
                    </>
                  )}
                  <Button disabled={busy} onClick={nextPlayer}>{t(language, "attendance.next")}</Button>
                </Stack>
              )}
            </Card>
          )}
          {currentRoster && currentMatch && (
            <Card>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <h2>{t(language, "attendance.roster")}</h2>
                <Button startIcon={<RefreshCw size={18} />} onClick={() => dispatch(fetchMatchAttendance(matchId))}>{t(language, "attendance.refresh")}</Button>
              </Stack>
              <Tabs
                value={rosterTeam}
                onChange={(_, value: "home" | "away") => setSearchParams((params) => { params.set("team", value); return params; }, { replace: true })}
                aria-label={t(language, "attendance.roster")}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                selectionFollowsFocus
                sx={{ mt: 1, mb: 2, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab id="attendance-roster-tab-home" value="home" label={<TeamIdentity teamId={currentMatch.homeTeamId} name={currentMatch.homeTeamName ?? t(language, "admin.matches.homeTeam")} logo={currentMatch.homeTeamLogo} color={currentMatch.homeTeamColor} />} aria-controls="attendance-roster-panel" />
                <Tab id="attendance-roster-tab-away" value="away" label={<TeamIdentity teamId={currentMatch.awayTeamId} name={currentMatch.awayTeamName ?? t(language, "admin.matches.awayTeam")} logo={currentMatch.awayTeamLogo} color={currentMatch.awayTeamColor} />} aria-controls="attendance-roster-panel" />
              </Tabs>
              <div role="tabpanel" id="attendance-roster-panel" aria-labelledby={`attendance-roster-tab-${rosterTeam}`}>
                {teamRoster.length === 0 ? <EmptyState icon={User} title={t(language, "attendance.noTeamPlayers")} /> : (
                  <TableWrap>
                    <AdminTable>
                      <thead><tr><th>{t(language, "attendance.player")}</th><th>{t(language, "attendance.status")}</th>{covers(user?.role, "ADMIN") && <th />}</tr></thead>
                      <tbody>{teamRoster.map(({ player, attendance, isPresent }) => (
                        <tr key={player.id}>
                          <td><Link to={`/players/${player.id}`} state={linkState}>{player.name}</Link></td>
                          <td><Chip label={t(language, isPresent ? "attendance.present" : "attendance.absent")} color={isPresent ? "success" : "default"} size="small" /></td>
                          {covers(user?.role, "ADMIN") && <td>{isPresent && attendance && canConfirm && <Button disabled={busy} onClick={() => { setCorrection(attendance); setReason(""); }}>{t(language, "attendance.correct")}</Button>}</td>}
                        </tr>
                      ))}</tbody>
                    </AdminTable>
                  </TableWrap>
                )}
              </div>
            </Card>
          )}
        </>
      )}
      <Dialog open={Boolean(correction)} onClose={() => { if (!confirming) setCorrection(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{t(language, "attendance.correctTitle")}</DialogTitle>
        <DialogContent>
          <p>{t(language, "attendance.correctHint")}</p>
          <StyledTextField fullWidth label={t(language, "attendance.reason")} value={reason} onChange={(event) => setReason(event.target.value)} inputProps={{ maxLength: 200 }} sx={{ mt: 2 }} />
          {scanError && <Alert severity="error" sx={{ mt: 2 }}>{t(language, scanError)}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button disabled={confirming} onClick={() => setCorrection(null)}>{t(language, "attendance.close")}</Button>
          <Button color="error" disabled={confirming || reason.trim().length < 3} onClick={() => void correct()}>{t(language, "attendance.correct")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Attendance;

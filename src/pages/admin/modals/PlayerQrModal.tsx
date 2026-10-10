import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import LoadingState from "../../../components/reusable/LoadingState";
import SeasonSelector from "../../../components/reusable/SeasonSelector";
import { t } from "../../../i18n";
import TeamIdentity from "../../../components/reusable/TeamIdentity";
import { usePageNavigation } from "../../../hooks/usePageNavigation";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { clearPlayerQr } from "../../../store/slices/attendanceSlice";
import { issuePlayerQr, revokePlayerQr } from "../../../store/slices/thunks/attendanceThunks";
import type { Player } from "../../../types";
import { createPlayerQrUrl } from "../../../utils/playerQr";

interface Props { player: Player | null; onClose: () => void }

const PlayerQrModal = ({ player, onClose }: Props) => {
  const { linkState } = usePageNavigation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector((state) => state.seasons);
  const { qr, qrLoading, qrError } = useAppSelector((state) => state.attendance);
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"regenerate" | "revoke" | null>(null);
  const [revoked, setRevoked] = useState(false);
  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    setConfirmAction(null); setRevoked(false);
    dispatch(clearPlayerQr());
    if (player && seasonId) dispatch(issuePlayerQr({ id: player.id, seasonId }));
    return () => { dispatch(clearPlayerQr()); };
  }, [dispatch, player, seasonId]);
  
  useEffect(() => {
    let disposed = false;
    setImage(""); setImageError(false);
    if (!qr) return;
    void import("@zxing/browser").then(({ BrowserQRCodeSvgWriter }) => {
      const svg = new BrowserQRCodeSvgWriter().write(createPlayerQrUrl(qr), 400, 400);
      const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      background.setAttribute("width", "100%"); background.setAttribute("height", "100%");
      background.setAttribute("fill", "white"); svg.insertBefore(background, svg.firstChild);
      if (!disposed) setImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg)));
    }).catch(() => { if (!disposed) setImageError(true); });
    return () => { disposed = true; };
  }, [qr]);

  const action = async () => {
    if (!player || !seasonId || !confirmAction || qrLoading) return;
    if (confirmAction === "regenerate") {
      setRevoked(false);
      await dispatch(issuePlayerQr({ id: player.id, seasonId, regenerate: true }));
    } else {
      const result = await dispatch(revokePlayerQr({ id: player.id, seasonId }));
      if (revokePlayerQr.fulfilled.match(result)) setRevoked(true);
    }
    setConfirmAction(null);
  };
  return (
    <Dialog open={Boolean(player)} onClose={() => { if (!qrLoading) onClose(); }} fullWidth maxWidth="sm">
      <DialogTitle>{t(language, "attendance.qrTitle")} · {player?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center">
          <SeasonSelector requireSelection disabled={qrLoading} />
          <p>{t(language, "attendance.qrHint")}</p>
          {!seasonId && <Alert severity="info">{t(language, "attendance.noSeason")}</Alert>}
          {qrLoading && <LoadingState />}
          {qrError && <Alert severity="error">{t(language, qrError)}</Alert>}
          {imageError && <Alert severity="error">{t(language, "attendance.errorGeneric")}</Alert>}
          {revoked && <Alert severity="success">{t(language, "attendance.revoked")}</Alert>}
          {qr && image && (
            <>
              <img src={image} alt={t(language, "attendance.qrTitle")} width={320} height={320} style={{ maxWidth: "100%", height: "auto" }} />
              <strong>{qr.playerName} · <TeamIdentity teamId={qr.teamId} name={qr.teamName} /> · {qr.seasonName}</strong>
              <Button component={Link} to={{ pathname: `/players/${qr.playerId}`, hash: new URL(createPlayerQrUrl(qr)).hash }} state={linkState}>{t(language, "attendance.openProfile")}</Button>
              <Button component="a" href={image} download={`scc-player-${qr.playerId}-season-${qr.seasonId}.svg`} variant="contained">{t(language, "attendance.download")}</Button>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button disabled={!player || !seasonId || qrLoading} onClick={() => setConfirmAction("regenerate")}>{t(language, "attendance.regenerate")}</Button>
        <Button disabled={!qr || qrLoading} color="error" onClick={() => setConfirmAction("revoke")}>{t(language, "attendance.revoke")}</Button>
        <Button disabled={qrLoading} onClick={onClose}>{t(language, "attendance.close")}</Button>
      </DialogActions>
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={t(language, confirmAction === "revoke" ? "attendance.revokeTitle" : "attendance.regenerateTitle")}
        description={t(language, confirmAction === "revoke" ? "attendance.revokeHint" : "attendance.regenerateHint")}
        confirmLabel={t(language, confirmAction === "revoke" ? "attendance.revoke" : "attendance.regenerate")}
        cancelLabel={t(language, "attendance.close")}
        destructive
        onConfirm={() => void action()}
        onClose={() => { if (!qrLoading) setConfirmAction(null); }}
      />
    </Dialog>
  );
};

export default PlayerQrModal;

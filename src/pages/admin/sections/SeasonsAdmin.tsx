import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import { Pencil, Plus, Trash2, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";

import api from "../../../api/config";
import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import EmptyState from "../../../components/reusable/EmptyState";
import { t } from "../../../i18n";
import TeamIdentity from "../../../components/reusable/TeamIdentity";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  deleteSeasonThunk,
  fetchActiveSeason,
  fetchSeasons,
  removeSeasonTeamThunk,
  setSeasonTeamsThunk,
} from "../../../store/slices/thunks/seasonsThunks";
import { fetchTeams } from "../../../store/slices/thunks/teamsThunks";
import type { Season, Team } from "../../../types";
import {
  AdminCard,
  AdminTable,
  IconAction,
  RowActions,
  TableWrap,
  Toolbar,
  ToolbarGroup,
} from "../adminUi";
import SeasonModal from "../modals/SeasonModal";

const ActiveBadge = styled.span`
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--accent-soft);
  color: var(--accent);
`;

const CheckGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 16px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const SeasonsAdmin = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { seasons } = useAppSelector((state) => state.seasons);
  const { teams } = useAppSelector((state) => state.teams);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);
  const [teamsSeason, setTeamsSeason] = useState<Season | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [savingTeams, setSavingTeams] = useState(false);

  useEffect(() => {
    dispatch(fetchSeasons());
    dispatch(fetchTeams());
  }, [dispatch]);

  const openTeamsDialog = async (season: Season) => {
    setTeamsSeason(season);
    try {
      const response = await api.get<{ data: Team[] }>("/teams/", {
        params: { seasonId: season.id },
      });
      const ids = response.data.data.map((team) => team.id);
      setEnrolledIds(ids);
      setCheckedIds(ids);
    } catch {
      setEnrolledIds([]);
      setCheckedIds([]);
    }
  };

  const handleSaveTeams = async () => {
    if (!teamsSeason) return;
    setSavingTeams(true);

    const toAdd = checkedIds.filter((id) => !enrolledIds.includes(id));
    const toRemove = enrolledIds.filter((id) => !checkedIds.includes(id));

    let failed: string | null = null;

    if (toAdd.length > 0) {
      const action = await dispatch(
        setSeasonTeamsThunk({ seasonId: teamsSeason.id, teamIds: toAdd })
      );
      if (!setSeasonTeamsThunk.fulfilled.match(action)) {
        failed = String(action.payload ?? "");
      }
    }
    for (const teamId of toRemove) {
      const action = await dispatch(
        removeSeasonTeamThunk({ seasonId: teamsSeason.id, teamId })
      );
      if (!removeSeasonTeamThunk.fulfilled.match(action)) {
        failed = String(action.payload ?? "");
      }
    }

    setSavingTeams(false);
    setTeamsSeason(null);
    dispatch(fetchSeasons());

    if (failed) {
      dispatch(showSnackbar({ message: failed, severity: "error" }));
    } else {
      dispatch(
        showSnackbar({
          message: t(language, "admin.saved"),
          severity: "success",
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingSeason) return;
    const action = await dispatch(
      deleteSeasonThunk({ id: deletingSeason.id })
    );
    setDeletingSeason(null);
    if (deleteSeasonThunk.fulfilled.match(action)) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.deleted"),
          severity: "success",
        })
      );
      dispatch(fetchActiveSeason());
    } else {
      dispatch(
        showSnackbar({
          message: String(action.payload ?? t(language, "admin.saveFailed")),
          severity: "error",
        })
      );
    }
  };

  return (
    <AdminCard>
      <Toolbar>
        <ToolbarGroup />
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingSeason(null);
            setModalOpen(true);
          }}
        >
          {t(language, "admin.seasons.add")}
        </Button>
      </Toolbar>

      {seasons.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t(language, "admin.seasons.empty")}
          subtitle={t(language, "admin.seasons.emptyHint")}
        />
      ) : (
        <TableWrap>
          <AdminTable>
            <thead>
              <tr>
                <th>{t(language, "admin.seasons.colName")}</th>
                <th>{t(language, "admin.seasons.colPeriod")}</th>
                <th>{t(language, "admin.seasons.colTeams")}</th>
                <th>{t(language, "admin.seasons.colMatches")}</th>
                <th>{t(language, "admin.seasons.colStatus")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {seasons.map((season) => (
                <tr key={season.id}>
                  <td>
                    <strong>{season.name}</strong>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {season.startDate ?? "—"} → {season.endDate ?? "—"}
                  </td>
                  <td>{season.teamCount}</td>
                  <td>{season.matchCount}</td>
                  <td>
                    {season.isActive && (
                      <ActiveBadge>
                        {t(language, "admin.seasons.active")}
                      </ActiveBadge>
                    )}
                  </td>
                  <td>
                    <RowActions>
                      <IconAction
                        $tone="accent"
                        title={t(language, "admin.seasons.manageTeams")}
                        onClick={() => openTeamsDialog(season)}
                      >
                        <Users size={15} />
                      </IconAction>
                      <IconAction
                        title={t(language, "common.edit")}
                        onClick={() => {
                          setEditingSeason(season);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </IconAction>
                      <IconAction
                        $tone="danger"
                        title={t(language, "common.delete")}
                        onClick={() => setDeletingSeason(season)}
                      >
                        <Trash2 size={15} />
                      </IconAction>
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </TableWrap>
      )}

      <SeasonModal
        open={modalOpen}
        season={editingSeason}
        onClose={() => setModalOpen(false)}
      />

      <Dialog
        open={Boolean(teamsSeason)}
        onClose={() => setTeamsSeason(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
          {t(language, "admin.seasons.teamsTitle")} — {teamsSeason?.name}
        </DialogTitle>
        <DialogContent>
          {teams.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t(language, "admin.teams.empty")}
            />
          ) : (
            <CheckGrid>
              {teams.map((team) => (
                <FormControlLabel
                  key={team.id}
                  control={
                    <Checkbox
                      checked={checkedIds.includes(team.id)}
                      onChange={(event) =>
                        setCheckedIds((ids) =>
                          event.target.checked
                            ? [...ids, team.id]
                            : ids.filter((id) => id !== team.id)
                        )
                      }
                    />
                  }
                  label={<TeamIdentity teamId={team.id} name={team.name} logo={team.logo} color={team.color} />}
                  sx={{ color: "var(--text-primary)" }}
                />
              ))}
            </CheckGrid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTeamsSeason(null)} color="inherit">
            {t(language, "common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTeams}
            disabled={savingTeams}
          >
            {t(language, "common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingSeason)}
        title={t(language, "admin.seasons.deleteTitle")}
        description={t(language, "admin.seasons.deleteDescription")}
        confirmLabel={t(language, "common.delete")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeletingSeason(null)}
      />
    </AdminCard>
  );
};

export default SeasonsAdmin;

import { Button } from "@mui/material";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import EmptyState from "../../../components/reusable/EmptyState";
import TeamBadge from "../../../components/reusable/TeamBadge";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  deleteTeamThunk,
  fetchTeams,
} from "../../../store/slices/thunks/teamsThunks";
import type { Team } from "../../../types";
import {
  AdminCard,
  AdminTable,
  IconAction,
  RowActions,
  TableWrap,
  Toolbar,
  ToolbarGroup,
} from "../adminUi";
import TeamModal from "../modals/TeamModal";

const TeamsAdmin = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { teams } = useAppSelector((state) => state.teams);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!deletingTeam) return;
    const action = await dispatch(deleteTeamThunk({ id: deletingTeam.id }));
    setDeletingTeam(null);
    if (deleteTeamThunk.fulfilled.match(action)) {
      dispatch(
        showSnackbar({
          message: t(language, "admin.deleted"),
          severity: "success",
        })
      );
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
            setEditingTeam(null);
            setModalOpen(true);
          }}
        >
          {t(language, "admin.teams.add")}
        </Button>
      </Toolbar>

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t(language, "admin.teams.empty")}
          subtitle={t(language, "admin.teams.emptyHint")}
        />
      ) : (
        <TableWrap>
          <AdminTable>
            <thead>
              <tr>
                <th>{t(language, "admin.teams.colTeam")}</th>
                <th>{t(language, "admin.teams.colShortName")}</th>
                <th>{t(language, "admin.teams.colFaculty")}</th>
                <th>{t(language, "admin.teams.university")}</th>
                <th>{t(language, "admin.teams.colPlayers")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <TeamBadge
                        name={team.name}
                        shortName={team.shortName}
                        logo={team.logo}
                        color={team.color}
                        size={34}
                      />
                      <strong>{team.name}</strong>
                    </div>
                  </td>
                  <td>{team.shortName ?? "—"}</td>
                  <td>{team.faculty ?? "—"}</td>
                  <td>{team.university ?? "—"}</td>
                  <td>{team.playerCount}</td>
                  <td>
                    <RowActions>
                      <IconAction
                        title={t(language, "common.edit")}
                        onClick={() => {
                          setEditingTeam(team);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </IconAction>
                      <IconAction
                        $tone="danger"
                        title={t(language, "common.delete")}
                        onClick={() => setDeletingTeam(team)}
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

      <TeamModal
        open={modalOpen}
        team={editingTeam}
        onClose={() => setModalOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deletingTeam)}
        title={t(language, "admin.teams.deleteTitle")}
        description={t(language, "admin.teams.deleteDescription")}
        confirmLabel={t(language, "common.delete")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeletingTeam(null)}
      />
    </AdminCard>
  );
};

export default TeamsAdmin;

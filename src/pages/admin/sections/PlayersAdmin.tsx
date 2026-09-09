import { Button, MenuItem } from "@mui/material";
import { Pencil, Plus, Trash2, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import EmptyState from "../../../components/reusable/EmptyState";
import StyledSelect from "../../../components/reusable/StyledSelect";
import StyledTextField from "../../../components/reusable/StyledTextField";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  deletePlayerThunk,
  fetchPlayers,
} from "../../../store/slices/thunks/playersThunks";
import { fetchTeams } from "../../../store/slices/thunks/teamsThunks";
import type { Player } from "../../../types";
import {
  AdminCard,
  AdminTable,
  IconAction,
  RowActions,
  TableWrap,
  Toolbar,
  ToolbarGroup,
} from "../adminUi";
import PlayerModal from "../modals/PlayerModal";

const PlayersAdmin = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { players } = useAppSelector((state) => state.players);
  const { teams } = useAppSelector((state) => state.teams);

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<number | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      players.filter((player) => {
        if (teamFilter !== "" && player.teamId !== teamFilter) return false;
        if (
          search &&
          !player.name.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [players, search, teamFilter]
  );

  const handleDelete = async () => {
    if (!deletingPlayer) return;
    const action = await dispatch(
      deletePlayerThunk({ id: deletingPlayer.id })
    );
    setDeletingPlayer(null);
    if (deletePlayerThunk.fulfilled.match(action)) {
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
        <ToolbarGroup>
          <StyledTextField
            size="small"
            placeholder={t(language, "common.search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <StyledSelect
            size="small"
            value={teamFilter}
            displayEmpty
            onChange={(event) =>
              setTeamFilter(
                event.target.value === "" ? "" : Number(event.target.value)
              )
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t(language, "admin.players.allTeams")}</MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </StyledSelect>
        </ToolbarGroup>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingPlayer(null);
            setModalOpen(true);
          }}
        >
          {t(language, "admin.players.add")}
        </Button>
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={User}
          title={t(language, "admin.players.empty")}
          subtitle={t(language, "admin.players.emptyHint")}
        />
      ) : (
        <TableWrap>
          <AdminTable>
            <thead>
              <tr>
                <th>#</th>
                <th>{t(language, "admin.players.colName")}</th>
                <th>{t(language, "admin.players.colTeam")}</th>
                <th>{t(language, "admin.players.colPosition")}</th>
                <th>{t(language, "admin.players.colGoals")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr key={player.id}>
                  <td style={{ fontFamily: '"Sora", sans-serif', fontWeight: 700 }}>
                    {player.shirtNumber ?? "—"}
                  </td>
                  <td>
                    <strong>{player.name}</strong>
                  </td>
                  <td>{player.teamName ?? "—"}</td>
                  <td>
                    {player.position
                      ? t(language, ("position." + player.position) as never)
                      : "—"}
                  </td>
                  <td>{player.goals}</td>
                  <td>
                    <RowActions>
                      <IconAction
                        title={t(language, "common.edit")}
                        onClick={() => {
                          setEditingPlayer(player);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </IconAction>
                      <IconAction
                        $tone="danger"
                        title={t(language, "common.delete")}
                        onClick={() => setDeletingPlayer(player)}
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

      <PlayerModal
        open={modalOpen}
        player={editingPlayer}
        onClose={() => setModalOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deletingPlayer)}
        title={t(language, "admin.players.deleteTitle")}
        description={t(language, "admin.players.deleteDescription")}
        confirmLabel={t(language, "common.delete")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeletingPlayer(null)}
      />
    </AdminCard>
  );
};

export default PlayersAdmin;

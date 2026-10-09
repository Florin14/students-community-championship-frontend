import { Button } from "@mui/material";
import { ClipboardList, Pencil, Plus, Radio, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import ConfirmDialog from "../../../components/reusable/ConfirmDialog";
import EmptyState from "../../../components/reusable/EmptyState";
import MatchStateChip from "../../../components/reusable/MatchStateChip";
import SeasonSelector from "../../../components/reusable/SeasonSelector";
import TeamBadge from "../../../components/reusable/TeamBadge";
import { t } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showSnackbar } from "../../../store/slices/snackbarSlice";
import {
  deleteMatchThunk,
  fetchMatches,
} from "../../../store/slices/thunks/matchesThunks";
import { fetchFields } from "../../../store/slices/thunks/fieldsThunks";
import { fetchPlayers } from "../../../store/slices/thunks/playersThunks";
import { fetchUsers } from "../../../store/slices/thunks/usersThunks";
import { fetchTeams } from "../../../store/slices/thunks/teamsThunks";
import type { Match } from "../../../types";
import { formatDateTimeDot, parseApiDate } from "../../../utils/dateFormat";
import {
  AdminCard,
  AdminTable,
  IconAction,
  RowActions,
  TableWrap,
  Toolbar,
  ToolbarGroup,
} from "../adminUi";
import MatchModal from "../modals/MatchModal";
import OperatorsModal from "../modals/OperatorsModal";

const MatchTeams = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const TeamLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const MatchesAdmin = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );
  const { matches } = useAppSelector((state) => state.matches);
  const { teams } = useAppSelector((state) => state.teams);

  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams]
  );

  const seasonId = selectedSeasonId ?? activeSeason?.id ?? null;

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [operatorsModalOpen, setOperatorsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);

  useEffect(() => {
    dispatch(fetchMatches(seasonId ? { seasonId } : undefined));
    dispatch(fetchTeams());
    dispatch(fetchPlayers());
    dispatch(fetchFields());
    dispatch(fetchUsers());
  }, [dispatch, seasonId]);

  const sorted = useMemo(
    () =>
      [...matches].sort(
        (a, b) =>
          parseApiDate(b.timestamp).getTime() -
          parseApiDate(a.timestamp).getTime()
      ),
    [matches]
  );

  const handleDelete = async () => {
    if (!deletingMatch) return;
    const action = await dispatch(deleteMatchThunk({ id: deletingMatch.id }));
    setDeletingMatch(null);
    if (deleteMatchThunk.fulfilled.match(action)) {
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
          <SeasonSelector />
        </ToolbarGroup>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingMatch(null);
            setMatchModalOpen(true);
          }}
        >
          {t(language, "admin.matches.add")}
        </Button>
      </Toolbar>

      {sorted.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t(language, "admin.matches.empty")}
          subtitle={t(language, "admin.matches.emptyHint")}
        />
      ) : (
        <TableWrap>
          <AdminTable>
            <thead>
              <tr>
                <th>{t(language, "admin.matches.colDate")}</th>
                <th>{t(language, "admin.matches.colRound")}</th>
                <th>{t(language, "admin.matches.colMatch")}</th>
                <th>{t(language, "admin.matches.colField")}</th>
                <th>{t(language, "admin.matches.colScore")}</th>
                <th>{t(language, "admin.matches.colState")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((match) => {
                const homeTeam = teamsById.get(match.homeTeamId);
                const awayTeam = teamsById.get(match.awayTeamId);

                return (
                  <tr key={match.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {formatDateTimeDot(parseApiDate(match.timestamp))}
                    </td>
                    <td>{match.round ?? match.calendarLabel ?? "—"}</td>
                    <td>
                      <MatchTeams>
                        <TeamLabel>
                          <TeamBadge
                            name={match.homeTeamName ?? homeTeam?.name}
                            shortName={match.homeTeamShortName ?? homeTeam?.shortName}
                            logo={match.homeTeamLogo ?? homeTeam?.logo}
                            color={match.homeTeamColor ?? homeTeam?.color}
                            size={28}
                          />
                          <strong>{match.homeTeamName ?? homeTeam?.name}</strong>
                        </TeamLabel>
                        <span style={{ color: "var(--text-disabled)" }}>vs</span>
                        <TeamLabel>
                          <TeamBadge
                            name={match.awayTeamName ?? awayTeam?.name}
                            shortName={match.awayTeamShortName ?? awayTeam?.shortName}
                            logo={match.awayTeamLogo ?? awayTeam?.logo}
                            color={match.awayTeamColor ?? awayTeam?.color}
                            size={28}
                          />
                          <strong>{match.awayTeamName ?? awayTeam?.name}</strong>
                        </TeamLabel>
                      </MatchTeams>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {match.fieldName ?? "—"}
                    </td>
                    <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {match.scoreHome !== null &&
                      match.scoreHome !== undefined &&
                      match.scoreAway !== null &&
                      match.scoreAway !== undefined
                        ? `${match.scoreHome} : ${match.scoreAway}`
                        : "—"}
                    </td>
                    <td>
                      <MatchStateChip state={match.state} language={language} />
                    </td>
                    <td>
                      <RowActions>
                        <IconAction
                          as={Link}
                          to={`/admin/live/${match.id}`}
                          $tone="accent"
                          title={t(language, "admin.matches.openConsole")}
                        >
                          <Radio size={15} />
                        </IconAction>
                        <IconAction
                          title={t(language, "admin.matches.assignOperators")}
                          onClick={() => {
                            setEditingMatch(match);
                            setOperatorsModalOpen(true);
                          }}
                        >
                          <Users size={15} />
                        </IconAction>
                        <IconAction
                          title={t(language, "common.edit")}
                          onClick={() => {
                            setEditingMatch(match);
                            setMatchModalOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </IconAction>
                        <IconAction
                          $tone="danger"
                          title={t(language, "common.delete")}
                          onClick={() => setDeletingMatch(match)}
                        >
                          <Trash2 size={15} />
                        </IconAction>
                      </RowActions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </AdminTable>
        </TableWrap>
      )}

      <MatchModal
        open={matchModalOpen}
        match={editingMatch}
        seasonId={seasonId}
        onClose={() => setMatchModalOpen(false)}
      />
      <OperatorsModal
        open={operatorsModalOpen}
        match={editingMatch}
        onClose={() => setOperatorsModalOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deletingMatch)}
        title={t(language, "admin.matches.deleteTitle")}
        description={t(language, "admin.matches.deleteDescription")}
        confirmLabel={t(language, "common.delete")}
        cancelLabel={t(language, "common.cancel")}
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeletingMatch(null)}
      />
    </AdminCard>
  );
};

export default MatchesAdmin;

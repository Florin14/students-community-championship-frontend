import { MenuItem } from "@mui/material";
import { ArrowDown, ArrowUp, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import LoadingState from "../components/reusable/LoadingState";
import SeasonSelector from "../components/reusable/SeasonSelector";
import SectionHeading from "../components/reusable/SectionHeading";
import StyledSelect from "../components/reusable/StyledSelect";
import StyledTextField from "../components/reusable/StyledTextField";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchPlayers } from "../store/slices/thunks/playersThunks";
import { fetchTeams } from "../store/slices/thunks/teamsThunks";
import { imageSrc } from "../utils/images";

const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TableCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
`;

const TableScroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;

  th {
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-disabled);
    padding: 14px 16px;
    border-bottom: 1px solid var(--divider);
    white-space: nowrap;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider);
    font-size: 0.88rem;
    color: var(--text-primary);
    white-space: nowrap;
  }

  tbody tr {
    transition: background 0.15s ease;
  }

  tbody tr:hover {
    background: var(--bg-surface);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const SortableTh = styled.th`
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--text-secondary);
  }

  svg {
    vertical-align: middle;
    margin-left: 3px;
  }
`;

const PlayerCell = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text-primary);

  &:hover {
    color: var(--accent);
  }
`;

const Avatar = styled.span`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  font-family: "Sora", sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const GoalsValue = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 800;
  color: var(--accent);
`;

const AssistsValue = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 700;
  color: var(--violet);
`;

const CardValue = styled.span<{ $tone: "warning" | "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;

  &::before {
    content: "";
    width: 9px;
    height: 13px;
    border-radius: 3px;
    background: ${({ $tone }) =>
      $tone === "warning" ? "var(--warning)" : "var(--danger)"};
  }
`;

const Muted = styled.span`
  color: var(--text-disabled);
`;

type SortKey = "goals" | "assists" | null;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const Players = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { players, loading } = useAppSelector((state) => state.players);
  const { teams } = useAppSelector((state) => state.teams);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDesc, setSortDesc] = useState(true);

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchPlayers({
        ...(seasonId ? { seasonId } : {}),
        ...(teamFilter ? { teamId: Number(teamFilter) } : {}),
      })
    );
  }, [dispatch, seasonId, teamFilter]);

  const toggleSort = (key: Exclude<SortKey, null>) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = players;
    if (query) {
      result = result.filter((player) =>
        player.name.toLowerCase().includes(query)
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) =>
        sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
      );
    }
    return result;
  }, [players, search, sortKey, sortDesc]);

  const sortIcon = (key: Exclude<SortKey, null>) => {
    if (sortKey !== key) return null;
    return sortDesc ? <ArrowDown size={12} /> : <ArrowUp size={12} />;
  };

  return (
    <>
      <SectionHeading
        title={t(language, "players.title")}
        subtitle={t(language, "players.subtitle")}
        action={
          <Filters>
            <StyledTextField
              size="small"
              placeholder={t(language, "common.search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <StyledSelect
              size="small"
              value={teamFilter}
              onChange={(event) => setTeamFilter(String(event.target.value))}
              displayEmpty
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">{t(language, "players.allTeams")}</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={String(team.id)}>
                  {team.name}
                </MenuItem>
              ))}
            </StyledSelect>
            <SeasonSelector />
          </Filters>
        }
      />

      {loading && players.length === 0 ? (
        <LoadingState />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={User}
          title={t(language, "players.empty")}
          subtitle={t(language, "players.emptyHint")}
        />
      ) : (
        <TableCard>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t(language, "players.colPlayer")}</th>
                  <th>{t(language, "players.colTeam")}</th>
                  <th>{t(language, "players.colPosition")}</th>
                  <SortableTh onClick={() => toggleSort("goals")}>
                    {t(language, "players.colGoals")}
                    {sortIcon("goals")}
                  </SortableTh>
                  <SortableTh onClick={() => toggleSort("assists")}>
                    {t(language, "players.colAssists")}
                    {sortIcon("assists")}
                  </SortableTh>
                  <th>{t(language, "players.colYellow")}</th>
                  <th>{t(language, "players.colRed")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <Muted>
                        {player.shirtNumber !== null &&
                        player.shirtNumber !== undefined
                          ? player.shirtNumber
                          : "–"}
                      </Muted>
                    </td>
                    <td>
                      <PlayerCell to={`/players/${player.id}`}>
                        <Avatar>
                          {imageSrc(player.avatar) ? (
                            <img
                              src={imageSrc(player.avatar)}
                              alt={player.name}
                            />
                          ) : (
                            initialsOf(player.name)
                          )}
                        </Avatar>
                        {player.name}
                      </PlayerCell>
                    </td>
                    <td>
                      {player.teamShortName || player.teamName || (
                        <Muted>—</Muted>
                      )}
                    </td>
                    <td>
                      {player.position ? (
                        t(language, ("position." + player.position) as never)
                      ) : (
                        <Muted>—</Muted>
                      )}
                    </td>
                    <td>
                      <GoalsValue>{player.goals}</GoalsValue>
                    </td>
                    <td>
                      <AssistsValue>{player.assists}</AssistsValue>
                    </td>
                    <td>
                      {player.yellowCards > 0 ? (
                        <CardValue $tone="warning">
                          {player.yellowCards}
                        </CardValue>
                      ) : (
                        <Muted>0</Muted>
                      )}
                    </td>
                    <td>
                      {player.redCards > 0 ? (
                        <CardValue $tone="danger">{player.redCards}</CardValue>
                      ) : (
                        <Muted>0</Muted>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </TableCard>
      )}
    </>
  );
};

export default Players;

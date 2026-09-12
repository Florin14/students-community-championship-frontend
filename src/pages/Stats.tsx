import { BarChart3, Flame, Goal, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import SectionHeading from "../components/reusable/SectionHeading";
import StatCard from "../components/reusable/StatCard";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchDiscipline,
  fetchGoalsPerRound,
  fetchOverview,
  fetchTopAssists,
  fetchTopScorers,
} from "../store/slices/thunks/statsThunks";
import type { TopPlayer } from "../types";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-card);
`;

const ChartTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: var(--accent);
  }
`;

const ListsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const ListCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-card);
`;

const Row = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  border-radius: 12px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-surface);
  }
`;

const Rank = styled.span<{ $top: boolean }>`
  width: 22px;
  text-align: center;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.8rem;
  color: ${({ $top }) => ($top ? "var(--accent)" : "var(--text-disabled)")};
`;

const Name = styled.span`
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TeamTag = styled.span`
  font-size: 0.72rem;
  color: var(--text-disabled);
  margin-left: 4px;
`;

const Value = styled.span`
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.88rem;
  color: var(--text-primary);
`;

const CardsCount = styled.span<{ $tone: "warning" | "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--text-primary);

  &::before {
    content: "";
    width: 9px;
    height: 13px;
    border-radius: 3px;
    background: ${({ $tone }) =>
      $tone === "warning" ? "var(--warning)" : "var(--danger)"};
  }
`;

const tooltipStyle = {
  background: "var(--bg-paper-solid)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--text-primary)",
  fontSize: 12,
};

const truncate = (value: string, max = 12) =>
  value.length > max ? `${value.slice(0, max)}…` : value;

const Stats = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { overview, topScorers, topAssists, discipline, goalsPerRound } =
    useAppSelector((state) => state.stats);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    const params = seasonId ? { seasonId } : {};
    dispatch(fetchOverview(params));
    dispatch(fetchTopScorers({ ...params, limit: 10 }));
    dispatch(fetchTopAssists({ ...params, limit: 10 }));
    dispatch(fetchDiscipline({ ...params, limit: 10 }));
    dispatch(fetchGoalsPerRound(params));
  }, [dispatch, seasonId]);

  const scorersChartData = topScorers.slice(0, 8).map((player) => ({
    name: truncate(player.name),
    goals: player.goals,
  }));

  const roundsChartData = goalsPerRound.map((item) => ({
    label: item.round !== null && item.round !== undefined ? `${item.round}` : "—",
    goals: item.goals,
  }));

  const renderPlayerList = (
    items: TopPlayer[],
    render: (player: TopPlayer) => JSX.Element
  ) =>
    items.length === 0 ? (
      <EmptyState icon={BarChart3} title={t(language, "stats.empty")} />
    ) : (
      items.map((player, index) => (
        <Row key={player.playerId} to={`/players/${player.playerId}`}>
          <Rank $top={index === 0}>{index + 1}</Rank>
          <Name>
            {player.name}
            {player.teamName && <TeamTag>{player.teamName}</TeamTag>}
          </Name>
          {render(player)}
        </Row>
      ))
    );

  return (
    <>
      <StatsGrid>
        <StatCard
          icon={Goal}
          value={overview?.goals ?? "—"}
          label={t(language, "stats.totalGoals")}
          tone="accent"
        />
        <StatCard
          icon={TrendingUp}
          value={overview?.avgGoalsPerMatch ?? "—"}
          label={t(language, "stats.avgGoals")}
          tone="violet"
        />
        <StatCard
          icon={ShieldAlert}
          value={overview?.yellowCards ?? "—"}
          label={t(language, "stats.yellowCards")}
          tone="warning"
        />
        <StatCard
          icon={Flame}
          value={overview?.redCards ?? "—"}
          label={t(language, "stats.redCards")}
          tone="danger"
        />
      </StatsGrid>

      <ChartsRow>
        <ChartCard>
          <ChartTitle>
            <BarChart3 size={16} />
            {t(language, "stats.chartTopScorers")}
          </ChartTitle>
          {scorersChartData.length === 0 ? (
            <EmptyState icon={Goal} title={t(language, "stats.empty")} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scorersChartData}>
                <CartesianGrid stroke="var(--divider)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--divider)" }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={58}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: "var(--bg-surface)" }}
                  contentStyle={tooltipStyle}
                />
                <Bar
                  dataKey="goals"
                  name={t(language, "stats.goalsSeries")}
                  fill="var(--accent)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard>
          <ChartTitle>
            <TrendingUp size={16} />
            {t(language, "stats.chartGoalsPerRound")}
          </ChartTitle>
          {roundsChartData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={t(language, "stats.empty")}
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={roundsChartData}>
                <CartesianGrid stroke="var(--divider)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--divider)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label) =>
                    `${t(language, "matches.round")} ${label}`
                  }
                />
                <Area
                  type="monotone"
                  dataKey="goals"
                  name={t(language, "stats.goalsSeries")}
                  stroke="var(--violet)"
                  strokeWidth={2.5}
                  fill="var(--violet-soft)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ChartsRow>

      <ListsRow>
        <ListCard>
          <SectionHeading title={t(language, "stats.topScorers")} />
          {renderPlayerList(topScorers, (player) => (
            <Value>{player.goals}</Value>
          ))}
        </ListCard>
        <ListCard>
          <SectionHeading title={t(language, "stats.topAssists")} />
          {renderPlayerList(topAssists, (player) => (
            <Value>{player.assists}</Value>
          ))}
        </ListCard>
        <ListCard>
          <SectionHeading title={t(language, "stats.discipline")} />
          {renderPlayerList(discipline, (player) => (
            <>
              <CardsCount $tone="warning">{player.yellowCards}</CardsCount>
              <CardsCount $tone="danger">{player.redCards}</CardsCount>
            </>
          ))}
        </ListCard>
      </ListsRow>
    </>
  );
};

export default Stats;

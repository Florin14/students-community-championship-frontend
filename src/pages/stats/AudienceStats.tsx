import { Button } from "@mui/material";
import { BarChart3, Radio, TrendingUp, Users } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../../components/reusable/EmptyState";
import LoadingState from "../../components/reusable/LoadingState";
import SectionHeading from "../../components/reusable/SectionHeading";
import StatCard from "../../components/reusable/StatCard";
import TeamIdentity from "../../components/reusable/TeamIdentity";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAudienceStats } from "../../store/slices/thunks/statsThunks";
import { formatDateTimeDot, parseApiDate } from "../../utils/dateFormat";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  @media (max-width: 980px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const Ranking = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 28px;
`;

const MatchRow = styled(Link)`
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  min-height: 72px;
  border-bottom: 1px solid var(--divider);
  color: var(--text-primary);
  text-decoration: none;
  &:last-child { border-bottom: 0; }
  &:hover { background: var(--bg-surface); }
  small { display: block; color: var(--text-secondary); margin-top: 5px; }
  strong { font-family: var(--font-heading); overflow-wrap: anywhere; }
`;

const AudienceStats = ({ seasonId }: { seasonId?: number }) => {
  const dispatch = useAppDispatch();
  const { linkState } = usePageNavigation();
  const language = useAppSelector((state) => state.i18n.language);
  const { audience, audienceLoading, audienceError } = useAppSelector((state) => state.stats);
  const requestStats = () => dispatch(fetchAudienceStats({ seasonId, limit: 10 }));

  useEffect(() => {
    const task = dispatch(fetchAudienceStats({ seasonId, limit: 10 }));
    return () => task.abort();
  }, [dispatch, seasonId]);

  return (
    <section aria-label={t(language, "stats.audienceTitle")}>
      <SectionHeading title={t(language, "stats.audienceTitle")} subtitle={t(language, "stats.audienceHint")} />
      {audienceLoading ? <LoadingState /> : audienceError ? (
        <div style={{ marginBottom: 28 }}>
          <p role="alert">{t(language, "stats.audienceError")}</p>
          <Button onClick={requestStats}>{t(language, "stats.retry")}</Button>
        </div>
      ) : !audience || audience.matchesWithAudience === 0 ? (
        <EmptyState icon={Users} title={t(language, "stats.audienceEmpty")} subtitle={t(language, "stats.audienceEmptyHint")} />
      ) : (
        <>
          <Grid>
            <StatCard icon={Users} value={audience.totalSpectators} label={t(language, "stats.audienceTotal")} />
            <StatCard icon={TrendingUp} value={audience.averageSpectators?.toLocaleString(language === "ro" ? "ro-RO" : "en-GB", { maximumFractionDigits: 2 }) ?? "—"} label={t(language, "stats.audienceAverage")} tone="violet" />
            <StatCard icon={Radio} value={audience.maxSpectators ?? "—"} label={t(language, "stats.audienceMax")} />
            <StatCard icon={BarChart3} value={audience.matchesWithAudience} label={t(language, "stats.audienceMatches")} tone="violet" />
          </Grid>
          <SectionHeading title={t(language, "stats.audienceRanking")} />
          <Ranking>
            {audience.data.map((match, index) => (
              <MatchRow key={match.matchId} to={`/matches/${match.matchId}`} state={linkState}>
                <span>{index + 1}</span>
                <div>
                  <strong><TeamIdentity name={match.homeTeamName} size={22} /> – <TeamIdentity name={match.awayTeamName} size={22} /></strong>
                  <small>{formatDateTimeDot(parseApiDate(match.timestamp))}</small>
                </div>
                <strong>{t(language, "matches.audienceCount", { count: match.audience })}</strong>
              </MatchRow>
            ))}
          </Ranking>
        </>
      )}
    </section>
  );
};

export default AudienceStats;

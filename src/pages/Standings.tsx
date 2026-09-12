import { motion } from "framer-motion";
import { ListOrdered } from "lucide-react";
import { useEffect } from "react";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import LoadingState from "../components/reusable/LoadingState";
import StandingsTable from "../components/reusable/StandingsTable";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStandings } from "../store/slices/thunks/standingsThunks";

const TableCard = styled(motion.div)`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px 14px;
  font-size: 0.74rem;
  color: var(--text-secondary);

  &::before {
    content: "";
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: var(--accent);
  }
`;

const Standings = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );
  const { standings, loading } = useAppSelector((state) => state.standings);

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    if (seasonId) {
      dispatch(fetchStandings({ seasonId }));
    }
  }, [dispatch, seasonId]);

  return (
    <>
      {loading ? (
        <LoadingState />
      ) : !seasonId || standings.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title={t(language, "standings.empty")}
          subtitle={t(language, "standings.emptyHint")}
        />
      ) : (
        <TableCard
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <StandingsTable standings={standings} language={language} />
          <Legend>{t(language, "standings.legendTop")}</Legend>
        </TableCard>
      )}
    </>
  );
};

export default Standings;

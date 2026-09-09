import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  MapPin,
  SearchX,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import MatchTimeline from "../components/reusable/MatchTimeline";
import LoadingState from "../components/reusable/LoadingState";
import MatchStateChip from "../components/reusable/MatchStateChip";
import SectionHeading from "../components/reusable/SectionHeading";
import TeamBadge from "../components/reusable/TeamBadge";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearSelectedMatch } from "../store/slices/matchesSlice";
import { fetchMatchById } from "../store/slices/thunks/matchesThunks";
import { usePolling } from "../hooks/usePolling";
import { formatDateTimeDot, parseApiDate } from "../utils/dateFormat";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 18px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
`;

const Hero = styled(motion.section)`
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(
      520px 220px at 50% -40%,
      var(--violet-soft),
      transparent 70%
    ),
    var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 30px 28px;
  margin-bottom: 28px;
  box-shadow: var(--shadow-card);

  @media (max-width: 640px) {
    padding: 22px 16px;
  }
`;

const HeroTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 26px;
`;

const RoundChip = styled.span`
  font-family: "Sora", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--violet-soft);
  color: var(--violet);
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  max-width: 760px;
  margin: 0 auto;
`;

const TeamSide = styled(Link)<{ $align: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  min-width: 0;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const TeamName = styled.span`
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text-primary);

  @media (max-width: 640px) {
    font-size: 0.88rem;
  }
`;

const BigScore = styled.div`
  font-family: "Sora", sans-serif;
  font-size: 2.6rem;
  font-weight: 800;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 12px 26px;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 1.7rem;
    padding: 10px 16px;
  }
`;

const BigVs = styled.div`
  font-family: "Sora", sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-disabled);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 16px 24px;
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  flex-wrap: wrap;
  margin-top: 26px;
  font-size: 0.84rem;
  color: var(--text-secondary);

  span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  svg {
    color: var(--text-disabled);
  }
`;

const ConfirmedNote = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  color: var(--text-secondary);
  font-size: 0.82rem;
`;

const MatchDetails = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedMatch: match, loading } = useAppSelector(
    (state) => state.matches
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchMatchById({ id: Number(id) }));
    }
    return () => {
      dispatch(clearSelectedMatch());
    };
  }, [dispatch, id]);

  // Refresh while the match is being played, so the timeline fills in without
  // the reader touching anything. A finished match never re-fetches.
  usePolling(
    () => {
      if (id) dispatch(fetchMatchById({ id: Number(id) }));
    },
    {
      intervalMs: 10000,
      enabled:
        match?.state === "LIVE" || match?.state === "HALF_TIME",
      immediate: false,
    }
  );

  if (loading && !match) {
    return <LoadingState />;
  }

  if (!match) {
    return (
      <EmptyState
        icon={SearchX}
        title={t(language, "matchDetails.notFound")}
        subtitle={t(language, "matchDetails.notFoundHint")}
      />
    );
  }

  const hasScore =
    match.scoreHome !== null &&
    match.scoreHome !== undefined &&
    match.scoreAway !== null &&
    match.scoreAway !== undefined;

  const events = match.events ?? [];
  const isLive = match.state === "LIVE" || match.state === "HALF_TIME";
  const showTimeline = events.length > 0 || match.state === "FINISHED";

  return (
    <>
      <BackLink to="/matches">
        <ArrowLeft size={15} />
        {t(language, "matchDetails.back")}
      </BackLink>

      <Hero
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <HeroTop>
          {match.seasonName && <span>{match.seasonName}</span>}
          {match.round !== null && match.round !== undefined && (
            <RoundChip>
              {t(language, "matches.round")} {match.round}
            </RoundChip>
          )}
          <MatchStateChip state={match.state} language={language} />
        </HeroTop>

        <Board>
          <TeamSide $align="left" to={`/teams/${match.homeTeamId}`}>
            <TeamBadge
              name={match.homeTeamName}
              shortName={match.homeTeamShortName}
              logo={match.homeTeamLogo}
              color={match.homeTeamColor}
              size={64}
            />
            <TeamName>{match.homeTeamName}</TeamName>
          </TeamSide>
          {hasScore ? (
            <BigScore>
              {match.scoreHome} : {match.scoreAway}
            </BigScore>
          ) : (
            <BigVs>VS</BigVs>
          )}
          <TeamSide $align="right" to={`/teams/${match.awayTeamId}`}>
            <TeamBadge
              name={match.awayTeamName}
              shortName={match.awayTeamShortName}
              logo={match.awayTeamLogo}
              color={match.awayTeamColor}
              size={64}
            />
            <TeamName>{match.awayTeamName}</TeamName>
          </TeamSide>
        </Board>

        <HeroMeta>
          <span>
            <CalendarDays size={15} />
            {formatDateTimeDot(parseApiDate(match.timestamp))}
          </span>
          {match.fieldName && (
            <span>
              <Flag size={15} />
              {match.fieldName}
            </span>
          )}
          {match.location && (
            <span>
              <MapPin size={15} />
              {match.location}
            </span>
          )}
        </HeroMeta>
      </Hero>

      {showTimeline && (
        <>
          <SectionHeading
            title={t(language, "matchDetails.timeline")}
            subtitle={
              isLive ? t(language, "live.autoUpdating") : undefined
            }
          />
          <MatchTimeline
            events={events}
            homeTeamId={match.homeTeamId}
            language={language}
          />
        </>
      )}

      {match.confirmedByName && (
        <ConfirmedNote>
          <ShieldCheck size={15} />
          {t(language, "matchDetails.confirmedBy", {
            name: match.confirmedByName,
          })}
        </ConfirmedNote>
      )}
    </>
  );
};

export default MatchDetails;

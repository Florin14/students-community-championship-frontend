import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Flag,
  MapPin,
  SearchX,
  ShieldCheck,
  Tv,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import MatchTimeline from "../components/reusable/MatchTimeline";
import LoadingState from "../components/reusable/LoadingState";
import MatchClockLabel from "../components/reusable/MatchClockLabel";
import MatchStateChip from "../components/reusable/MatchStateChip";
import SectionHeading from "../components/reusable/SectionHeading";
import TeamBadge from "../components/reusable/TeamBadge";
import { t } from "../i18n";
import { liveSocketUrl } from "../api/liveConfig";
import { useLiveSocket } from "../hooks/useLiveSocket";
import { usePolling } from "../hooks/usePolling";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearSelectedMatch,
  matchReceived,
} from "../store/slices/matchesSlice";
import { fetchMatchById } from "../store/slices/thunks/matchesThunks";
import type { MatchDetails as MatchDetailsData } from "../types";
import { formatDateTimeDot, parseApiDate } from "../utils/dateFormat";
import { youtubeEmbedUrl } from "../utils/streamUrl";

interface MatchSocketMessage {
  type: string;
  data?: MatchDetailsData;
}

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
  font-family: var(--font-heading);
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
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text-primary);

  @media (max-width: 640px) {
    font-size: 0.88rem;
  }
`;

const ScoreStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const HeroClock = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--danger-soft);
  color: var(--danger);
  font-family: var(--font-heading);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const BigScore = styled.div`
  font-family: var(--font-heading);
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
  font-family: var(--font-heading);
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

const StreamBlock = styled.section`
  margin-bottom: 28px;
`;

const StreamFrame = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-surface);
  box-shadow: var(--shadow-card);

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const StreamLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
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
  const {
    selectedMatch: match,
    selectedMatchReceivedAt: receivedAt,
    loading,
  } = useAppSelector((state) => state.matches);

  useEffect(() => {
    if (id) {
      dispatch(fetchMatchById({ id: Number(id) }));
    }
    return () => {
      dispatch(clearSelectedMatch());
    };
  }, [dispatch, id]);

  const isLive = match?.state === "LIVE" || match?.state === "HALF_TIME";

  // The live service pushes the match while its page is open - kickoff, every
  // goal, the final whistle - so a reader waiting for a scheduled match sees
  // it start. Opened before the HTTP fetch answers, so the page still fills in
  // when the API is slow. A confirmed result never changes, so no socket for it.
  const onSocketMessage = useCallback(
    (message: MatchSocketMessage) => {
      if (message.type === "match" && message.data) {
        dispatch(matchReceived(message.data));
      }
    },
    [dispatch]
  );
  const { connected } = useLiveSocket<MatchSocketMessage>(
    id && match?.state !== "FINISHED"
      ? liveSocketUrl(`/ws/matches/${id}`)
      : null,
    onSocketMessage
  );

  // Without the socket, refresh while the match is being played, so the
  // timeline fills in without the reader touching anything.
  usePolling(
    () => {
      if (id) dispatch(fetchMatchById({ id: Number(id) }));
    },
    {
      intervalMs: 10000,
      enabled: !connected && isLive,
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
  const showTimeline = events.length > 0 || match.state === "FINISHED";
  const streamUrl = match.streamUrl?.trim() || null;
  const embedUrl = streamUrl ? youtubeEmbedUrl(streamUrl) : null;

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
            <ScoreStack>
              <BigScore>
                {match.scoreHome} : {match.scoreAway}
              </BigScore>
              {isLive && (
                <HeroClock>
                  <MatchClockLabel
                    match={match}
                    receivedAt={receivedAt}
                    language={language}
                  />
                </HeroClock>
              )}
            </ScoreStack>
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

      {streamUrl && (
        <StreamBlock>
          <SectionHeading title={t(language, "matchDetails.stream")} />
          {embedUrl ? (
            <StreamFrame>
              <iframe
                src={embedUrl}
                title={`${match.homeTeamName ?? ""} - ${match.awayTeamName ?? ""}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </StreamFrame>
          ) : (
            <StreamLink
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tv size={15} />
              {t(language, "matchDetails.watchStream")}
              <ExternalLink size={13} />
            </StreamLink>
          )}
        </StreamBlock>
      )}

      {showTimeline && (
        <>
          <SectionHeading
            title={t(language, "matchDetails.timeline")}
            subtitle={
              isLive
                ? t(
                    language,
                    connected ? "live.realtime" : "live.autoUpdating"
                  )
                : undefined
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

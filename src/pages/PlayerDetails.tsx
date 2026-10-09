import { motion } from "framer-motion";
import { ArrowLeft, Goal, History, User, Zap } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../components/reusable/EmptyState";
import SeasonSelector from "../components/reusable/SeasonSelector";
import SectionHeading from "../components/reusable/SectionHeading";
import StatCard from "../components/reusable/StatCard";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPlayerById,
  fetchPlayerEvents,
} from "../store/slices/thunks/playersThunks";
import type { PlayerEventType } from "../types";
import { formatDateDot, parseApiDate } from "../utils/dateFormat";
import { imageSrc } from "../utils/images";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 18px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--accent);
  }
`;

const HeaderCard = styled(motion.section)`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 26px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 84px;
  height: 84px;
  min-width: 84px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 2px solid var(--border-strong);
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PlayerName = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
`;

const TagsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PositionChip = styled.span`
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--violet-soft);
  color: var(--violet);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-heading);
`;

const TeamChip = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 700;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--accent);
  }
`;

const BigNumber = styled.div`
  font-family: var(--font-heading);
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const TimelineCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-card);
`;

const EventRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 10px;
  border-radius: 12px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-surface);
  }
`;

const EventIcon = styled.span<{ $type: PlayerEventType }>`
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) =>
    $type === "GOAL"
      ? "var(--accent-soft)"
      : $type === "ASSIST"
        ? "var(--violet-soft)"
        : $type === "YELLOW"
          ? "var(--warning-soft)"
          : "var(--danger-soft)"};
  color: ${({ $type }) =>
    $type === "GOAL"
      ? "var(--accent)"
      : $type === "ASSIST"
        ? "var(--violet)"
        : $type === "YELLOW"
          ? "var(--warning)"
          : "var(--danger)"};
`;

const CardRect = styled.span<{ $tone: "warning" | "danger" }>`
  width: 11px;
  height: 15px;
  border-radius: 3px;
  background: ${({ $tone }) =>
    $tone === "warning" ? "var(--warning)" : "var(--danger)"};
`;

const EventBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EventLabel = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
`;

const EventMatch = styled.span`
  font-size: 0.78rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EventDate = styled.span`
  font-size: 0.75rem;
  color: var(--text-disabled);
  white-space: nowrap;
`;

const MinuteChip = styled.span`
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-secondary);
  white-space: nowrap;
`;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const PlayerDetails = () => {
  const { id } = useParams();
  const playerId = Number(id);
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { selectedPlayer, selectedPlayerEvents } = useAppSelector(
    (state) => state.players
  );
  const { selectedSeasonId, activeSeason } = useAppSelector(
    (state) => state.seasons
  );

  const seasonId = selectedSeasonId ?? activeSeason?.id;

  useEffect(() => {
    if (!Number.isFinite(playerId)) return;
    dispatch(fetchPlayerById({ id: playerId, seasonId }));
  }, [dispatch, playerId, seasonId]);

  useEffect(() => {
    if (!Number.isFinite(playerId)) return;
    dispatch(fetchPlayerEvents({ id: playerId }));
  }, [dispatch, playerId]);

  if (!selectedPlayer || selectedPlayer.id !== playerId) {
    return (
      <>
        <BackLink to="/players">
          <ArrowLeft size={15} />
          {t(language, "playerDetails.back")}
        </BackLink>
        <EmptyState
          icon={User}
          title={t(language, "playerDetails.notFound")}
        />
      </>
    );
  }

  return (
    <>
      <BackLink to="/players">
        <ArrowLeft size={15} />
        {t(language, "playerDetails.back")}
      </BackLink>

      <HeaderCard
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Avatar>
          {imageSrc(selectedPlayer.avatar) ? (
            <img
              src={imageSrc(selectedPlayer.avatar)}
              alt={selectedPlayer.name}
            />
          ) : (
            initialsOf(selectedPlayer.name)
          )}
        </Avatar>
        <HeaderInfo>
          <PlayerName>{selectedPlayer.name}</PlayerName>
          <TagsRow>
            {selectedPlayer.position && (
              <PositionChip>
                {t(
                  language,
                  ("position." + selectedPlayer.position) as never
                )}
              </PositionChip>
            )}
            {selectedPlayer.teamId && selectedPlayer.teamName && (
              <TeamChip to={`/teams/${selectedPlayer.teamId}`}>
                {selectedPlayer.teamName}
              </TeamChip>
            )}
          </TagsRow>
        </HeaderInfo>
        {selectedPlayer.shirtNumber !== null &&
          selectedPlayer.shirtNumber !== undefined && (
            <BigNumber>#{selectedPlayer.shirtNumber}</BigNumber>
          )}
        <SeasonSelector minWidth={180} />
      </HeaderCard>

      <StatsGrid>
        <StatCard
          icon={User}
          value={selectedPlayer.attendanceCount ?? 0}
          label={t(language, "attendance.presences")}
          tone="accent"
        />
        <StatCard
          icon={Goal}
          value={selectedPlayer.goals}
          label={t(language, "playerDetails.goals")}
          tone="accent"
        />
        <StatCard
          icon={Zap}
          value={selectedPlayer.assists}
          label={t(language, "playerDetails.assists")}
          tone="violet"
        />
        <StatCard
          icon={History}
          value={selectedPlayer.yellowCards}
          label={t(language, "playerDetails.yellowCards")}
          tone="warning"
        />
        <StatCard
          icon={History}
          value={selectedPlayer.redCards}
          label={t(language, "playerDetails.redCards")}
          tone="danger"
        />
      </StatsGrid>

      <TimelineCard>
        <SectionHeading title={t(language, "playerDetails.timeline")} />
        {selectedPlayerEvents.length === 0 ? (
          <EmptyState
            icon={History}
            title={t(language, "playerDetails.noEvents")}
            subtitle={t(language, "playerDetails.noEventsHint")}
          />
        ) : (
          selectedPlayerEvents.map((event, index) => (
            <EventRow
              key={`${event.matchId}-${event.type}-${index}`}
              to={`/matches/${event.matchId}`}
            >
              <EventIcon $type={event.type}>
                {event.type === "GOAL" && <Goal size={17} />}
                {event.type === "ASSIST" && <Zap size={17} />}
                {event.type === "YELLOW" && <CardRect $tone="warning" />}
                {event.type === "RED" && <CardRect $tone="danger" />}
              </EventIcon>
              <EventBody>
                <EventLabel>
                  {t(
                    language,
                    ("playerDetails.event." + event.type) as never
                  )}
                </EventLabel>
                <EventMatch>
                  {event.homeTeamName} vs {event.awayTeamName}
                  {event.scoreHome !== null &&
                  event.scoreHome !== undefined &&
                  event.scoreAway !== null &&
                  event.scoreAway !== undefined
                    ? ` · ${event.scoreHome}-${event.scoreAway}`
                    : ""}
                </EventMatch>
              </EventBody>
              <EventMeta>
                {event.minute !== null && event.minute !== undefined && (
                  <MinuteChip>{event.minute}&apos;</MinuteChip>
                )}
                <EventDate>
                  {formatDateDot(parseApiDate(event.timestamp))}
                </EventDate>
              </EventMeta>
            </EventRow>
          ))
        )}
      </TimelineCard>
    </>
  );
};

export default PlayerDetails;

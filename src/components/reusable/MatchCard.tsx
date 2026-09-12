import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Language, t } from "../../i18n";
import type { Match } from "../../types";
import { formatDateTimeDot, parseApiDate } from "../../utils/dateFormat";
import MatchStateChip from "./MatchStateChip";
import TeamBadge from "./TeamBadge";

const Card = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card-hover);
    border-color: var(--border-strong);
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text-secondary);
`;

const Teams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
`;

const TeamSide = styled.div<{ $align: "left" | "right" }>`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-direction: ${({ $align }) => ($align === "right" ? "row-reverse" : "row")};
  min-width: 0;
`;

const TeamName = styled.span`
  font-weight: 700;
  font-family: var(--font-heading);
  font-size: 0.92rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Score = styled.div`
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 6px 14px;
  white-space: nowrap;
`;

const Vs = styled.div`
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-disabled);
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 8px 14px;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-disabled);

  svg {
    flex-shrink: 0;
  }
`;

interface MatchCardProps {
  match: Match;
  language: Language;
}

const MatchCard = ({ match, language }: MatchCardProps) => {
  const navigate = useNavigate();
  const hasScore =
    match.scoreHome !== null &&
    match.scoreHome !== undefined &&
    match.scoreAway !== null &&
    match.scoreAway !== undefined;

  return (
    <Card onClick={() => navigate(`/matches/${match.id}`)}>
      <TopRow>
        <span>
          {match.round
            ? `${t(language, "matches.round")} ${match.round} · `
            : ""}
          {formatDateTimeDot(parseApiDate(match.timestamp))}
        </span>
        <MatchStateChip state={match.state} language={language} />
      </TopRow>
      <Teams>
        <TeamSide $align="left">
          <TeamBadge
            name={match.homeTeamName}
            shortName={match.homeTeamShortName}
            logo={match.homeTeamLogo}
            color={match.homeTeamColor}
            size={38}
          />
          <TeamName>{match.homeTeamName}</TeamName>
        </TeamSide>
        {hasScore ? (
          <Score>
            {match.scoreHome} : {match.scoreAway}
          </Score>
        ) : (
          <Vs>VS</Vs>
        )}
        <TeamSide $align="right">
          <TeamBadge
            name={match.awayTeamName}
            shortName={match.awayTeamShortName}
            logo={match.awayTeamLogo}
            color={match.awayTeamColor}
            size={38}
          />
          <TeamName>{match.awayTeamName}</TeamName>
        </TeamSide>
      </Teams>
      {match.location && (
        <Location>
          <MapPin size={13} />
          {match.location}
        </Location>
      )}
    </Card>
  );
};

export default MatchCard;

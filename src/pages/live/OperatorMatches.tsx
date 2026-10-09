import { CalendarDays, Flag, Radio } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import EmptyState from "../../components/reusable/EmptyState";
import LoadingState from "../../components/reusable/LoadingState";
import MatchStateChip from "../../components/reusable/MatchStateChip";
import SectionHeading from "../../components/reusable/SectionHeading";
import TeamBadge from "../../components/reusable/TeamBadge";
import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMyMatches } from "../../store/slices/thunks/liveScoringThunks";
import { formatDateTimeDot, parseApiDate } from "../../utils/dateFormat";
import { BigButton } from "./consoleUi";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 560px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.79rem;
  color: var(--text-secondary);
`;

const Meta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const Teams = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
`;

const Side = styled.div<{ $align: "left" | "right" }>`
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex-direction: ${({ $align }) => ($align === "right" ? "row-reverse" : "row")};

  strong {
    font-family: var(--font-heading);
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }
`;

const Score = styled.span`
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

/**
 * The operator's home screen: the matches this account may score.
 *
 * Operators may access all open matches.
 */
const OperatorMatches = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { myMatches, loading } = useAppSelector((state) => state.liveScoring);

  useEffect(() => {
    dispatch(fetchMyMatches());
  }, [dispatch]);

  if (loading && myMatches.length === 0) return <LoadingState />;

  return (
    <>
      <SectionHeading
        title={t(language, "console.title")}
        subtitle={t(language, "console.subtitle")}
      />

      {myMatches.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={t(language, "console.noOpenMatches")}
          subtitle={t(language, "console.noOpenMatchesHint")}
        />
      ) : (
        <List>
          {myMatches.map((match) => {
            const hasScore =
              match.scoreHome !== null &&
              match.scoreHome !== undefined &&
              match.scoreAway !== null &&
              match.scoreAway !== undefined;

            return (
              <Card key={match.id}>
                <CardTop>
                  <Meta>
                    <CalendarDays size={14} />
                    {formatDateTimeDot(parseApiDate(match.timestamp))}
                  </Meta>
                  {match.fieldName && (
                    <Meta>
                      <Flag size={14} />
                      {match.fieldName}
                    </Meta>
                  )}
                  <MatchStateChip state={match.state} language={language} />
                </CardTop>

                <Teams>
                  <Side $align="left">
                    <TeamBadge
                      name={match.homeTeamName}
                      shortName={match.homeTeamShortName}
                      logo={match.homeTeamLogo}
                      color={match.homeTeamColor}
                      size={34}
                    />
                    <strong>{match.homeTeamName}</strong>
                  </Side>
                  <Score>
                    {hasScore ? `${match.scoreHome} : ${match.scoreAway}` : "–"}
                  </Score>
                  <Side $align="right">
                    <TeamBadge
                      name={match.awayTeamName}
                      shortName={match.awayTeamShortName}
                      logo={match.awayTeamLogo}
                      color={match.awayTeamColor}
                      size={34}
                    />
                    <strong>{match.awayTeamName}</strong>
                  </Side>
                </Teams>

                <BigButton
                  as={Link}
                  to={`/admin/live/${match.id}`}
                  style={{ textDecoration: "none" }}
                >
                  {t(language, "console.open")}
                </BigButton>
              </Card>
            );
          })}
        </List>
      )}
    </>
  );
};

export default OperatorMatches;

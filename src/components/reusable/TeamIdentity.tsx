import { Link } from "react-router-dom";
import styled from "styled-components";

import { usePageNavigation } from "../../hooks/usePageNavigation";
import { useAppSelector } from "../../store/hooks";
import TeamBadge from "./TeamBadge";

const Identity = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  vertical-align: middle;

  > span:last-child { overflow-wrap: anywhere; }
`;

const TeamLink = styled(Link)`
  color: inherit;
  &:hover { color: var(--accent); }
`;

interface TeamIdentityProps {
  teamId?: number | null;
  name?: string | null;
  shortName?: string | null;
  logo?: string | null;
  color?: string | null;
  size?: number;
  linked?: boolean;
  className?: string;
}

/** A compact team name and crest, also for API records that only carry a name. */
const TeamIdentity = ({ teamId, name, shortName, logo, color, size = 26, linked = false, className }: TeamIdentityProps) => {
  const team = useAppSelector((state) => teamId != null
    ? state.teams.directory[teamId]
    : Object.values(state.teams.directory).find((entry) => entry.name === name));
  const { linkState } = usePageNavigation();
  const resolvedName = name ?? team?.name;
  if (!resolvedName) return <span className={className}>—</span>;

  const content = (
    <Identity className={className}>
      <TeamBadge name={resolvedName} shortName={shortName ?? team?.shortName} logo={logo ?? team?.logo} color={color ?? team?.color} size={size} decorative />
      <span>{resolvedName}</span>
    </Identity>
  );
  const resolvedId = teamId ?? team?.id;
  return linked && resolvedId != null
    ? <TeamLink to={`/teams/${resolvedId}`} state={linkState}>{content}</TeamLink>
    : content;
};

export default TeamIdentity;

export type PlayerPosition =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD";

export type MatchState =
  | "SCHEDULED"
  | "LIVE"
  | "HALF_TIME"
  | "FINISHED"
  | "POSTPONED";

export type MatchEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "YELLOW_CARD"
  | "RED_CARD";

export type MatchEventStatus = "ACTIVE" | "CORRECTED" | "VOIDED";

/** Hierarchical: an ADMIN may do anything an OPERATOR may. */
export type PlatformRole = "OPERATOR" | "ADMIN" | "SUPER_ADMIN";

// --- Auth ---------------------------------------------------------------

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: PlatformRole;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// --- Season ---------------------------------------------------------------

export interface Season {
  id: number;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  teamCount: number;
  matchCount: number;
}

export interface SeasonPayload {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

// --- Team -------------------------------------------------------------------

export interface Team {
  id: number;
  name: string;
  shortName?: string | null;
  faculty?: string | null;
  description?: string | null;
  color?: string | null;
  logo?: string | null;
  playerCount: number;
}

export interface TeamPayload {
  name: string;
  shortName?: string | null;
  faculty?: string | null;
  description?: string | null;
  color?: string | null;
  logo?: string | null;
}

// --- Player -----------------------------------------------------------------

export interface Player {
  id: number;
  name: string;
  position?: PlayerPosition | null;
  shirtNumber?: number | null;
  avatar?: string | null;
  teamId?: number | null;
  teamName?: string | null;
  teamShortName?: string | null;
  goals: number;
  ownGoals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface PlayerPayload {
  name: string;
  position?: PlayerPosition | null;
  shirtNumber?: number | null;
  avatar?: string | null;
  teamId?: number | null;
}

export type PlayerEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "ASSIST"
  | "YELLOW"
  | "RED";

export interface PlayerEvent {
  matchId: number;
  timestamp: string;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  type: PlayerEventType;
  minute?: number | null;
}

// --- Match --------------------------------------------------------------------

export interface MatchEvent {
  id: number;
  matchId: number;
  clientEventId?: string | null;
  type: MatchEventType;
  status: MatchEventStatus;
  teamId: number;
  playerId?: number | null;
  playerName?: string | null;
  assistPlayerId?: number | null;
  assistName?: string | null;
  minute?: number | null;
  createdAt: string;
  createdById?: number | null;
  createdByName?: string | null;
  voidedAt?: string | null;
  voidedByName?: string | null;
  voidReason?: string | null;
  supersedesEventId?: number | null;
}

export interface Match {
  id: number;
  seasonId: number;
  seasonName?: string | null;
  round?: number | null;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeTeamShortName?: string | null;
  awayTeamShortName?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  homeTeamColor?: string | null;
  awayTeamColor?: string | null;
  timestamp: string;
  fieldId?: number | null;
  fieldName?: string | null;
  location?: string | null;
  /** Public stream link (YouTube or any http(s) URL) shown on the match page. */
  streamUrl?: string | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  state: MatchState;
  /** Kickoff. Null before the match starts, which is when the score is null too. */
  startedAt?: string | null;
  isClockRunning: boolean;
  /** Server-side minute at the time of the response; the client ticks on from here. */
  currentMinute?: number | null;
  /**
   * Playing time in seconds when the response was built, running segment
   * included. Optional so an older API without it still renders (treated as 0).
   */
  playedSeconds?: number;
  /** A confirmed result. Writes are refused until a super-admin reopens it. */
  isLocked: boolean;
}

export interface MatchOperator {
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
}

export interface MatchDetails extends Match {
  events: MatchEvent[];
  confirmedAt?: string | null;
  confirmedByName?: string | null;
  operators: MatchOperator[];
}

export interface LiveMatch extends Match {
  events: MatchEvent[];
}

export interface LiveMatchesResponse {
  data: LiveMatch[];
  /** Changes only when something a viewer would notice changes. */
  revision: string;
  serverTime: string;
}

export interface MatchPayload {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  round?: number | null;
  timestamp: string;
  fieldId?: number | null;
  location?: string | null;
  streamUrl?: string | null;
  operatorIds?: number[];
}

export interface MatchUpdatePayload {
  round?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  timestamp?: string;
  fieldId?: number | null;
  location?: string | null;
  /** null clears the link. */
  streamUrl?: string | null;
  state?: MatchState;
}

export interface MatchEventInput {
  type: MatchEventType;
  teamId: number;
  /** Generated on the client before sending: replaying it is what makes a retry safe. */
  clientEventId: string;
  playerId?: number | null;
  assistPlayerId?: number | null;
  minute?: number | null;
  supersedesEventId?: number | null;
}

export interface MatchEventWriteResponse {
  event: MatchEvent;
  /** False when the server recognised the client event id, i.e. this was a retry. */
  created: boolean;
  scoreHome?: number | null;
  scoreAway?: number | null;
  currentMinute?: number | null;
}

// --- Field (teren) ------------------------------------------------------------

export interface Field {
  id: number;
  name: string;
  shortName?: string | null;
  location?: string | null;
  description?: string | null;
}

export interface FieldPayload {
  name: string;
  shortName?: string | null;
  location?: string | null;
  description?: string | null;
}

// --- Accounts -----------------------------------------------------------------

export interface PlatformUser {
  id: number;
  name: string;
  email: string;
  role: PlatformRole;
  isActive: boolean;
}

export interface UserPayload {
  name: string;
  email: string;
  password: string;
  role: PlatformRole;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role?: PlatformRole;
  isActive?: boolean;
  password?: string;
}

// --- Audit --------------------------------------------------------------------

export interface AuditLogEntry {
  id: number;
  createdAt: string;
  entityType: string;
  entityId?: number | null;
  action: string;
  matchId?: number | null;
  userId?: number | null;
  userName?: string | null;
  summary?: string | null;
  details?: Record<string, unknown> | null;
}

// --- Standings ------------------------------------------------------------------

export interface Standing {
  id: number;
  seasonId: number;
  teamId: number;
  teamName?: string | null;
  teamShortName?: string | null;
  teamLogo?: string | null;
  teamColor?: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string;
}

// --- Stats ----------------------------------------------------------------------

export interface TopPlayer {
  playerId: number;
  name: string;
  teamId?: number | null;
  teamName?: string | null;
  avatar?: string | null;
  goals: number;
  ownGoals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface GoalsPerRound {
  round?: number | null;
  matches: number;
  goals: number;
}

export interface StatsOverview {
  teams: number;
  players: number;
  matchesPlayed: number;
  matchesUpcoming: number;
  goals: number;
  avgGoalsPerMatch: number;
  yellowCards: number;
  redCards: number;
  topScorerName?: string | null;
  topScorerTeamName?: string | null;
  topScorerGoals: number;
}

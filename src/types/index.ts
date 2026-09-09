export type PlayerPosition =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD";

export type MatchState = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";

export type CardType = "YELLOW" | "RED";

export type PlatformRole = "ADMIN";

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

export type PlayerEventType = "GOAL" | "ASSIST" | "YELLOW" | "RED";

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

export interface Goal {
  id: number;
  teamId: number;
  scorerId?: number | null;
  scorerName?: string | null;
  assistPlayerId?: number | null;
  assistName?: string | null;
  minute?: number | null;
}

export interface MatchCard {
  id: number;
  teamId: number;
  playerId?: number | null;
  playerName?: string | null;
  cardType: CardType;
  minute?: number | null;
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
  location?: string | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  state: MatchState;
}

export interface MatchDetails extends Match {
  goals: Goal[];
  cards: MatchCard[];
}

export interface MatchPayload {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  round?: number | null;
  timestamp: string;
  location?: string | null;
}

export interface MatchUpdatePayload {
  round?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  timestamp?: string;
  location?: string | null;
  state?: MatchState;
}

export interface GoalInput {
  teamId: number;
  scorerId?: number | null;
  assistPlayerId?: number | null;
  minute?: number | null;
}

export interface CardInput {
  teamId: number;
  playerId: number;
  cardType: CardType;
  minute?: number | null;
}

export interface MatchResultPayload {
  scoreHome: number;
  scoreAway: number;
  goals: GoalInput[];
  cards: CardInput[];
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

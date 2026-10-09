import type { Player } from "./index";

export interface PlayerQr {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  seasonId: number;
  seasonName: string;
  issuedAt: string;
  token: string;
}

export interface AttendanceRecord {
  id: number;
  matchId: number;
  playerId: number | null;
  playerIdSnapshot: number;
  playerNameSnapshot: string;
  teamId: number;
  teamNameSnapshot: string;
  shirtNumberSnapshot: number | null;
  status: "PRESENT" | "VOIDED";
  confirmedAt: string;
  confirmedById: number | null;
  confirmedByNameSnapshot: string;
  voidedAt: string | null;
  voidReason: string | null;
}

export interface AttendancePreview {
  matchId: number;
  player: Player;
  alreadyPresent: boolean;
  canConfirm: boolean;
  attendance: AttendanceRecord | null;
}

export interface MatchAttendance {
  matchId: number;
  canConfirm: boolean;
  presentCount: number;
  totalPlayers: number;
  data: { player: Player; attendance: AttendanceRecord | null; isPresent: boolean }[];
  records: AttendanceRecord[];
}

export interface AttendanceStatistics {
  totalAttendances: number;
  uniquePlayers: number;
  matchesWithAttendance: number;
  data: {
    playerId: number;
    name: string;
    teamId: number | null;
    teamName: string | null;
    presences: number;
    lastPresentAt: string | null;
  }[];
}

import type { CalendarPhase, SeasonCalendarPeriod } from "../types";

/** Proposed calendar supplied by the organiser; applied explicitly and editable. */
export const calendar2026 = (): SeasonCalendarPeriod[] => {
  const period = (
    startDate: string, endDate: string, label: string, phase: CalendarPhase,
    round: number | null = null, isBreak = false
  ): SeasonCalendarPeriod => ({ startDate, endDate, label, phase, round, isBreak });

  return [
    period("2026-10-26", "2026-10-27", "Stage 1", "LEAGUE", 1),
    period("2026-11-02", "2026-11-03", "Stage 2", "LEAGUE", 2),
    period("2026-11-09", "2026-11-10", "Stage 3", "LEAGUE", 3),
    period("2026-11-16", "2026-11-17", "Stage 4", "LEAGUE", 4),
    period("2026-11-23", "2026-11-24", "Stage 5", "LEAGUE", 5),
    period("2026-11-30", "2026-12-01", "FREE WEEK – Legal holidays", "LEAGUE", null, true),
    period("2026-12-07", "2026-12-08", "Stage 6", "LEAGUE", 6),
    period("2026-12-14", "2026-12-15", "Stage 7", "LEAGUE", 7),
    period("2026-12-21", "2027-01-03", "HOLIDAY BREAK – Winter vacation", "LEAGUE", null, true),
    period("2027-01-04", "2027-01-10", "Winter vacation", "LEAGUE", null, true),
    period("2027-01-11", "2027-01-12", "Stage 8", "LEAGUE", 8),
    period("2027-01-18", "2027-02-07", "SESSIONS", "ACADEMIC_BREAK", null, true),
    period("2027-02-08", "2027-02-14", "INTER-SESSION BREAK", "ACADEMIC_BREAK", null, true),
    period("2027-02-15", "2027-02-21", "INTER-SESSION BREAK", "ACADEMIC_BREAK", null, true),
    period("2027-02-22", "2027-02-28", "REMAINING MATCHES WEEK (if needed)", "ACADEMIC_BREAK"),
    period("2027-03-01", "2027-03-02", "PLAY-OFF – ROUND OF 16", "PLAY_OFF"),
    period("2027-03-08", "2027-03-09", "PLAY-OFF – QUARTER-FINALS", "PLAY_OFF"),
    period("2027-03-15", "2027-03-16", "BREAK", "PLAY_OFF", null, true),
    period("2027-03-22", "2027-03-23", "QUARTER-FINALS – 1ST LEG", "FINAL_STAGES"),
    period("2027-04-05", "2027-04-06", "QUARTER-FINALS – 2ND LEG", "FINAL_STAGES"),
    period("2027-04-12", "2027-04-13", "SEMI-FINALS – 1ST LEG (if needed)", "FINAL_STAGES"),
    period("2027-04-19", "2027-04-20", "SEMI-FINALS – 1ST LEG", "SEMIFINALS"),
    period("2027-04-26", "2027-04-27", "SEMI-FINALS – 2ND LEG", "SEMIFINALS"),
    period("2027-05-15", "2027-05-15", "FINAL", "FINAL"),
  ];
};

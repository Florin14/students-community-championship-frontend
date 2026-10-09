import type { SeasonCalendarPeriod } from "../types";

const calendarDay = (value: string): number | null => {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const milliseconds = Date.parse(day + "T00:00:00Z");
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString().slice(0, 10) !== day) return null;
  // Compare date labels, independently of the browser timezone or DST.
  return milliseconds / 86_400_000;
};

export const weeklyRound = (timestamp: string, startDate?: string | null): number => {
  const day = calendarDay(timestamp);
  const start = startDate ? calendarDay(startDate) : null;
  if (day === null || start === null) return 1;
  return Math.max(1, Math.floor((day - start) / 7) + 1);
};

export const findCalendarPeriod = (
  timestamp: string, periods: SeasonCalendarPeriod[] = []
): SeasonCalendarPeriod | null => {
  const day = calendarDay(timestamp);
  if (day === null) return null;
  return periods.find((period) => {
    const start = calendarDay(period.startDate);
    const end = calendarDay(period.endDate);
    return start !== null && end !== null && start <= day && day <= end;
  }) ?? null;
};

export const calendarError = (periods: SeasonCalendarPeriod[]): string | null => {
  if (periods.some((period) => !period.label.trim() || period.label.length > 160)) return "calendar.invalidLabel";
  if (periods.some((period) => {
    const start = calendarDay(period.startDate);
    const end = calendarDay(period.endDate);
    return start === null || end === null || end < start;
  })) return "calendar.invalidDates";
  if (periods.some((period) => period.round !== null &&
    (!Number.isInteger(period.round) || period.round < 1 || period.round > 999 || period.isBreak))) return "calendar.invalidRound";
  const ordered = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (ordered.some((period, index) => index > 0 && period.startDate <= ordered[index - 1].endDate)) return "calendar.overlap";
  return null;
};

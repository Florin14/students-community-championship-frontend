export function parseApiDate(value: string): Date {
  // Backend serializes datetimes as "YYYY-MM-DD HH:MM:SS"
  return new Date(value.replace(" ", "T"));
}

export function formatDateDot(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${date.getFullYear()}`;
}

export function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

export function formatDateTimeDot(date: Date): string {
  return `${formatDateDot(date)} ${formatTime(date)}`;
}

export function formatShortDateDot(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

export function toInputDateTimeLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${formatTime(date)}`;
}

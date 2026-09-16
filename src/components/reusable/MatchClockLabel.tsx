import { useMatchClock } from "../../hooks/useMatchClock";
import { t } from "../../i18n";
import type { Language } from "../../i18n";
import type { Match } from "../../types";

interface MatchClockLabelProps {
  match: Pick<Match, "state" | "playedSeconds" | "isClockRunning">;
  /** When the match payload was stored - the clock ticks on from there. */
  receivedAt: number;
  language: Language;
}

/**
 * The text of a live clock: `41:07` ticking while the ball is in play, the
 * word for half time while it is not. Text only, so each page keeps its own
 * pill or label styling around it; a component rather than a hook because the
 * live pages render one clock per match inside a `map`.
 */
const MatchClockLabel = ({ match, receivedAt, language }: MatchClockLabelProps) => {
  const { label } = useMatchClock({
    playedSeconds: match.playedSeconds,
    isClockRunning: match.isClockRunning,
    receivedAt,
  });

  if (match.state === "HALF_TIME") return <>{t(language, "live.halfTime")}</>;
  return <>{label}</>;
};

export default MatchClockLabel;

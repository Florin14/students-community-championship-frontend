import { Alert, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { useOnlineStatus, usePolling } from "../hooks/usePolling";
import { t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatchReminders } from "../store/slices/thunks/liveScoringThunks";
import { getMatchReminders } from "../utils/matchReminders";
import { MATCH_REMINDER_STORAGE_KEY } from "../utils/storageKeys";

const Notice = styled.div`
  margin-bottom: 20px;

  .MuiAlert-root {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--warning);
    border-radius: 14px;
  }
  .MuiAlert-icon { color: var(--warning); }
  .MuiAlert-message { min-width: 0; overflow-wrap: anywhere; }
  strong { display: block; margin-bottom: 4px; }
`;

const readDismissed = (storageKey: string): Record<string, number> => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(
      ([, hour]) => typeof hour === "number" && Number.isInteger(hour) && hour >= 1
    ));
  } catch {
    return {};
  }
};

const LiveMatchReminder = ({ userId }: { userId: number }) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.i18n.language);
  const { reminderMatches, reminderRequestId } = useAppSelector((state) => state.liveScoring);
  const online = useOnlineStatus();
  const storageKey = `${MATCH_REMINDER_STORAGE_KEY}:${userId}`;
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey));

  usePolling(() => {
    if (reminderRequestId === null) dispatch(fetchMatchReminders());
  }, { intervalMs: 60_000, enabled: online });

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) {
        setDismissed(readDismissed(storageKey));
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storageKey]);

  const reminder = getMatchReminders(reminderMatches, dismissed)[0];
  if (!reminder) return null;

  const dismiss = () => {
    const next = { ...readDismissed(storageKey), ...dismissed, [reminder.key]: reminder.hour };
    setDismissed(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Still dismissed for this page session when storage is unavailable.
    }
  };

  return (
    <Notice>
      <Alert severity="warning" onClose={dismiss} closeText={t(language, "console.reminderDismiss")}>
        <strong>{t(language, "console.reminderTitle")}</strong>
        {t(language, "console.reminderText", {
          home: reminder.match.homeTeamName ?? "—",
          away: reminder.match.awayTeamName ?? "—",
          minutes: reminder.minutes,
        })}
        <div style={{ marginTop: 10 }}>
          <Button component={Link} to={`/admin/live/${reminder.match.id}`} size="small">
            {t(language, "console.reminderOpen")}
          </Button>
        </div>
      </Alert>
    </Notice>
  );
};

export default LiveMatchReminder;

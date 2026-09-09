import { CloudOff, RefreshCw, Trash2, WifiOff } from "lucide-react";
import styled from "styled-components";

import { t, type Language } from "../../i18n";
import type { QueuedEvent } from "../../utils/eventQueue";
import { Banner } from "./consoleUi";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const QueueList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
`;

const QueueRow = styled.li<{ $failed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ $failed }) => ($failed ? "var(--danger)" : "var(--border)")};
  background: var(--bg-surface);
  font-size: 0.85rem;
  color: var(--text-primary);
`;

const RowText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-family: "Sora", sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
  }

  small {
    color: var(--text-secondary);
    font-size: 0.76rem;
    overflow-wrap: anywhere;
  }
`;

const MiniButton = styled.button<{ $tone?: "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: "Sora", sans-serif;
  color: ${({ $tone }) =>
    $tone === "danger" ? "var(--danger)" : "var(--text-primary)"};
`;

interface SyncStatusProps {
  online: boolean;
  queue: QueuedEvent[];
  language: Language;
  onRetry: (clientEventId: string) => void;
  onDiscard: (clientEventId: string) => void;
}

/**
 * Tells the operator, at a glance, whether what they entered is safely on the
 * server. Section 7 of the plan makes this explicit: the operator must never
 * have to guess whether an event was saved.
 */
const SyncStatus = ({
  online,
  queue,
  language,
  onRetry,
  onDiscard,
}: SyncStatusProps) => {
  if (online && queue.length === 0) return null;

  return (
    <Wrap>
      {!online && (
        <Banner $tone="warning">
          <WifiOff size={17} />
          <span>{t(language, "console.offline")}</span>
        </Banner>
      )}

      {queue.length > 0 && (
        <>
          <Banner $tone={online ? "info" : "warning"}>
            <CloudOff size={17} />
            <span>
              {t(language, "console.queueTitle")} · {queue.length}
            </span>
          </Banner>
          <QueueList>
            {queue.map((entry) => {
              const failed = entry.status === "failed";
              return (
                <QueueRow key={entry.clientEventId} $failed={failed}>
                  <RowText>
                    <strong>
                      {t(
                        language,
                        ("event." + entry.payload.type) as never
                      )}{" "}
                      {entry.payload.minute !== null &&
                      entry.payload.minute !== undefined
                        ? `· ${entry.payload.minute}′`
                        : ""}
                    </strong>
                    <small>
                      {failed
                        ? entry.error ?? t(language, "console.failed")
                        : t(language, "console.pending")}
                      {entry.attempts > 0 &&
                        ` · ${t(language, "console.attempts", {
                          count: entry.attempts,
                        })}`}
                    </small>
                  </RowText>
                  {failed && (
                    <>
                      <MiniButton
                        type="button"
                        onClick={() => onRetry(entry.clientEventId)}
                      >
                        <RefreshCw size={14} />
                        {t(language, "console.retry")}
                      </MiniButton>
                      <MiniButton
                        type="button"
                        $tone="danger"
                        onClick={() => onDiscard(entry.clientEventId)}
                      >
                        <Trash2 size={14} />
                      </MiniButton>
                    </>
                  )}
                </QueueRow>
              );
            })}
          </QueueList>
        </>
      )}
    </Wrap>
  );
};

export default SyncStatus;

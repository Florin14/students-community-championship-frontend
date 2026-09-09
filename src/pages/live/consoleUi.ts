import styled, { keyframes } from "styled-components";

/**
 * Styled primitives for the scoring console.
 *
 * Sized for a phone held in one hand on the touchline: every tap target is at
 * least 56px tall, nothing important sits below the fold, and the type is large
 * enough to read at arm's length in daylight.
 */

export const TAP_TARGET = 56;

export const ConsoleShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 24px;
`;

export const ConsoleCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
`;

export const BigButton = styled.button<{
  $tone?: "accent" | "warning" | "danger" | "neutral";
  $wide?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: ${TAP_TARGET}px;
  width: 100%;
  padding: 14px 18px;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  font-family: "Sora", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition:
    transform 0.08s ease,
    filter 0.15s ease;

  background: ${({ $tone }) =>
    $tone === "warning"
      ? "var(--warning)"
      : $tone === "danger"
        ? "var(--danger)"
        : $tone === "neutral"
          ? "var(--bg-surface)"
          : "var(--accent)"};
  color: ${({ $tone }) =>
    $tone === "neutral" ? "var(--text-primary)" : "var(--accent-contrast)"};
  border-color: ${({ $tone }) =>
    $tone === "neutral" ? "var(--border)" : "transparent"};

  &:active:not(:disabled) {
    transform: scale(0.985);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 14px;
`;

/** The scoreboard and clock, pinned above the action buttons. */
export const Scoreboard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--divider);
`;

export const ScoreTeam = styled.div<{ $align: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => ($align === "left" ? "flex-start" : "flex-end")};
  gap: 6px;
  min-width: 0;

  strong {
    font-family: "Sora", sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    text-align: ${({ $align }) => $align};
    overflow-wrap: anywhere;
  }
`;

export const ScoreValue = styled.div`
  font-family: "Sora", sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

export const ClockRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--divider);
  font-family: "Sora", sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
`;

export const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  animation: ${pulse} 1.2s ease-in-out infinite;
  flex: none;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/** Bottom sheet used by the event entry flow. */
export const SheetBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(6, 9, 16, 0.62);
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

export const Sheet = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
`;

export const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--divider);

  h3 {
    font-family: "Sora", sans-serif;
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  small {
    display: block;
    margin-top: 2px;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }
`;

export const SheetBody = styled.div`
  padding: 14px 16px 18px;
  overflow-y: auto;
`;

export const SheetFooter = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--divider);
`;

export const SquadColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

export const SquadColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const SquadLabel = styled.div<{ $color?: string | null }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 2px 4px;
  font-family: "Sora", sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);

  &::before {
    content: "";
    width: 9px;
    height: 9px;
    border-radius: 3px;
    flex: none;
    background: ${({ $color }) => $color || "var(--accent)"};
  }
`;

export const PlayerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 52px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  font-family: "Manrope", sans-serif;
  font-size: 0.92rem;
  font-weight: 600;

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const ShirtNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: "Sora", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

export const MinuteControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  button {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
  }

  input {
    width: 58px;
    height: 36px;
    text-align: center;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: "Sora", sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
`;

export const Banner = styled.div<{ $tone: "info" | "warning" | "danger" }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.87rem;
  line-height: 1.45;

  background: ${({ $tone }) =>
    $tone === "danger"
      ? "var(--danger-soft)"
      : $tone === "warning"
        ? "var(--warning-soft)"
        : "var(--accent-soft)"};
  color: ${({ $tone }) =>
    $tone === "danger"
      ? "var(--danger)"
      : $tone === "warning"
        ? "var(--warning)"
        : "var(--accent)"};

  svg {
    flex: none;
    margin-top: 1px;
  }
`;

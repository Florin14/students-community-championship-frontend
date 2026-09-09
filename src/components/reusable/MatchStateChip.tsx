import styled, { keyframes } from "styled-components";

import { Language, t } from "../../i18n";
import type { MatchState } from "../../types";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

const Chip = styled.span<{ $state: MatchState }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: "Sora", sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ $state }) =>
    $state === "LIVE"
      ? "var(--danger-soft)"
      : $state === "FINISHED"
        ? "var(--bg-surface)"
        : $state === "POSTPONED"
          ? "var(--warning-soft)"
          : "var(--accent-soft)"};
  color: ${({ $state }) =>
    $state === "LIVE"
      ? "var(--danger)"
      : $state === "FINISHED"
        ? "var(--text-secondary)"
        : $state === "POSTPONED"
          ? "var(--warning)"
          : "var(--accent)"};
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--danger);
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

interface MatchStateChipProps {
  state: MatchState;
  language: Language;
}

const MatchStateChip = ({ state, language }: MatchStateChipProps) => (
  <Chip $state={state}>
    {state === "LIVE" && <Dot />}
    {t(language, `matchState.${state}` as never)}
  </Chip>
);

export default MatchStateChip;

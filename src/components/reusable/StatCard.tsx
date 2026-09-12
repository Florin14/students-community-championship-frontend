import { LucideIcon } from "lucide-react";
import styled from "styled-components";

const Card = styled.div<{ $tone: string }>`
  position: relative;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-card);

  &::after {
    content: "";
    position: absolute;
    top: -30px;
    right: -30px;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: ${({ $tone }) => $tone};
    opacity: 0.6;
    filter: blur(6px);
  }
`;

const IconWrap = styled.div<{ $color: string }>`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  color: ${({ $color }) => $color};
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-family: var(--font-heading);
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
`;

const Label = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const Hint = styled.div`
  font-size: 0.78rem;
  color: var(--text-disabled);
`;

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string;
  tone?: "accent" | "violet" | "warning" | "danger";
}

const tones: Record<string, { glow: string; color: string }> = {
  accent: { glow: "var(--accent-soft)", color: "var(--accent)" },
  violet: { glow: "var(--violet-soft)", color: "var(--violet)" },
  warning: { glow: "var(--warning-soft)", color: "var(--warning)" },
  danger: { glow: "var(--danger-soft)", color: "var(--danger)" },
};

const StatCard = ({
  icon: Icon,
  value,
  label,
  hint,
  tone = "accent",
}: StatCardProps) => {
  const palette = tones[tone] ?? tones.accent;
  return (
    <Card $tone={palette.glow}>
      <IconWrap $color={palette.color}>
        <Icon size={20} strokeWidth={2} />
      </IconWrap>
      <Value>{value}</Value>
      <Label>{label}</Label>
      {hint && <Hint>{hint}</Hint>}
    </Card>
  );
};

export default StatCard;

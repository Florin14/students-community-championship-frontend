import styled from "styled-components";

import { imageSrc } from "../../utils/images";

const Badge = styled.div<{ $size: number; $ring?: string | null }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  min-width: ${({ $size }) => $size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-surface);
  border: 2px solid ${({ $ring }) => $ring || "var(--border-strong)"};
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: ${({ $size }) => Math.max(10, Math.round($size * 0.32))}px;
  letter-spacing: 0.02em;
  user-select: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

interface TeamBadgeProps {
  name?: string | null;
  shortName?: string | null;
  logo?: string | null;
  color?: string | null;
  size?: number;
}

const initialsOf = (name?: string | null, shortName?: string | null) => {
  if (shortName) return shortName.slice(0, 3).toUpperCase();
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const TeamBadge = ({
  name,
  shortName,
  logo,
  color,
  size = 44,
}: TeamBadgeProps) => {
  const src = imageSrc(logo);
  return (
    <Badge $size={size} $ring={color} title={name ?? undefined}>
      {src ? <img src={src} alt={name ?? ""} /> : initialsOf(name, shortName)}
    </Badge>
  );
};

export default TeamBadge;

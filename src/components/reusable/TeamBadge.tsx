import { useState } from "react";
import styled from "styled-components";

import { imageSrc } from "../../utils/images";

const Badge = styled.span<{ $size: number; $ring?: string | null }>`
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
    object-fit: contain;
  }
`;

interface TeamBadgeProps {
  name?: string | null;
  shortName?: string | null;
  logo?: string | null;
  color?: string | null;
  size?: number;
  decorative?: boolean;
}

const initialsOf = (name?: string | null, shortName?: string | null) => {
  if (shortName) return shortName.slice(0, 3).toUpperCase();
  if (!name) return "?";
  return name.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";
};

const TeamBadge = ({
  name,
  shortName,
  logo,
  color,
  size = 44,
  decorative = false,
}: TeamBadgeProps) => {
  const src = imageSrc(logo);
  const [failedSrc, setFailedSrc] = useState("");
  return (
    <Badge $size={size} $ring={color} title={name ?? undefined} aria-hidden={decorative || undefined}>
      {src && src !== failedSrc ? <img src={src} alt={decorative ? "" : name ?? ""} onError={() => setFailedSrc(src)} /> : initialsOf(name, shortName)}
    </Badge>
  );
};

export default TeamBadge;

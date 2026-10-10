import { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Bar = styled.nav`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;

  @media (max-width: 720px) {
    flex-wrap: wrap;
    overflow-x: visible;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  font-family: var(--font-heading);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--text-secondary);
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: var(--text-primary);
  }

  &.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  @media (max-width: 720px) {
    padding: 10px 12px;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }
`;

const LiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
`;

export interface NavTab {
  to: string;
  label: string;
  icon?: LucideIcon;
  /** Only match the exact path (for the index route). */
  end?: boolean;
  /** Pulsing red dot: something is happening behind this tab right now. */
  live?: boolean;
}

interface NavTabsProps {
  tabs: NavTab[];
  ariaLabel?: string;
}

/**
 * Shared section navigation for the public and staff areas.
 */
const NavTabs = ({ tabs, ariaLabel = "sections" }: NavTabsProps) => (
  <Bar aria-label={ariaLabel}>
    {tabs.map(({ to, label, icon: Icon, end, live }) => (
      <Tab key={to} to={to} end={end}>
        {Icon && <Icon size={14} />}
        {label}
        {live && <LiveDot />}
      </Tab>
    ))}
  </Bar>
);

export default NavTabs;

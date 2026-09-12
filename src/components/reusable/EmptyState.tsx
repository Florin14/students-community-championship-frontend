import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary);

  svg {
    color: var(--text-disabled);
  }
`;

const Title = styled.div`
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
`;

const Subtitle = styled.div`
  font-size: 0.85rem;
  max-width: 380px;
`;

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, subtitle, action }: EmptyStateProps) => (
  <Wrapper>
    <Icon size={36} strokeWidth={1.6} />
    <Title>{title}</Title>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
    {action}
  </Wrapper>
);

export default EmptyState;

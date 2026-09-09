import { ReactNode } from "react";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const TitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "";
    width: 5px;
    height: 22px;
    border-radius: 4px;
    background: linear-gradient(180deg, var(--accent), var(--violet));
  }
`;

const Subtitle = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding-left: 15px;
`;

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const SectionHeading = ({ title, subtitle, action }: SectionHeadingProps) => (
  <Row>
    <TitleWrap>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </TitleWrap>
    {action}
  </Row>
);

export default SectionHeading;

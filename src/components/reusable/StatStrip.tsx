import styled from "styled-components";

const Strip = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  padding: 20px 8px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(3, 1fr);
    row-gap: 18px;
  }

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;

  @media (max-width: 520px) {
    &:nth-child(odd):last-child {
      grid-column: span 2;
    }
  }
`;

const Value = styled.div`
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
`;

const Label = styled.div`
  font-family: var(--font-heading);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export interface StatStripItem {
  value: string | number;
  label: string;
}

interface StatStripProps {
  items: StatStripItem[];
}

// The headline numbers in one flat row: no cards, no icons, just the figures.
const StatStrip = ({ items }: StatStripProps) => (
  <Strip>
    {items.map((item) => (
      <Item key={item.label}>
        <Value>{item.value}</Value>
        <Label>{item.label}</Label>
      </Item>
    ))}
  </Strip>
);

export default StatStrip;

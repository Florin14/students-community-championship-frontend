import styled from "styled-components";

export const AdminCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-bottom: 1px solid var(--divider);
`;

export const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const TableWrap = styled.div`
  overflow-x: auto;
`;

export const AdminTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;

  th {
    text-align: left;
    padding: 12px 16px;
    font-family: var(--font-heading);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--divider);
    white-space: nowrap;
  }

  td {
    padding: 12px 16px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--divider);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: var(--bg-surface);
  }
`;

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
`;

export const IconAction = styled.button<{ $tone?: "danger" | "accent" }>`
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $tone }) =>
      $tone === "danger"
        ? "var(--danger-soft)"
        : $tone === "accent"
          ? "var(--accent-soft)"
          : "var(--bg-surface-hover)"};
    color: ${({ $tone }) =>
      $tone === "danger"
        ? "var(--danger)"
        : $tone === "accent"
          ? "var(--accent)"
          : "var(--text-primary)"};
  }
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;

import styled from "styled-components";

const Row = styled.div`
  display: inline-flex;
  gap: 4px;
`;

const Pill = styled.span<{ $result: string }>`
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  font-family: "Sora", sans-serif;
  color: ${({ $result }) =>
    $result === "D" ? "var(--text-primary)" : "#0B0F1A"};
  background: ${({ $result }) =>
    $result === "W"
      ? "var(--accent)"
      : $result === "L"
        ? "var(--danger)"
        : "var(--bg-surface-hover)"};
`;

interface FormPillsProps {
  form: string;
}

const FormPills = ({ form }: FormPillsProps) => {
  if (!form) return <span style={{ color: "var(--text-disabled)" }}>—</span>;
  return (
    <Row>
      {form.split("").map((result, index) => (
        <Pill key={`${result}-${index}`} $result={result}>
          {result}
        </Pill>
      ))}
    </Row>
  );
};

export default FormPills;

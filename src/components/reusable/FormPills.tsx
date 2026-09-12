import styled from "styled-components";

const Row = styled.div`
  display: inline-flex;
  gap: 4px;
`;

// W / D / L as small tinted squares: readable at a glance, no colour alone
// carries the meaning since the letter is always printed.
const Pill = styled.span<{ $result: string }>`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  font-family: var(--font-heading);
  color: ${({ $result }) =>
    $result === "W"
      ? "var(--success)"
      : $result === "L"
        ? "var(--danger)"
        : "var(--warning)"};
  background: ${({ $result }) =>
    $result === "W"
      ? "var(--success-soft)"
      : $result === "L"
        ? "var(--danger-soft)"
        : "var(--warning-soft)"};
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

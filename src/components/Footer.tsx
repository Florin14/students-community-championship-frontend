import { Trophy } from "lucide-react";
import styled from "styled-components";

import { t } from "../i18n";
import { useAppSelector } from "../store/hooks";

const Wrapper = styled.footer`
  margin-top: 56px;
  border-top: 1px solid var(--divider);
  padding: 28px 24px 36px;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 0.82rem;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Sora", sans-serif;
  font-weight: 700;
  color: var(--text-primary);

  svg {
    color: var(--accent);
  }
`;

const Footer = () => {
  const language = useAppSelector((state) => state.i18n.language);

  return (
    <Wrapper>
      <Inner>
        <Brand>
          <Trophy size={18} />
          {t(language, "app.name")}
        </Brand>
        <span>{t(language, "footer.tagline")}</span>
      </Inner>
    </Wrapper>
  );
};

export default Footer;

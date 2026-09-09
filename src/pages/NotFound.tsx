import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { t } from "../i18n";
import { useAppSelector } from "../store/hooks";

const Wrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 55vh;
  text-align: center;
`;

const Code = styled.div`
  font-family: "Sora", sans-serif;
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(90deg, var(--accent), var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Message = styled.p`
  color: var(--text-secondary);
  max-width: 380px;
`;

const NotFound = () => {
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.i18n.language);

  return (
    <Wrapper
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SearchX size={40} color="var(--text-disabled)" />
      <Code>404</Code>
      <Message>{t(language, "notFound.message")}</Message>
      <Button
        variant="contained"
        startIcon={<Home size={16} />}
        onClick={() => navigate("/")}
      >
        {t(language, "notFound.backHome")}
      </Button>
    </Wrapper>
  );
};

export default NotFound;

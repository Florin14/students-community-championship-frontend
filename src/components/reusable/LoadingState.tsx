import { CircularProgress } from "@mui/material";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
`;

const LoadingState = () => (
  <Wrapper>
    <CircularProgress size={32} sx={{ color: "var(--accent)" }} />
  </Wrapper>
);

export default LoadingState;

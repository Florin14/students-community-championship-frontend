import { Alert, Button, IconButton, InputAdornment } from "@mui/material";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import StyledTextField from "../../components/reusable/StyledTextField";
import { t } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearAuthError } from "../../store/slices/authSlice";
import { loginThunk } from "../../store/slices/thunks/authThunks";
import { covers } from "../../utils/roles";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const Card = styled(motion.form)`
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 36px 32px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const IconBadge = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  color: var(--accent-contrast);
  margin-bottom: 4px;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const AdminLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const language = useAppSelector((state) => state.i18n.language);
  const { isAuthenticated, user, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: { pathname: string; search?: string; hash?: string; state?: unknown } } | null)?.from;
  const home = covers(user?.role, "ADMIN") ? "/admin" : covers(user?.role, "OPERATOR") ? "/admin/live" : "/";
  const canReturn = from?.pathname.startsWith("/") && !from.pathname.startsWith("//") && from.pathname !== "/admin/login";
  const destination = from && canReturn ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}` : home;

  useEffect(() => {
    if (isAuthenticated) navigate(destination, { replace: true, state: from?.state });
  }, [isAuthenticated, navigate, destination, from?.state]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch(loginThunk({ email, password }));
  };

  return (
    <Wrapper>
      <Card
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <IconBadge>
          <ShieldCheck size={26} />
        </IconBadge>
        <Title>{t(language, "adminLogin.title")}</Title>
        <Subtitle>{t(language, "adminLogin.subtitle")}</Subtitle>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {t(language, "adminLogin.error")}
          </Alert>
        )}

        <StyledTextField
          label={t(language, "adminLogin.email")}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={16} color="var(--text-secondary)" />
              </InputAdornment>
            ),
          }}
        />
        <StyledTextField
          label={t(language, "adminLogin.password")}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={16} color="var(--text-secondary)" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((value) => !value)}
                  edge="end"
                  sx={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading
            ? t(language, "adminLogin.loading")
            : t(language, "adminLogin.submit")}
        </Button>
      </Card>
    </Wrapper>
  );
};

export default AdminLogin;

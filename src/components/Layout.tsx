import { IconButton, Menu, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import { BarChart3, ClipboardCheck, LogOut, Moon, Radio, Shield, Sun, Trophy } from "lucide-react";
import { MouseEvent, useMemo, useState } from "react";
import { NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { t } from "../i18n";
import { formatShortDateDot, parseApiDate } from "../utils/dateFormat";
import { covers } from "../utils/roles";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { setLanguage } from "../store/slices/i18nSlice";
import { toggleTheme } from "../store/slices/themeSlice";
import DashboardBand from "./DashboardBand";
import Footer from "./Footer";
import GlobalSnackbar from "./GlobalSnackbar";
import LiveMatchReminder from "./LiveMatchReminder";
import NavTabs, { type NavTab } from "./NavTabs";

const Header = styled(motion.header)`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-nav);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--divider);
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    padding: 10px 16px;
  }
`;

const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const BrandMark = styled.div`
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--accent-contrast);
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
`;

// "Round 15 · 15.09": where the competition is right now, always in view.
const RoundChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface);
  font-family: var(--font-heading);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;

  @media (max-width: 720px) {
    display: none;
  }
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;

  strong {
    font-family: var(--font-heading);
    font-size: 0.98rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-family: var(--font-heading);
    font-size: 0.64rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const LangToggle = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  font-family: var(--font-heading);
  letter-spacing: 0.06em;
  background: ${({ $active }) =>
    $active ? "var(--accent)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--accent-contrast)" : "var(--text-secondary)"};
  transition: all 0.15s ease;
`;

const LangWrap = styled.div`
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 3px;
`;

const RoundIconButton = styled(IconButton)`
  && {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    width: 38px;
    height: 38px;

    &:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 0;
  min-height: calc(100vh - 260px);

  @media (max-width: 640px) {
    padding: 18px 16px 0;
  }
`;

const Page = styled(motion.div)``;

const StaffNav = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  border-bottom: 1px solid var(--divider);
  @media (max-width: 640px) { padding: 0 16px; }
`;

// The tab bar belongs to the public area; the secured area has its own frame.
const isPublicPath = (pathname: string) =>
  !pathname.startsWith("/admin") && pathname !== "/not-found";

// The five section roots show the season headline; detail pages start lower.
const SECTION_ROOTS = ["/", "/matches", "/live", "/players", "/teams", "/stats"];

const Layout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const language = useAppSelector((state) => state.i18n.language);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const activeSeason = useAppSelector((state) => state.seasons.activeSeason);
  const matches = useAppSelector((state) => state.matches.matches);

  // The round in play: the next scheduled match, or the last one finished.
  const currentRound = useMemo(() => {
    const now = Date.now();
    const scheduled = matches
      .filter(
        (m) =>
          m.round != null &&
          m.state !== "FINISHED" &&
          parseApiDate(m.timestamp).getTime() >= now - 3600000
      )
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const finished = matches
      .filter((m) => m.round != null && m.state === "FINISHED")
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const match = scheduled[0] ?? finished[0];
    if (!match) return null;
    return {
      round: match.round as number,
      date: formatShortDateDot(parseApiDate(match.timestamp)),
    };
  }, [matches]);

  const [adminAnchor, setAdminAnchor] = useState<null | HTMLElement>(null);

  const canAdminister = covers(user?.role, "ADMIN");
  const canOperate = isAuthenticated && covers(user?.role, "OPERATOR");
  const staffTabs: NavTab[] = [
    { to: "/admin/live", label: t(language, "nav.console"), icon: Radio },
    { to: "/admin/attendance", label: t(language, "attendance.title"), icon: ClipboardCheck, end: true },
    { to: "/admin/attendance/stats", label: t(language, "attendance.stats"), icon: BarChart3 },
    ...(canAdminister ? [{ to: "/admin", label: t(language, "nav.adminPanel"), icon: Shield, end: true }] : []),
    { to: "/", label: t(language, "nav.championship"), icon: Trophy, end: true },
  ];

  const handleAdminClick = (event: MouseEvent<HTMLElement>) => {
    if (isAuthenticated) {
      setAdminAnchor(event.currentTarget);
    } else {
      navigate("/admin/login");
    }
  };

  const handleLogout = () => {
    setAdminAnchor(null);
    dispatch(logout());
    navigate("/");
  };

  const publicArea = isPublicPath(location.pathname);
  const sectionRoot = SECTION_ROOTS.includes(location.pathname);

  return (
    <>
      <Header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <HeaderInner>
          <Brand to="/">
            <BrandMark>{t(language, "app.shortName")}</BrandMark>
            <BrandText>
              <strong>{t(language, "app.brand")}</strong>
              <span>
                {activeSeason
                  ? `${t(language, "app.seasonLabel")} ${activeSeason.name}`
                  : t(language, "app.tagline")}
              </span>
            </BrandText>
          </Brand>

          <Actions>
            {currentRound && (
              <RoundChip>
                {t(language, "home.roundShort")} {currentRound.round}
                <span>·</span>
                {currentRound.date}
              </RoundChip>
            )}
            <LangWrap>
              {(["ro", "en"] as const).map((lang) => (
                <LangToggle
                  key={lang}
                  $active={language === lang}
                  onClick={() => dispatch(setLanguage(lang))}
                >
                  {lang.toUpperCase()}
                </LangToggle>
              ))}
            </LangWrap>
            <RoundIconButton
              onClick={() => dispatch(toggleTheme())}
              title={
                themeMode === "dark"
                  ? t(language, "nav.lightMode")
                  : t(language, "nav.darkMode")
              }
            >
              {themeMode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </RoundIconButton>
            <RoundIconButton
              onClick={handleAdminClick}
              sx={
                isAuthenticated
                  ? { color: "var(--accent) !important" }
                  : undefined
              }
              title={t(language, "nav.admin")}
            >
              <Shield size={17} />
            </RoundIconButton>
          </Actions>
        </HeaderInner>
      </Header>

      <Menu
        anchorEl={adminAnchor}
        open={Boolean(adminAnchor)}
        onClose={() => setAdminAnchor(null)}
      >
        <MenuItem disabled sx={{ fontSize: "0.8rem", opacity: 0.8 }}>
          {user?.name}
        </MenuItem>
        {covers(user?.role, "OPERATOR") && <MenuItem
          onClick={() => {
            setAdminAnchor(null);
            navigate("/admin/live");
          }}
        >
          <Radio size={15} style={{ marginRight: 8 }} />
          {t(language, "nav.console")}
        </MenuItem>}
        {canOperate && <MenuItem
          onClick={() => {
            setAdminAnchor(null);
            navigate("/admin/attendance");
          }}
        >
          {t(language, "attendance.title")}
        </MenuItem>}
        {canAdminister && (
          <MenuItem
            onClick={() => {
              setAdminAnchor(null);
              navigate("/admin");
            }}
          >
            <Shield size={15} style={{ marginRight: 8 }} />
            {t(language, "nav.adminPanel")}
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <LogOut size={15} style={{ marginRight: 8 }} />
          {t(language, "nav.logout")}
        </MenuItem>
      </Menu>

      {publicArea && <DashboardBand showStats={sectionRoot} />}
      {!publicArea && canOperate && location.pathname !== "/admin/login" && (
        <StaffNav><NavTabs tabs={staffTabs} ariaLabel={t(language, "nav.staffNavigation")} /></StaffNav>
      )}

      <Main>
        {isAuthenticated && user && covers(user.role, "OPERATOR") && (
          <LiveMatchReminder key={user.id} userId={user.id} />
        )}
        <Page
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Outlet />
        </Page>
      </Main>
      <Footer />
      <GlobalSnackbar />
      <ScrollRestoration />
    </>
  );
};

export default Layout;

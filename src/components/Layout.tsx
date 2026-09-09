import { Drawer, IconButton, Menu, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Home,
  ListOrdered,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Shield,
  Sun,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { MouseEvent, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { TranslationKey, t } from "../i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { setLanguage } from "../store/slices/i18nSlice";
import { toggleTheme } from "../store/slices/themeSlice";
import Footer from "./Footer";
import GlobalSnackbar from "./GlobalSnackbar";

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
  gap: 16px;
`;

const Brand = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandMark = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  color: #0b0f1a;
  box-shadow: var(--shadow-card);
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;

  strong {
    font-family: "Sora", sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }

  span {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px;

  @media (max-width: 980px) {
    display: none;
  }
`;

const NavPill = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-surface-hover);
  }

  &.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LangToggle = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  font-family: "Sora", sans-serif;
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

const MobileOnly = styled.div`
  display: none;

  @media (max-width: 980px) {
    display: flex;
  }
`;

const DesktopOnly = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 980px) {
    display: none;
  }
`;

const Main = styled(motion.main)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 0;
  min-height: calc(100vh - 260px);

  @media (max-width: 640px) {
    padding: 20px 16px 0;
  }
`;

const DrawerBody = styled.div`
  width: 280px;
  height: 100%;
  background: var(--bg-paper-solid);
  display: flex;
  flex-direction: column;
  padding: 18px;
  gap: 6px;
`;

const DrawerHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const DrawerLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-secondary);

  &.active {
    background: var(--accent-soft);
    color: var(--accent);
  }
`;

const DrawerFooter = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--divider);
`;

interface NavItem {
  key: TranslationKey;
  to: string;
  icon: typeof Home;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "nav.home", to: "/", icon: Home, end: true },
  { key: "nav.matches", to: "/matches", icon: CalendarDays },
  { key: "nav.standings", to: "/standings", icon: ListOrdered },
  { key: "nav.teams", to: "/teams", icon: Users },
  { key: "nav.players", to: "/players", icon: User },
  { key: "nav.stats", to: "/stats", icon: BarChart3 },
];

const Layout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const language = useAppSelector((state) => state.i18n.language);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminAnchor, setAdminAnchor] = useState<null | HTMLElement>(null);

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

  return (
    <>
      <Header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <HeaderInner>
          <Brand to="/">
            <BrandMark>
              <Trophy size={20} strokeWidth={2.4} />
            </BrandMark>
            <BrandText>
              <strong>{t(language, "app.shortName")}</strong>
              <span>{t(language, "app.tagline")}</span>
            </BrandText>
          </Brand>

          <Nav>
            {NAV_ITEMS.map(({ key, to, icon: Icon, end }) => (
              <NavPill key={to} to={to} end={end}>
                <Icon size={15} />
                {t(language, key)}
              </NavPill>
            ))}
          </Nav>

          <Actions>
            <DesktopOnly>
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
              <RoundIconButton onClick={() => dispatch(toggleTheme())}>
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
            </DesktopOnly>
            <MobileOnly>
              <RoundIconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon size={18} />
              </RoundIconButton>
            </MobileOnly>
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
        <MenuItem
          onClick={() => {
            setAdminAnchor(null);
            navigate("/admin");
          }}
        >
          <Shield size={15} style={{ marginRight: 8 }} />
          {t(language, "nav.adminPanel")}
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogOut size={15} style={{ marginRight: 8 }} />
          {t(language, "nav.logout")}
        </MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { background: "transparent" } }}
      >
        <DrawerBody>
          <DrawerHead>
            <BrandText>
              <strong>{t(language, "app.shortName")}</strong>
              <span>{t(language, "app.tagline")}</span>
            </BrandText>
            <RoundIconButton onClick={() => setDrawerOpen(false)}>
              <X size={17} />
            </RoundIconButton>
          </DrawerHead>
          {NAV_ITEMS.map(({ key, to, icon: Icon, end }) => (
            <DrawerLink
              key={to}
              to={to}
              end={end}
              onClick={() => setDrawerOpen(false)}
            >
              <Icon size={17} />
              {t(language, key)}
            </DrawerLink>
          ))}
          <DrawerLink
            to={isAuthenticated ? "/admin" : "/admin/login"}
            onClick={() => setDrawerOpen(false)}
          >
            <Shield size={17} />
            {t(language, "nav.admin")}
          </DrawerLink>
          {isAuthenticated && (
            <DrawerLink
              to="/"
              onClick={() => {
                setDrawerOpen(false);
                dispatch(logout());
              }}
            >
              <LogOut size={17} />
              {t(language, "nav.logout")}
            </DrawerLink>
          )}
          <DrawerFooter>
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
            <RoundIconButton onClick={() => dispatch(toggleTheme())}>
              {themeMode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </RoundIconButton>
          </DrawerFooter>
        </DrawerBody>
      </Drawer>

      <Main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <Outlet />
      </Main>
      <Footer />
      <GlobalSnackbar />
    </>
  );
};

export default Layout;

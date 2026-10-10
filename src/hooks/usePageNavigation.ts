import { useLocation } from "react-router-dom";

import { t, type TranslationKey } from "../i18n";
import { useAppSelector } from "../store/hooks";

const pageLabel = (pathname: string): TranslationKey | undefined => {
  if (pathname === "/") return "nav.standings";
  if (pathname === "/live") return "nav.live";
  if (pathname === "/matches") return "nav.matches";
  if (/^\/matches\/\d+$/.test(pathname)) return "nav.matchDetails";
  if (pathname === "/players") return "nav.players";
  if (/^\/players\/\d+$/.test(pathname)) return "nav.playerDetails";
  if (pathname === "/teams") return "nav.teams";
  if (/^\/teams\/\d+$/.test(pathname)) return "nav.teamDetails";
  if (pathname === "/stats") return "nav.stats";
  if (pathname === "/admin") return "nav.adminPanel";
  if (/^\/admin\/live(?:\/\d+)?$/.test(pathname)) return "nav.console";
  if (pathname === "/admin/attendance") return "attendance.title";
  if (pathname === "/admin/attendance/stats") return "attendance.stats";
  return undefined;
};

interface ReturnPage {
  pathname: string;
  search?: string;
  hash?: string;
  state?: unknown;
}

/** Keep a detail page's return link tied to the page that opened it. */
export const usePageNavigation = (fallbackTo = "/", fallbackLabel: TranslationKey = "nav.backToChampionship") => {
  const location = useLocation();
  const language = useAppSelector((state) => state.i18n.language);
  const origin = (location.state as { returnTo?: ReturnPage } | null)?.returnTo;
  const originLabel = origin && typeof origin.pathname === "string" && origin.pathname !== location.pathname
    ? pageLabel(origin.pathname)
    : undefined;

  return {
    linkState: {
      returnTo: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        state: location.state,
      },
    },
    backLinkProps: origin && originLabel
      ? { to: { pathname: origin.pathname, search: origin.search ?? "", hash: origin.hash ?? "" }, state: origin.state }
      : { to: fallbackTo },
    backLabel: originLabel
      ? t(language, "nav.backToPage", { page: t(language, originLabel) })
      : t(language, fallbackLabel),
  };
};

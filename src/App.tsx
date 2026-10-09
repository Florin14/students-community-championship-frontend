import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useMemo } from "react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Layout from "./components/Layout";
import RequireRole from "./components/RequireRole";
import LoadingState from "./components/reusable/LoadingState";
import Admin from "./pages/admin/Admin";
import AdminLogin from "./pages/admin/AdminLogin";
import Attendance from "./pages/attendance/Attendance";
import AttendanceStats from "./pages/attendance/AttendanceStats";
import OperatorMatches from "./pages/live/OperatorMatches";
import ScoringConsole from "./pages/live/ScoringConsole";
import LiveScores from "./pages/LiveScores";
import MatchDetails from "./pages/MatchDetails";
import Matches from "./pages/Matches";
import NotFound from "./pages/NotFound";
import PlayerDetails from "./pages/PlayerDetails";
import Players from "./pages/Players";
import Standings from "./pages/Standings";
import Stats from "./pages/Stats";
import TeamDetails from "./pages/TeamDetails";
import Teams from "./pages/Teams";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  fetchActiveSeason,
  fetchSeasons,
} from "./store/slices/thunks/seasonsThunks";
import { createAppTheme } from "./theme";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Standings /> },
      { path: "live", element: <LiveScores /> },
      { path: "matches", element: <Matches /> },
      { path: "matches/:id", element: <MatchDetails /> },
      { path: "standings", element: <Navigate to="/" replace /> },
      { path: "teams", element: <Teams /> },
      { path: "teams/:id", element: <TeamDetails /> },
      { path: "players", element: <Players /> },
      { path: "players/:id", element: <PlayerDetails /> },
      { path: "stats", element: <Stats /> },
      { path: "admin/login", element: <AdminLogin /> },
      {
        path: "admin/attendance",
        element: <RequireRole minRole="OPERATOR" />,
        children: [
          { index: true, element: <Attendance /> },
          { path: "stats", element: <AttendanceStats /> },
        ],
      },
      {
        // Operators can score; admins manage the competition.
        path: "admin/live",
        element: <RequireRole minRole="OPERATOR" />,
        children: [
          { index: true, element: <OperatorMatches /> },
          { path: ":matchId", element: <ScoringConsole /> },
        ],
      },
      {
        path: "admin",
        element: <RequireRole minRole="ADMIN" />,
        children: [{ index: true, element: <Admin /> }],
      },
      { path: "not-found", element: <NotFound /> },
      { path: "*", element: <Navigate to="/not-found" replace /> },
    ],
  },
]);

const App = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const seasonsReady = useAppSelector((state) => state.seasons.ready);
  const muiTheme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  useEffect(() => {
    dispatch(fetchSeasons());
    dispatch(fetchActiveSeason());
  }, [dispatch]);

  return (
    <ThemeProvider theme={muiTheme}>
      {seasonsReady ? <RouterProvider router={router} /> : <LoadingState />}
    </ThemeProvider>
  );
};

export default App;

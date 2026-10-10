import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "../store/hooks";
import type { PlatformRole } from "../types";
import { covers } from "../utils/roles";

interface RequireRoleProps {
  /** The lowest role allowed through. Defaults to any signed-in account. */
  minRole?: PlatformRole;
}

/**
 * Route guard. Sends anyone not signed in to the login page, and anyone signed
 * in without enough privilege to the screen they do have - an operator landing
 * on /admin goes to their own match list at /admin/live rather than a dead end.
 */
const RequireRole = ({ minRole = "OPERATOR" }: RequireRoleProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!covers(user.role, minRole)) {
    return <Navigate to={covers(user.role, "OPERATOR") ? "/admin/live" : "/"} replace />;
  }

  return <Outlet />;
};

export default RequireRole;

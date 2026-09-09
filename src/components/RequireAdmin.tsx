import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "../store/hooks";

const RequireAdmin = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;

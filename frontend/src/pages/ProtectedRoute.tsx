import { Navigate, Outlet } from "react-router";
import { AUTH_KEY } from "./LoginPage";

export default function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem(AUTH_KEY) === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

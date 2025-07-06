import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser, hasEditorAccess } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !hasAdminAccess(currentUser)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


import { Navigate } from "react-router-dom";
import { Fragment } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Fragment>{children}</Fragment>;
};

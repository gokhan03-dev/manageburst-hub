
import { Navigate } from "react-router-dom";
import { Fragment } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Remove any extra props from Fragment
  return <Fragment>{children}</Fragment>;
};


import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-sm text-zinc-500">Authenticating…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-sm text-zinc-500">Loading…</div>;
  return <Navigate to={user ? "/admin/products" : "/catalog"} replace />;
}

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedAdminRoute() {
  const sessionData = sessionStorage.getItem('purgatory_ops_session');

  if (!sessionData) {
    // Unauthenticated: Redirect to Operator Security Gate
    return <Navigate to="/ops-portal" replace />;
  }

  try {
    const parsed = JSON.parse(sessionData);
    if (!parsed || !parsed.token) {
      sessionStorage.removeItem('purgatory_ops_session');
      return <Navigate to="/ops-portal" replace />;
    }
  } catch (e) {
    sessionStorage.removeItem('purgatory_ops_session');
    return <Navigate to="/ops-portal" replace />;
  }

  return <Outlet />;
}

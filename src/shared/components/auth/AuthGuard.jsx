import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Simple auth guard — checks localStorage for session.
 * Redirects to /login if not authenticated.
 */
const AuthGuard = ({ children }) => {
  const isAuthenticated = localStorage.getItem('nexo_session');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;

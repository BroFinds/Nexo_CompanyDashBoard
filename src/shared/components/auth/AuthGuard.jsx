import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '@/services/api';

const AuthGuard = ({ children }) => {
  const session = getSession();

  if (!session?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEnabledApps } from '@/shared/context/EnabledAppsContext';

// Sends the user back to the Nexo home page when their company doesn't have this app enabled.
// UI-only: the enabled-apps list comes from the login response stored in the browser, so the
// backend must still enforce access on its own.
const RequireApp = ({ appId, children }) => {
  const { enabledApps } = useEnabledApps();

  if (!enabledApps.includes(appId)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireApp;

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '@/services/api';
import LoadItems from '@/shared/components/init/LoadItems';

// Sends the user back to the Nexo home page when their company doesn't have this app enabled.
// The answer comes from the backend (GET /auth/apps/{appId}/access), not from the enabled-apps
// list stored in the browser, so editing that list can't open an app. Any error also redirects.
const RequireApp = ({ appId, children }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    let cancelled = false;
    setStatus('checking');
    api
      .get(`/auth/apps/${encodeURIComponent(appId)}/access`)
      .then(({ data }) => {
        if (!cancelled) setStatus(data?.enabled === true ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (!cancelled) setStatus('denied');
      });
    return () => {
      cancelled = true;
    };
  }, [appId]);

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return <LoadItems ready={status === 'allowed'}>{children}</LoadItems>;
};

export default RequireApp;

import React, { createContext, useContext, useEffect, useState } from "react";

const EnabledAppsContext = createContext({
  enabledApps: [],
  setEnabledApps: () => {},
});

export const EnabledAppsProvider = ({ children }) => {
  const [enabledApps, setEnabledApps] = useState([]);

  useEffect(() => {
    const handleLogout = () => setEnabledApps([]);
    window.addEventListener("nexo_logout", handleLogout);
    return () => window.removeEventListener("nexo_logout", handleLogout);
  }, []);

  return (
    <EnabledAppsContext.Provider value={{ enabledApps, setEnabledApps }}>
      {children}
    </EnabledAppsContext.Provider>
  );
};

export const useEnabledApps = () => useContext(EnabledAppsContext);

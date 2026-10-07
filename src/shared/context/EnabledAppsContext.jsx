import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ENABLED_APPS_KEY = "nexo_enabled_apps";

const readEnabledApps = () => {
  try {
    const rawApps = localStorage.getItem(ENABLED_APPS_KEY);
    const legacySession = JSON.parse(
      localStorage.getItem("nexo_session") || "null",
    );
    const parsedApps = rawApps === null ? null : JSON.parse(rawApps);
    const apps = Array.isArray(parsedApps)
      ? parsedApps
      : Array.isArray(legacySession?.apps)
        ? legacySession.apps
        : [];

    if (!Array.isArray(parsedApps)) {
      localStorage.setItem(ENABLED_APPS_KEY, JSON.stringify(apps));
    }
    if (
      legacySession &&
      typeof legacySession === "object" &&
      Object.prototype.hasOwnProperty.call(legacySession, "apps")
    ) {
      delete legacySession.apps;
      localStorage.setItem("nexo_session", JSON.stringify(legacySession));
    }

    return apps;
  } catch {
    return [];
  }
};

const EnabledAppsContext = createContext({
  enabledApps: [],
  setEnabledApps: () => {},
});

export const EnabledAppsProvider = ({ children }) => {
  const [enabledApps, setEnabledAppsState] = useState(readEnabledApps);

  const setEnabledApps = useCallback((nextApps) => {
    const apps = Array.isArray(nextApps) ? nextApps : [];
    setEnabledAppsState(apps);
    try {
      localStorage.setItem(ENABLED_APPS_KEY, JSON.stringify(apps));
    } catch {
      // Keep the current app session usable if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const handleLogout = () => setEnabledApps([]);
    window.addEventListener("nexo_logout", handleLogout);
    return () => window.removeEventListener("nexo_logout", handleLogout);
  }, [setEnabledApps]);

  return (
    <EnabledAppsContext.Provider value={{ enabledApps, setEnabledApps }}>
      {children}
    </EnabledAppsContext.Provider>
  );
};

export const useEnabledApps = () => useContext(EnabledAppsContext);

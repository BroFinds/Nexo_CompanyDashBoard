import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NexoApp from "./apps/nexo/NexoApp";
import DeliwheelsApp from "./apps/deliwheels/DeliwheelsApp";
import LoginPage from "./apps/nexo/pages/LoginPage";
import AuthGuard from "./shared/components/auth/AuthGuard";
import { GlobalProvider } from "./apps/nexo/context/GlobalContext";
import { DeliwheelsProvider } from "./apps/deliwheels/context/DeliwheelsContext";
import WorkspaceInitGate from "./shared/components/init/WorkspaceInitGate";
import "./index.css";
import NovoApp from "./apps/novo/Novo";
import { EnabledAppsProvider } from "./shared/context/EnabledAppsContext";

// Authenticated shell: providers and the workspace init gate live above the
// nexo/deliwheels route split, so products + vehicles are fetched once in
// parallel. Switching to /deliwheels reuses the already-hydrated state and
// skips any second initialization splash.
const AuthenticatedShell = ({ children }) => (
  <AuthGuard>
    <GlobalProvider>
      <DeliwheelsProvider>
        <WorkspaceInitGate>{children}</WorkspaceInitGate>
      </DeliwheelsProvider>
    </GlobalProvider>
  </AuthGuard>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <EnabledAppsProvider>
        <Routes>
          {/* Login — no auth required */}
          <Route
            path="/login"
            element={
              <div data-app="nexo" style={{ minHeight: "100vh" }}>
                <LoginPage />
              </div>
            }
          />

          {/* Deliwheels — auth required */}
        <Route
          path="/deliwheels/*"
          element={
            <AuthenticatedShell>
              <DeliwheelsApp />
            </AuthenticatedShell>
          }
        />

        {/* Nova — auth required */}
        <Route
          path="/nova/*"
          element={
            <AuthenticatedShell>
              <NovoApp />
            </AuthenticatedShell>
          }
        />

        {/* Nexo (default) — auth required */}
        <Route
          path="/*"
          element={
            <AuthenticatedShell>
              <NexoApp />
            </AuthenticatedShell>
          }
        />
      </Routes>
      </EnabledAppsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

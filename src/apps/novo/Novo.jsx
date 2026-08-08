import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ConfigureBusinessPage from "./pages/ConfigureBusinessPage";
import WidgetPage from "./pages/WidgetPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import SettingsPage from "./pages/SettingsPage";
import "./theme/novo-theme.css";

const NovoApp = () => {
  return (
    <div data-app="novo" style={{ minHeight: "100vh" }}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/ai-configuration" element={<ConfigureBusinessPage />} />
        <Route path="/widget" element={<WidgetPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/nova" replace />} />
      </Routes>
    </div>
  );
};

export default NovoApp;

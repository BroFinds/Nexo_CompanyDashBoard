import React from "react";
import DashboardLayout from "@shared/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Building2,
  MonitorSmartphone,
  Settings,
  Bot,
} from "lucide-react";
import { logout } from "@/services/api";

const novoNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/nova", exact: true },
  { id: "ai-configuration", label: "AI Configuration", icon: Building2, path: "/nova/ai-configuration" },
  { id: "widget", label: "Widget", icon: MonitorSmartphone, path: "/nova/widget" },
  { id: "playground", label: "AI Playground", icon: Bot, path: "/nova/playground" },
  { id: "settings", label: "Settings", icon: Settings, path: "/nova/settings" },
];

const novoBrand = { name: "Novo Agent", letter: "N" };

const NovoLayout = ({ children, headerTitle, headerSubtitle }) => {
  return (
    <DashboardLayout
      navItems={novoNavItems}
      brand={novoBrand}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      backLink={{ label: "Back to Nexo", path: "/" }}
      onLogout={logout}
    >
      {children}
    </DashboardLayout>
  );
};

export default NovoLayout;

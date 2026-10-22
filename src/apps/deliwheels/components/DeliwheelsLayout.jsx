import React from "react";
import DashboardLayout from "@shared/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Truck,
  Route,
  Store,
  Warehouse,
  FileBarChart,
  Wallet,
  CreditCard,
  RotateCcw,
  HandCoins,
  CalendarCheck,
  Settings2,
} from "lucide-react";
import { logout } from "@/services/api";

const dwNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/deliwheels",
    exact: true,
  },
  {
    id: "daily-summary",
    label: "Daily Summary",
    icon: CalendarCheck,
    path: "/deliwheels/daily-summary",
  },
  { id: "stock", label: "Stock", icon: Warehouse, path: "/deliwheels/stock" },
  { id: "sales", label: "Sales", icon: Wallet, path: "/deliwheels/sales" },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart,
    path: "/deliwheels/reports",
  },
  {
    id: "collect-cash",
    label: "Collect Cash",
    icon: HandCoins,
    path: "/deliwheels/collect-cash",
  },
  { id: "credits", label: "Credits", icon: CreditCard, path: "/deliwheels/credits" },
  { id: "returns", label: "Returns", icon: RotateCcw, path: "/deliwheels/returns" },
  // Set up once, rarely changed — grouped so the daily items stay at the top
  {
    id: "setup",
    label: "Setup",
    icon: Settings2,
    children: [
      { id: "vehicles", label: "Vehicles", icon: Truck, path: "/deliwheels/vehicles" },
      { id: "routes", label: "Routes", icon: Route, path: "/deliwheels/routes" },
      { id: "shops", label: "Shops", icon: Store, path: "/deliwheels/shops" },
    ],
  },
];

const dwBrand = { name: "DeliWheels", letter: "D" };

const DeliwheelsLayout = ({ children }) => {
  return (
    <DashboardLayout
      navItems={dwNavItems}
      brand={dwBrand}
      backLink={{ label: "Back to Nexo", path: "/" }}
      onLogout={logout}
    >
      {children}
    </DashboardLayout>
  );
};

export default DeliwheelsLayout;

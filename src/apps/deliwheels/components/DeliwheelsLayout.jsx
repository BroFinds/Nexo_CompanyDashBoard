import React from "react";
import DashboardLayout from "@shared/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Truck,
  Route,
  Warehouse,
  FileBarChart,
  Wallet,
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
  { id: "stock", label: "Stock", icon: Warehouse, path: "/deliwheels/stock" },
  { id: "sales", label: "Sales", icon: Wallet, path: "/deliwheels/sales" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: Truck,
    path: "/deliwheels/vehicles",
  },
  { id: "routes", label: "Routes", icon: Route, path: "/deliwheels/routes" },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart,
    path: "/deliwheels/reports",
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

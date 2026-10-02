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
  { id: "shops", label: "Shops", icon: Store, path: "/deliwheels/shops" },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart,
    path: "/deliwheels/reports",
  },
  { id: "credits", label: "Credits", icon: CreditCard, path: "/deliwheels/credits" },
  { id: "returns", label: "Returns", icon: RotateCcw, path: "/deliwheels/returns" },
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

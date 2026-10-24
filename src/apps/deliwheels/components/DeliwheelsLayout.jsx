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
  ClipboardCheck,
  CalendarCheck,
  Settings2,
  PackagePlus,
  PackageMinus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/api";
import { useTripAttentionCount } from "../context/tripsApi";

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
  {
    id: "stock-group",
    label: "Stock",
    icon: Warehouse,
    children: [
      { id: "stock", label: "Loaded", icon: PackagePlus, path: "/deliwheels/stock" },
      { id: "returns", label: "Returns", icon: RotateCcw, path: "/deliwheels/returns" },
      { id: "unloads", label: "Unloads", icon: PackageMinus, path: "/deliwheels/unloads" },
    ],
  },
  { id: "sales", label: "Sales", icon: Wallet, path: "/deliwheels/sales" },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart,
    path: "/deliwheels/reports",
  },
  { id: "trips", label: "Trips", icon: ClipboardCheck, path: "/deliwheels/trips" },
  { id: "credits", label: "Credits", icon: CreditCard, path: "/deliwheels/credits" },
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
  const navigate = useNavigate();
  const attentionCount = useTripAttentionCount();
  return (
    <DashboardLayout
      navItems={dwNavItems}
      brand={dwBrand}
      backLink={{ label: "Back to Nexo", path: "/" }}
      onLogout={logout}
      notification={{
        count: attentionCount,
        title: "trips to settle and records that need attention",
        onClick: () => navigate("/deliwheels/trips"),
      }}
    >
      {children}
    </DashboardLayout>
  );
};

export default DeliwheelsLayout;

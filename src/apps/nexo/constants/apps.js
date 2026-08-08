import {
  Truck,
  Users,
  Warehouse,
  CreditCard,
  Package,
  Bot,
} from "lucide-react";

// Single source of truth for all Nexo-launchable apps.
// `service` is the ping endpoint name (used by ReportsPage); null = no ping wired yet.
export const ALL_APPS = [
  {
    id: "deliwheels",
    title: "DeliWheels",
    desc: "Logistics & Delivery Operations",
    icon: Truck,
    route: "/deliwheels",
    service: "deliwheels",
  },
  {
    id: "nova",
    title: "Nova",
    desc: "AI Receptionist & Customer Assistant",
    icon: Bot,
    route: "/nova",
    service: "nova",
  },
  {
    id: "employee_management",
    title: "Employee Management",
    desc: "HR & Payroll Systems",
    icon: Users,
    route: "/employees",
    service: null,
  },
  {
    id: "warehouse",
    title: "Warehouse",
    desc: "Inventory & Product Catalog",
    icon: Warehouse,
    route: "/warehouse",
    service: null,
  },
  {
    id: "pos",
    title: "POS Billing",
    desc: "Retail Point of Sale",
    icon: CreditCard,
    route: "/pos",
    service: null,
  },
  {
    id: "order_management",
    title: "Order Management",
    desc: "Sales & Order Processing",
    icon: Package,
    route: "/orders",
    service: null,
  },
];

export const APP_BY_ID = Object.fromEntries(ALL_APPS.map((a) => [a.id, a]));

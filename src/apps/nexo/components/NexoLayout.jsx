import React from 'react';
import DashboardLayout from '@shared/components/layout/DashboardLayout';
import { LayoutDashboard, Users, Package, FileBarChart } from 'lucide-react';
import { logout } from '@/services/api';

const nexoNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', exact: true },
  { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
  { id: 'products', label: 'Products', icon: Package, path: '/products' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, path: '/reports' },
];

const nexoBrand = { name: 'Nexo', letter: 'N' };

const NexoLayout = ({ children, headerTitle, headerSubtitle }) => {
  return (
    <DashboardLayout
      navItems={nexoNavItems}
      brand={nexoBrand}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      onLogout={logout}
    >
      {children}
    </DashboardLayout>
  );
};

export default NexoLayout;

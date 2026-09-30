import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import RoutesPage from './pages/RoutesPage';
import ShopsPage from './pages/ShopsPage';
import StockPage from './pages/StockPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import CreditPage from './pages/CreditPage';
import ReturnsPage from './pages/ReturnsPage';

const DeliwheelsApp = () => {
  return (
    <div data-app="deliwheels" style={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/shops" element={<ShopsPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/credits" element={<CreditPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="*" element={<Navigate to="/deliwheels" replace />} />
      </Routes>
    </div>
  );
};

export default DeliwheelsApp;

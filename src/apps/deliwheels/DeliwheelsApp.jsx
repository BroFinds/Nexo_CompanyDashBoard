import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DeliwheelsProvider } from './context/DeliwheelsContext';
import { GlobalProvider } from '../nexo/context/GlobalContext';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import RoutesPage from './pages/RoutesPage';
import StockPage from './pages/StockPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';

const DeliwheelsApp = () => {
  return (
    <GlobalProvider>
      <DeliwheelsProvider>
        <div data-app="deliwheels" style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/deliwheels" replace />} />
          </Routes>
        </div>
      </DeliwheelsProvider>
    </GlobalProvider>
  );
};

export default DeliwheelsApp;

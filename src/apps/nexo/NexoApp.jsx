import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';

const NexoApp = () => {
  return (
    <GlobalProvider>
      <div data-app="nexo" style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GlobalProvider>
  );
};

export default NexoApp;

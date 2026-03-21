import React, { useState } from 'react';
import LoginPage from '@pages/LoginPage';
import DashboardPage from '@pages/DashboardPage';
import EmployeesPage from '@pages/EmployeesPage';
import ProductsPage from '@pages/ProductsPage';
import ReportsPage from '@pages/ReportsPage';

import { GlobalProvider } from './context/GlobalContext';

function App() {
  const [currentView, setCurrentView] = useState('login');

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
  };

  return (
    <GlobalProvider>
      <div>
        {currentView === 'login' && <LoginPage onLogin={handleLogin} />}
        {currentView === 'dashboard' && <DashboardPage currentView={currentView} onNavigate={handleNavigate} />}
        {currentView === 'employees' && <EmployeesPage currentView={currentView} onNavigate={handleNavigate} />}
        {currentView === 'products' && <ProductsPage currentView={currentView} onNavigate={handleNavigate} />}
        {currentView === 'reports' && <ReportsPage currentView={currentView} onNavigate={handleNavigate} />}
      </div>
    </GlobalProvider>
  );
}

export default App;

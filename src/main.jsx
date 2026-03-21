import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NexoApp from './apps/nexo/NexoApp'
import DeliwheelsApp from './apps/deliwheels/DeliwheelsApp'
import LoginPage from './apps/nexo/pages/LoginPage'
import AuthGuard from './shared/components/auth/AuthGuard'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login — no auth required */}
        <Route path="/login" element={
          <div data-app="nexo" style={{ minHeight: '100vh' }}>
            <LoginPage />
          </div>
        } />

        {/* Deliwheels — auth required */}
        <Route path="/deliwheels/*" element={
          <AuthGuard>
            <DeliwheelsApp />
          </AuthGuard>
        } />

        {/* Nexo (default) — auth required */}
        <Route path="/*" element={
          <AuthGuard>
            <NexoApp />
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

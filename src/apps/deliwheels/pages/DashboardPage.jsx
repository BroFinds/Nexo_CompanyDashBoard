import React, { useEffect } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Skeleton from '@shared/components/ui/Skeleton';
import { Truck, Route, Warehouse, PackageCheck, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

const DashboardPage = () => {
  const { vehicles, routes, stock, sales, fetchVehicles, fetchRoutes, fetchStock, fetchSales, isLoadingVehicles, isLoadingRoutes, isLoadingStock, isLoadingSales } = useDeliwheels();

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
    fetchStock();
    fetchSales();
  }, [fetchVehicles, fetchRoutes, fetchStock, fetchSales]);

  const isLoading = isLoadingVehicles || isLoadingRoutes || isLoadingStock || isLoadingSales;

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const loadedItems = stock.filter(s => s.status === 'loaded').length;
  const totalStockEntries = stock.length;

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length, sub: `${activeVehicles} active`, icon: Truck, color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
    { label: 'Active Routes', value: activeRoutes, sub: `of ${routes.length} total`, icon: Route, color: '#0891b2', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
    { label: 'Stock Loaded', value: totalStockEntries, sub: `${loadedItems} in transit`, icon: Warehouse, color: '#7c3aed', bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
    { label: 'Deliveries Today', value: '24', sub: '3 in transit', icon: PackageCheck, color: '#059669', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
  ];

  const getVehicleReg = (vuid) => {
    const v = vehicles.find(v => v.vehicle_uid === vuid);
    return v ? v.registration : vuid;
  };

  return (
    <DeliwheelsLayout headerTitle="Dashboard" headerSubtitle="DeliWheels operations overview">
      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {isLoading
          ? [1,2,3,4].map(i => (
              <div key={i} className={`animate-in ${i > 1 ? `delay-${(i-1)*100}` : ''}`}>
                <Card padding="lg" style={{ height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                    <Skeleton width="48px" height="48px" borderRadius="12px" />
                    <Skeleton width="16px" height="16px" borderRadius="4px" />
                  </div>
                  <Skeleton width="60px" height="32px" style={{ marginBottom: '6px' }} />
                  <Skeleton width="100px" height="14px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="70px" height="12px" />
                </Card>
              </div>
            ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              const delayClass = index === 0 ? '' : `delay-${index * 100}`;
              return (
                <div key={stat.label} className={`animate-in ${delayClass}`}>
                  <Card hoverable padding="lg" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: stat.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: stat.color
                      }}>
                        <Icon size={24} />
                      </div>
                      <TrendingUp size={16} style={{ color: '#10b981', marginTop: '4px' }} />
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '2px' }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                      {stat.sub}
                    </p>
                  </Card>
                </div>
              );
            })
        }
      </div>

      {/* Quick Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Fleet Status */}
        <div className="animate-in delay-200">
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Fleet Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoadingVehicles
                ? [1,2,3,4].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Skeleton width="16px" height="16px" borderRadius="4px" />
                        <div>
                          <Skeleton width="110px" height="14px" style={{ marginBottom: '4px' }} />
                          <Skeleton width="80px" height="12px" />
                        </div>
                      </div>
                      <Skeleton width="50px" height="20px" borderRadius="12px" />
                    </div>
                  ))
                : vehicles.slice(0, 4).map(v => (
                    <div key={v.vehicle_uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={16} style={{ color: 'var(--color-primary)' }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{v.registration}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{v.model}</p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', padding: '3px 8px', borderRadius: '12px',
                        backgroundColor: v.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : v.status === 'maintenance' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: v.status === 'active' ? '#059669' : v.status === 'maintenance' ? '#d97706' : '#dc2626'
                      }}>
                        {v.status}
                      </span>
                    </div>
                  ))
              }
              {vehicles.length === 0 && !isLoadingVehicles && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '20px' }}>No vehicles loaded</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Stock Loadings */}
        <div className="animate-in delay-300">
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Recent Loadings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoadingStock
                ? [1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Skeleton width="16px" height="16px" borderRadius="4px" />
                        <div>
                          <Skeleton width="120px" height="14px" style={{ marginBottom: '4px' }} />
                          <Skeleton width="100px" height="12px" />
                        </div>
                      </div>
                      <Skeleton width="50px" height="20px" borderRadius="12px" />
                    </div>
                  ))
                : stock.slice(0, 4).map(s => (
                    <div key={s.stock_uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={16} style={{ color: s.status === 'loaded' ? 'var(--color-primary)' : '#059669' }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{s.product_name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{s.quantity}× → {getVehicleReg(s.vehicle_uid)}</p>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', padding: '3px 8px', borderRadius: '12px',
                        backgroundColor: s.status === 'loaded' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: s.status === 'loaded' ? '#d97706' : '#059669'
                      }}>
                        {s.status === 'loaded' ? 'Loaded' : 'Delivered'}
                      </span>
                    </div>
                  ))
              }
              {!isLoadingStock && stock.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '20px' }}>No stock loaded yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid + div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DeliwheelsLayout>
  );
};

export default DashboardPage;

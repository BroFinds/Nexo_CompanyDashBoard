import React, { useEffect, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Skeleton from '@shared/components/ui/Skeleton';
import { BarChart3, Truck, ShoppingCart, Package, TrendingUp, IndianRupee } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

const ReportsPage = () => {
  const { vehicles, stock, routes, sales, fetchVehicles, fetchStock, fetchRoutes, fetchSales, isLoadingSales } = useDeliwheels();

  useEffect(() => {
    fetchVehicles();
    fetchStock();
    fetchRoutes();
    fetchSales();
  }, [fetchVehicles, fetchStock, fetchRoutes, fetchSales]);

  // Computed Stats
  const totalRevenue = sales.filter(s => s.status === 'delivered').reduce((sum, s) => sum + s.amount, 0);
  const totalOrders = sales.length;
  const deliveredOrders = sales.filter(s => s.status === 'delivered').length;
  const returnedOrders = sales.filter(s => s.status === 'returned' || s.status === 'cancelled').length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const lowStockItems = stock.filter(s => s.status === 'low_stock' || s.status === 'out_of_stock').length;

  // Revenue per vehicle
  const revenueByVehicle = vehicles.map(v => {
    const vehicleSales = sales.filter(s => s.vehicle_uid === v.vehicle_uid && s.status === 'delivered');
    return {
      ...v,
      revenue: vehicleSales.reduce((sum, s) => sum + s.amount, 0),
      orders: vehicleSales.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const summaryCards = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#059669', bg: '#d1fae5' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
    { label: 'Delivery Rate', value: totalOrders ? `${Math.round((deliveredOrders / totalOrders) * 100)}%` : '—', icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Active Fleet', value: `${activeVehicles}/${vehicles.length}`, icon: Truck, color: '#0891b2', bg: '#cffafe' },
    { label: 'Active Routes', value: activeRoutes, icon: BarChart3, color: '#ea580c', bg: '#ffedd5' },
    { label: 'Stock Alerts', value: lowStockItems, icon: Package, color: lowStockItems > 0 ? '#dc2626' : '#059669', bg: lowStockItems > 0 ? '#fee2e2' : '#d1fae5' },
  ];

  return (
    <DeliwheelsLayout headerTitle="Reports" headerSubtitle="Analytics and performance insights">
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Reports</h2>
        <p style={{ color: 'var(--color-text-subtle)' }}>Analytics overview and performance insights.</p>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        {isLoadingSales
          ? [1,2,3,4,5,6].map(i => (
              <Card key={i} padding="lg">
                <Skeleton width="40px" height="40px" borderRadius="10px" style={{ marginBottom: '12px' }} />
                <Skeleton width="60%" height="28px" style={{ marginBottom: '6px' }} />
                <Skeleton width="80%" height="14px" />
              </Card>
            ))
          : summaryCards.map((card, index) => {
              const Icon = card.icon;
              const delayClass = index < 3 ? `delay-${index * 100}` : `delay-${(index - 3) * 100}`;
              return (
                <div key={card.label} className={`animate-in ${delayClass}`}>
                  <Card padding="lg" style={{ height: '100%' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      backgroundColor: card.bg, color: card.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Icon size={20} />
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>{card.value}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '500' }}>{card.label}</p>
                  </Card>
                </div>
              );
            })
        }
      </div>

      {/* Revenue by Vehicle */}
      <div className="animate-in delay-200">
        <Card padding="lg">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>Revenue by Vehicle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {revenueByVehicle.map((v, i) => {
              const maxRevenue = revenueByVehicle[0]?.revenue || 1;
              const barWidth = Math.max((v.revenue / maxRevenue) * 100, 5);
              return (
                <div key={v.vehicle_uid}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{v.registration}</span>
                      <span style={{ color: 'var(--color-text-subtle)' }}>— {v.model}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-text-subtle)' }}>{v.orders} orders</span>
                      <span style={{ fontWeight: '700' }}>₹{v.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-body)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${barWidth}%`,
                      background: 'var(--gradient-primary, var(--color-primary))',
                      borderRadius: '4px',
                      transition: 'width 0.8s ease'
                    }}></div>
                  </div>
                </div>
              );
            })}
            {revenueByVehicle.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '20px' }}>No data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Delivery Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <div className="animate-in delay-300">
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>Order Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Delivered', value: deliveredOrders, color: '#059669', bg: '#d1fae5' },
                { label: 'In Transit', value: sales.filter(s => s.status === 'in_transit').length, color: '#d97706', bg: '#fef3c7' },
                { label: 'Returned', value: sales.filter(s => s.status === 'returned').length, color: '#dc2626', bg: '#fee2e2' },
                { label: 'Cancelled', value: sales.filter(s => s.status === 'cancelled').length, color: '#6b7280', bg: '#f3f4f6' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="animate-in delay-300">
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>Inventory Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'In Stock', value: stock.filter(s => s.status === 'in_stock').length, color: '#059669', bg: '#d1fae5' },
                { label: 'Low Stock', value: stock.filter(s => s.status === 'low_stock').length, color: '#d97706', bg: '#fef3c7' },
                { label: 'Out of Stock', value: stock.filter(s => s.status === 'out_of_stock').length, color: '#dc2626', bg: '#fee2e2' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DeliwheelsLayout>
  );
};

export default ReportsPage;

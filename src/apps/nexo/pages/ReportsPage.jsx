import React, { useEffect } from 'react';
import NexoLayout from '../components/NexoLayout';
import Card from '@shared/components/ui/Card';
import { useGlobal } from '../context/GlobalContext';
import { Users, Package, LayoutGrid, Activity } from 'lucide-react';

const ReportsPage = () => {
  const { employees, products, fetchEmployees, fetchProducts, isLoadingEmployees, isLoadingProducts } = useGlobal();

  useEffect(() => {
    fetchEmployees();
    fetchProducts();
  }, [fetchEmployees, fetchProducts]);

  const activeEmployees = employees.filter(e => e.is_active).length;
  const activeProducts = products.filter(p => p.is_active).length;

  const stats = [
    { label: 'Total Employees', value: employees.length, subtitle: `${activeEmployees} active`, icon: Users, color: '#8b5cf6' },
    { label: 'Total Products', value: products.length, subtitle: `${activeProducts} active`, icon: Package, color: '#ec4899' },
    { label: 'Active Apps', value: 2, subtitle: 'Nexo & DeliWheels', icon: LayoutGrid, color: '#3b82f6' },
    { label: 'System Status', value: 'Healthy', subtitle: 'All services running', icon: Activity, color: '#10b981' },
  ];

  return (
    <NexoLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>Reports & Analytics</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Overview of system usage and statistics across all modules.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {stat.label}
                  </h3>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-main)', lineHeight: 1 }}>
                    {isLoadingEmployees || isLoadingProducts ? '...' : stat.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', marginTop: '8px' }}>
                    {stat.subtitle}
                  </div>
                </div>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  backgroundColor: `${stat.color}15`, color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card padding="none">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-subtle)' }}>System Modules</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-body)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-subtle)', fontWeight: '600', fontSize: '0.85rem' }}>MODULE NAME</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-subtle)', fontWeight: '600', fontSize: '0.85rem' }}>DESCRIPTION</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-subtle)', fontWeight: '600', fontSize: '0.85rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>Nexo Core</td>
                <td style={{ padding: '16px', color: 'var(--color-text-subtle)' }}>Employee & Product Management</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#10b98115', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>Active</span>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>DeliWheels</td>
                <td style={{ padding: '16px', color: 'var(--color-text-subtle)' }}>Fleet & Logistics Operations</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#10b98115', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>Active</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '16px', fontWeight: '600' }}>Payments Gateway</td>
                <td style={{ padding: '16px', color: 'var(--color-text-subtle)' }}>External API integrations for billing</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f59e0b15', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>Maintenance</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      <br/>
    </NexoLayout>
  );
};

export default ReportsPage;

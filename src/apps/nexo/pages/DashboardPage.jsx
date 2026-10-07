import React, { useMemo } from 'react';
import NexoLayout from '../components/NexoLayout';
import Card from '@shared/components/ui/Card';
import Skeleton from '@shared/components/ui/Skeleton';
import {
  Users, Package, TrendingUp,
  ArrowRight, Lock,
} from 'lucide-react';
import { getSession } from '@/services/api';
import { useGlobal } from '../context/GlobalContext';
import { ALL_APPS } from '../constants/apps';


const DashboardPage = () => {
  const session = getSession();
  const enabledApps = session?.apps ?? [];
  const companyName = session?.companyName || 'company';

  const { employees, products, isLoadingEmployees, isLoadingProducts } = useGlobal();

  const activeEmployees = useMemo(() => employees.filter((e) => e.is_active !== false), [employees]);
  const activeProducts  = useMemo(() => products.filter((p) => p.is_active !== false), [products]);

  const stats = [
    {
      label: 'Active Employees',
      value: activeEmployees.length,
      sub: `${employees.length} total`,
      icon: Users,
      color: '#059669',
      bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      loading: isLoadingEmployees,
    },
    {
      label: 'Active Products',
      value: activeProducts.length,
      sub: `${products.length} total`,
      icon: Package,
      color: '#0891b2',
      bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      loading: isLoadingProducts,
    },
  ];

  const apps = ALL_APPS.map((app) => ({
    ...app,
    locked: !enabledApps.includes(app.id),
  }));

  return (
    <NexoLayout
      headerTitle="Dashboard"
      headerSubtitle={`Overview of ${companyName} operations`}
    >
      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const delayClass = index === 0 ? '' : `delay-${index * 100}`;
          return (
            <div key={stat.label} className={`animate-in ${delayClass}`}>
              <Card hoverable padding="lg" style={{ height: '100%' }}>
                {stat.loading ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                      <Skeleton width="48px" height="48px" borderRadius="12px" />
                      <Skeleton width="16px" height="16px" borderRadius="4px" />
                    </div>
                    <Skeleton width="60px" height="32px" style={{ marginBottom: '6px' }} />
                    <Skeleton width="100px" height="14px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="70px" height="12px" />
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: stat.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: stat.color,
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
                  </>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* ── Main content: left (activity) + right (apps) ─────────────────────── */}
      <div className="nexo-dash-main-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* Employee overview */}
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Employee Overview</h3>
            {isLoadingEmployees ? (
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height="72px" borderRadius="10px" />)}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                {[
                  { label: 'Active', value: activeEmployees.length, color: '#059669' },
                  { label: 'Inactive', value: employees.length - activeEmployees.length, color: '#dc2626' },
                  { label: 'Total', value: employees.length, color: 'var(--color-primary)' },
                ].map((tile) => (
                  <div key={tile.label} style={{ flex: 1, minWidth: '100px', padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-body)', textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: tile.color, lineHeight: 1, marginBottom: '4px' }}>{tile.value}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>{tile.label}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: compact app launcher */}
        <div>
          <Card padding="lg">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: 'var(--spacing-md)' }}>Apps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {apps.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.id}
                    onClick={() => !app.locked && window.open(app.route, '_blank')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', borderRadius: '10px',
                      backgroundColor: 'var(--bg-body)',
                      cursor: app.locked ? 'not-allowed' : 'pointer',
                      opacity: app.locked ? 0.55 : 1,
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: app.locked ? 'var(--color-text-subtle)' : 'var(--color-primary)',
                      border: '1px solid var(--border-color)',
                    }}>
                      {app.locked ? <Lock size={16} /> : <Icon size={18} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{app.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.locked ? 'Contact Nexo to enable' : app.desc}
                      </p>
                    </div>
                    {!app.locked && (
                      <ArrowRight size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .nexo-dash-main-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--spacing-lg);
          align-items: start;
        }
        @media (max-width: 900px) {
          .nexo-dash-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </NexoLayout>
  );
};

export default DashboardPage;

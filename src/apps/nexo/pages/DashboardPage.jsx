import React, { useEffect, useMemo } from 'react';
import NexoLayout from '../components/NexoLayout';
import Card from '@shared/components/ui/Card';
import Skeleton from '@shared/components/ui/Skeleton';
import {
  Users, Package, IndianRupee, Clock, TrendingUp,
  AlertTriangle, ArrowRight, Lock, Receipt, Truck,
} from 'lucide-react';
import { getSession } from '@/services/api';
import { useGlobal } from '../context/GlobalContext';
import { useDeliwheels } from '@deliwheels/context/DeliwheelsContext';
import { ALL_APPS } from '../constants/apps';

const formatCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

const formatMoney = (n) =>
  Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

const DashboardPage = () => {
  const session = getSession();
  const enabledApps = session?.apps ?? [];
  const companyName = session?.companyName || 'company';
  const hasDeliwheels = enabledApps.includes('deliwheels');

  // Nexo core data
  const { employees, products, isLoadingEmployees, isLoadingProducts } = useGlobal();

  // DeliWheels data (fetched only if the app is enabled)
  const {
    vehicles, sales, stock,
    fetchVehicles, fetchSales, fetchStock,
    isLoadingVehicles, isLoadingSales, isLoadingStock,
  } = useDeliwheels();

  useEffect(() => {
    if (hasDeliwheels) {
      fetchVehicles();
      fetchSales();
      fetchStock();
    }
  }, [hasDeliwheels, fetchVehicles, fetchSales, fetchStock]);

  // ── Nexo KPIs ────────────────────────────────────────────────────────────
  const activeEmployees = useMemo(() => employees.filter((e) => e.is_active !== false), [employees]);
  const activeProducts  = useMemo(() => products.filter((p) => p.is_active !== false), [products]);

  // ── DeliWheels KPIs ───────────────────────────────────────────────────────
  const todaysSales = useMemo(() => sales.filter((s) => isToday(s.sale_date)), [sales]);
  const todaysRevenue = todaysSales.reduce((sum, s) => sum + Number(s.grand_total || 0), 0);

  const pendingPayments = useMemo(
    () => sales.filter((s) => (s.payment_status_text || '').toUpperCase() !== 'PAID'),
    [sales],
  );
  const pendingAmount = pendingPayments.reduce((sum, s) => sum + Number(s.grand_total || 0), 0);

  const inactiveVehicles = vehicles.filter((v) => v.status !== 'active').length;

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.sale_date || 0) - new Date(a.sale_date || 0))
        .slice(0, 5),
    [sales],
  );

  const topVehicles = useMemo(() => {
    const map = new Map();
    for (const s of sales) {
      const key = s.vehicle_uid || s.vehicle_number || '—';
      const prev = map.get(key) || {
        vehicle_uid: s.vehicle_uid,
        vehicle_number: s.vehicle_number,
        revenue: 0,
        count: 0,
      };
      prev.revenue += Number(s.grand_total || 0);
      prev.count += 1;
      map.set(key, prev);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  // ── KPI cards ────────────────────────────────────────────────────────────
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
    ...(hasDeliwheels
      ? [
          {
            label: "Today's Revenue",
            value: formatCompact(todaysRevenue),
            sub:
              todaysSales.length > 0
                ? `${todaysSales.length} deliveries today`
                : 'No deliveries yet',
            icon: IndianRupee,
            color: '#7c3aed',
            bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
            loading: isLoadingSales,
          },
          {
            label: 'Unpaid Invoices',
            value: pendingPayments.length,
            sub:
              pendingPayments.length > 0
                ? `${formatCompact(pendingAmount)} outstanding`
                : 'All cleared',
            icon: Clock,
            color: pendingPayments.length > 0 ? '#d97706' : '#059669',
            bg:
              pendingPayments.length > 0
                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            loading: isLoadingSales,
          },
        ]
      : []),
  ];

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts = [];
  if (hasDeliwheels && inactiveVehicles > 0)
    alerts.push({
      label: `${inactiveVehicles} vehicle${inactiveVehicles === 1 ? '' : 's'} inactive`,
      tone: '#d97706',
    });
  if (hasDeliwheels && pendingPayments.length > 0)
    alerts.push({
      label: `${pendingPayments.length} unpaid invoice${pendingPayments.length === 1 ? '' : 's'} (₹${formatMoney(pendingAmount)})`,
      tone: '#dc2626',
    });

  // ── App list (compact) ───────────────────────────────────────────────────
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

      {/* ── Alerts ──────────────────────────────────────────────────────────── */}
      {!isLoadingSales && alerts.length > 0 && (
        <div className="animate-in delay-100" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Card padding="md" style={{ borderLeft: '4px solid #d97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', fontWeight: 700 }}>
                <AlertTriangle size={18} />
                <span>Alerts</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {alerts.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px',
                      backgroundColor: a.tone === '#dc2626' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: a.tone,
                    }}
                  >
                    {a.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Main content: left (activity) + right (apps) ─────────────────────── */}
      <div className="nexo-dash-main-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* Recent Deliveries (DeliWheels) OR Employee summary */}
          {hasDeliwheels ? (
            <Card padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Deliveries</h3>
                <a
                  href="/deliwheels/sales"
                  style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View all <ArrowRight size={14} />
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isLoadingSales
                  ? [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Skeleton width="16px" height="16px" borderRadius="4px" />
                          <div>
                            <Skeleton width="120px" height="14px" style={{ marginBottom: '4px' }} />
                            <Skeleton width="100px" height="12px" />
                          </div>
                        </div>
                        <Skeleton width="60px" height="20px" borderRadius="12px" />
                      </div>
                    ))
                  : recentSales.length > 0
                  ? recentSales.map((s) => {
                      const paid = (s.payment_status_text || '').toUpperCase() === 'PAID';
                      return (
                        <div
                          key={s.sale_uid}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <Receipt size={16} style={{ color: paid ? '#059669' : '#d97706', flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '0.85rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.shop_owner_name || s.invoice_no || '—'}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                                ₹{formatMoney(s.grand_total)} · {s.vehicle_number || '—'}
                              </p>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: '600', padding: '3px 8px', borderRadius: '12px', flexShrink: 0,
                            backgroundColor: paid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            color: paid ? '#059669' : '#d97706',
                          }}>
                            {paid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      );
                    })
                  : (
                      <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '20px' }}>
                        No deliveries recorded yet
                      </p>
                    )
                }
              </div>
            </Card>
          ) : (
            // Employee overview when DeliWheels is not enabled
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
          )}

          {/* Top Performing Vehicles (DeliWheels only) */}
          {hasDeliwheels && (
            <Card padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Top Performing Vehicles</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  By revenue
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isLoadingSales
                  ? [1, 2, 3].map((i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <Skeleton width="100px" height="14px" />
                          <Skeleton width="70px" height="14px" />
                        </div>
                        <Skeleton width="100%" height="6px" borderRadius="3px" />
                      </div>
                    ))
                  : topVehicles.length > 0
                  ? topVehicles.map((v, i) => {
                      const reg = v.vehicle_number || '—';
                      const maxRev = topVehicles[0]?.revenue || 0;
                      const pct = maxRev > 0 ? (v.revenue / maxRev) * 100 : 0;
                      const medal = ['#f59e0b', '#94a3b8', '#b45309', 'var(--color-primary)', 'var(--color-primary)'][i];
                      return (
                        <div key={v.vehicle_uid || reg}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              <span style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                backgroundColor: medal, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
                              }}>
                                {i + 1}
                              </span>
                              <Truck size={14} style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} />
                              <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <p style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>₹{formatMoney(v.revenue)}</p>
                              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>{v.count} delivery{v.count === 1 ? '' : 's'}</p>
                            </div>
                          </div>
                          <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-body)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: `linear-gradient(90deg, ${medal}, ${medal}aa)`,
                              borderRadius: '3px', transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })
                  : (
                      <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', padding: '20px' }}>
                        No delivery data yet
                      </p>
                    )
                }
              </div>
            </Card>
          )}
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

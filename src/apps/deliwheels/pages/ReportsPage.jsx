import React, { useEffect, useMemo, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Skeleton from '@shared/components/ui/Skeleton';
import {
  Truck, Package, IndianRupee, Wallet, AlertCircle, Receipt, Users,
  Calendar, Percent, ArrowUpRight, ArrowDownRight, Activity, MapPin, Boxes,
  ShoppingCart,
} from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

// ── helpers ─────────────────────────────────────────────────────────────────

const parseDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatINRShort = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const deltaPct = (curr, prev) => {
  if (!prev) return curr ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const RANGES = [
  { key: '7d', label: '7 Days', days: 7 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: '90d', label: '90 Days', days: 90 },
  { key: 'all', label: 'All Time', days: null },
];

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── small chart components ──────────────────────────────────────────────────

const AreaChart = ({ points, height = 180, color = 'var(--color-primary, #6366f1)' }) => {
  if (!points.length) return <EmptyChart height={height} />;
  const max = Math.max(...points.map(p => p.value), 1);
  const w = 1000;
  const h = height;
  const pad = 24;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: pad + i * step,
    y: pad + innerH - (p.value / max) * innerH,
  }));

  const linePath = coords.map((c, i) => `${i ? 'L' : 'M'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)} ${pad + innerH} L${coords[0].x.toFixed(1)} ${pad + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1={pad} x2={w - pad} y1={pad + innerH * f} y2={pad + innerH * f}
              stroke="var(--color-border, #e5e7eb)" strokeDasharray="2 4" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2.5" fill={color}>
          <title>{`${points[i].label}: ${formatINR(points[i].value)}`}</title>
        </circle>
      ))}
      <text x={pad} y={h - 4} fontSize="10" fill="var(--color-text-subtle, #6b7280)">{points[0]?.label || ''}</text>
      <text x={w - pad} y={h - 4} fontSize="10" textAnchor="end" fill="var(--color-text-subtle, #6b7280)">{points[points.length - 1]?.label || ''}</text>
      <text x={pad} y={pad - 6} fontSize="10" fill="var(--color-text-subtle, #6b7280)">{formatINRShort(max)}</text>
    </svg>
  );
};

const Donut = ({ segments, size = 180, thickness = 28 }) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (!total) return <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No data</div>;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-body, #f3f4f6)" strokeWidth={thickness} />
      {segments.map((seg, i) => {
        const length = (seg.value / total) * c;
        const dasharray = `${length} ${c - length}`;
        const dashoffset = -offset;
        offset += length;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          >
            <title>{`${seg.label}: ${seg.value}`}</title>
          </circle>
        );
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-text, #111)">
        {total.toLocaleString('en-IN')}
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="11" fill="var(--color-text-subtle, #6b7280)">
        Total
      </text>
    </svg>
  );
};

const VBarChart = ({ bars, height = 160 }) => {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height, padding: '8px 0' }}>
      {bars.map((b, i) => {
        const h = Math.max((b.value / max) * (height - 32), 2);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
              {b.value > 0 ? formatINRShort(b.value) : ''}
            </div>
            <div style={{
              width: '100%',
              height: `${h}px`,
              background: b.color || 'var(--color-primary, #6366f1)',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.6s ease',
            }} title={`${b.label}: ${formatINR(b.value)}`} />
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const EmptyChart = ({ height = 180 }) => (
  <div style={{
    height, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-subtle)', fontSize: '0.85rem',
    border: '1px dashed var(--color-border, #e5e7eb)', borderRadius: '8px',
  }}>
    No data in selected range
  </div>
);

// ── page ────────────────────────────────────────────────────────────────────

const ReportsPage = () => {
  const {
    vehicles, stock, routes, sales,
    fetchVehicles, fetchStock, fetchRoutes, fetchSales,
    isLoadingSales,
  } = useDeliwheels();

  const [rangeKey, setRangeKey] = useState('30d');

  useEffect(() => {
    fetchVehicles();
    fetchStock();
    fetchRoutes();
    fetchSales();
  }, [fetchVehicles, fetchStock, fetchRoutes, fetchSales]);

  const range = RANGES.find(r => r.key === rangeKey) || RANGES[1];

  // Pre-bucket sales into current and previous periods for delta calcs.
  const { currSales, prevSales } = useMemo(() => {
    if (range.days === null) return { currSales: sales, prevSales: [] };
    const now = startOfDay(new Date());
    const from = new Date(now); from.setDate(from.getDate() - range.days + 1);
    const prevTo = new Date(from); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - range.days + 1);
    const curr = [], prev = [];
    for (const s of sales) {
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const ds = startOfDay(d);
      if (ds >= from && ds <= now) curr.push(s);
      else if (ds >= prevFrom && ds <= prevTo) prev.push(s);
    }
    return { currSales: curr, prevSales: prev };
  }, [sales, range.days]);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const sumGrand = arr => arr.reduce((s, x) => s + (x.grand_total || x.total_amount || 0), 0);
    const isPaid = s => (s.payment_status_text || '').toUpperCase() === 'PAID' || (s.payment_status || '').toUpperCase() === 'PAID';

    const revenue = sumGrand(currSales);
    const prevRevenue = sumGrand(prevSales);
    const orders = currSales.length;
    const prevOrders = prevSales.length;
    const aov = orders ? revenue / orders : 0;
    const prevAov = prevOrders ? prevRevenue / prevOrders : 0;
    const collected = currSales.filter(isPaid).reduce((s, x) => s + (x.grand_total || 0), 0);
    const prevCollected = prevSales.filter(isPaid).reduce((s, x) => s + (x.grand_total || 0), 0);
    const outstanding = revenue - collected;
    const uniqueShops = new Set(currSales.map(s => s.shop_uid).filter(Boolean)).size;
    const prevUniqueShops = new Set(prevSales.map(s => s.shop_uid).filter(Boolean)).size;

    return [
      { label: 'Revenue', value: formatINRShort(revenue), raw: revenue, prev: prevRevenue, delta: deltaPct(revenue, prevRevenue), icon: IndianRupee, color: '#059669', bg: '#d1fae5' },
      { label: 'Orders', value: orders.toLocaleString('en-IN'), raw: orders, prev: prevOrders, delta: deltaPct(orders, prevOrders), icon: ShoppingCart, color: 'var(--color-primary)', bg: 'var(--color-primary-subtle)' },
      { label: 'Avg Order', value: formatINRShort(aov), raw: aov, prev: prevAov, delta: deltaPct(aov, prevAov), icon: Receipt, color: '#7c3aed', bg: '#ede9fe' },
      { label: 'Collected', value: formatINRShort(collected), raw: collected, prev: prevCollected, delta: deltaPct(collected, prevCollected), icon: Wallet, color: '#0891b2', bg: '#cffafe' },
      { label: 'Outstanding', value: formatINRShort(outstanding), raw: outstanding, icon: AlertCircle, color: outstanding > 0 ? '#dc2626' : '#059669', bg: outstanding > 0 ? '#fee2e2' : '#d1fae5', noDelta: true },
      { label: 'Active Shops', value: uniqueShops, raw: uniqueShops, prev: prevUniqueShops, delta: deltaPct(uniqueShops, prevUniqueShops), icon: Users, color: '#ea580c', bg: '#ffedd5' },
    ];
  }, [currSales, prevSales]);

  // ── revenue trend (daily buckets) ───────────────────────────────────────
  const trendPoints = useMemo(() => {
    const buckets = new Map();
    const days = range.days || Math.max(30, range.days);
    const totalDays = range.days === null
      ? (() => {
          let min = null;
          for (const s of sales) {
            const d = parseDate(s.sale_date);
            if (d && (!min || d < min)) min = d;
          }
          if (!min) return 30;
          return Math.min(180, Math.max(7, Math.ceil((Date.now() - min.getTime()) / 86400000) + 1));
        })()
      : days;
    const now = startOfDay(new Date());
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), value: 0, key });
    }
    for (const s of currSales) {
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const key = startOfDay(d).toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (b) b.value += s.grand_total || s.total_amount || 0;
    }
    return Array.from(buckets.values());
  }, [currSales, sales, range.days]);

  // ── payment mode + status breakdowns ───────────────────────────────────
  const paymentModeSegments = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      const k = s.payment_mode_text || s.payment_mode || 'Unknown';
      m.set(k, (m.get(k) || 0) + 1);
    }
    const palette = ['#6366f1', '#059669', '#ea580c', '#0891b2', '#7c3aed', '#dc2626', '#9ca3af'];
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));
  }, [currSales]);

  const paymentStatusBreakdown = useMemo(() => {
    const m = new Map();
    let amount = new Map();
    for (const s of currSales) {
      const k = (s.payment_status_text || s.payment_status || 'Unknown').toUpperCase();
      m.set(k, (m.get(k) || 0) + 1);
      amount.set(k, (amount.get(k) || 0) + (s.grand_total || 0));
    }
    const colorOf = (k) => {
      if (k === 'PAID') return { c: '#059669', bg: '#d1fae5' };
      if (k === 'PENDING' || k === 'PARTIAL') return { c: '#d97706', bg: '#fef3c7' };
      if (k === 'FAILED' || k === 'CANCELLED') return { c: '#dc2626', bg: '#fee2e2' };
      return { c: '#6b7280', bg: '#f3f4f6' };
    };
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count, amount: amount.get(label) || 0, ...colorOf(label) }));
  }, [currSales]);

  // ── top shops + top products ────────────────────────────────────────────
  const topShops = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      if (!s.shop_uid) continue;
      const cur = m.get(s.shop_uid) || { shop_uid: s.shop_uid, name: s.shop_owner_name || s.shop_uid, contact: s.shop_contact_number, revenue: 0, orders: 0 };
      cur.revenue += s.grand_total || 0;
      cur.orders += 1;
      m.set(s.shop_uid, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [currSales]);

  const topProducts = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      for (const d of (s.details || [])) {
        const k = d.product_uid || d.product_name;
        if (!k) continue;
        const cur = m.get(k) || { name: d.product_name || k, units: 0, revenue: 0 };
        cur.units += d.quantity || 0;
        cur.revenue += d.total_amount || 0;
        m.set(k, cur);
      }
    }
    const all = Array.from(m.values());
    return {
      byRevenue: [...all].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      byUnits: [...all].sort((a, b) => b.units - a.units).slice(0, 10),
    };
  }, [currSales]);

  // ── day of week revenue ────────────────────────────────────────────────
  const dowBars = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    for (const s of currSales) {
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      buckets[d.getDay()] += s.grand_total || 0;
    }
    return DOW_LABELS.map((label, i) => ({ label, value: buckets[i] }));
  }, [currSales]);

  // ── vehicle / driver leaderboard ────────────────────────────────────────
  const vehicleLeaderboard = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      if (!s.vehicle_uid) continue;
      const cur = m.get(s.vehicle_uid) || { vehicle_uid: s.vehicle_uid, registration: s.vehicle_number || '', orders: 0, revenue: 0, paidCount: 0 };
      cur.revenue += s.grand_total || 0;
      cur.orders += 1;
      const isPaid = (s.payment_status_text || '').toUpperCase() === 'PAID';
      if (isPaid) cur.paidCount += 1;
      m.set(s.vehicle_uid, cur);
    }
    return Array.from(m.values())
      .map(v => {
        const veh = vehicles.find(x => x.vehicle_uid === v.vehicle_uid);
        return {
          ...v,
          registration: veh?.registration || v.registration || '—',
          model: veh?.model || '',
          driver: veh?.driver || 'Unassigned',
          aov: v.orders ? v.revenue / v.orders : 0,
          paidPct: pct(v.paidCount, v.orders),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [currSales, vehicles]);

  // ── receivables aging ──────────────────────────────────────────────────
  const aging = useMemo(() => {
    const buckets = { '0-7': 0, '8-15': 0, '16-30': 0, '30+': 0 };
    const counts = { '0-7': 0, '8-15': 0, '16-30': 0, '30+': 0 };
    const today = startOfDay(new Date()).getTime();
    for (const s of sales) {
      const isPaid = (s.payment_status_text || '').toUpperCase() === 'PAID';
      if (isPaid) continue;
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const days = Math.floor((today - startOfDay(d).getTime()) / 86400000);
      const bucket = days <= 7 ? '0-7' : days <= 15 ? '8-15' : days <= 30 ? '16-30' : '30+';
      buckets[bucket] += s.grand_total || 0;
      counts[bucket] += 1;
    }
    return [
      { label: '0–7 days', value: buckets['0-7'], count: counts['0-7'], color: '#059669' },
      { label: '8–15 days', value: buckets['8-15'], count: counts['8-15'], color: '#d97706' },
      { label: '16–30 days', value: buckets['16-30'], count: counts['16-30'], color: '#ea580c' },
      { label: '30+ days', value: buckets['30+'], count: counts['30+'], color: '#dc2626' },
    ];
  }, [sales]);

  // ── discount leakage ───────────────────────────────────────────────────
  const discountStats = useMemo(() => {
    let saleDiscount = 0, lineDiscount = 0, taxTotal = 0, gross = 0;
    for (const s of currSales) {
      saleDiscount += s.discount_amount || 0;
      taxTotal += s.tax_amount || 0;
      gross += s.total_amount || 0;
      for (const d of (s.details || [])) lineDiscount += d.discount || 0;
    }
    const totalDisc = saleDiscount + lineDiscount;
    return { saleDiscount, lineDiscount, totalDisc, taxTotal, gross, discPct: pct(totalDisc, gross) };
  }, [currSales]);

  // ── stock loaded vs sold per vehicle ───────────────────────────────────
  const stockReconciliation = useMemo(() => {
    const loadedByVehicle = new Map();
    for (const e of stock) {
      const d = parseDate(e.loaded_date) || parseDate(e.created_at);
      if (range.days !== null) {
        if (!d) continue;
        const days = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (days > range.days) continue;
      }
      const cur = loadedByVehicle.get(e.vehicle_uid) || { vehicle_uid: e.vehicle_uid, units: 0 };
      cur.units += e.quantity || 0;
      loadedByVehicle.set(e.vehicle_uid, cur);
    }
    const soldByVehicle = new Map();
    for (const s of currSales) {
      if (!s.vehicle_uid) continue;
      let units = 0;
      for (const d of (s.details || [])) units += d.quantity || 0;
      const cur = soldByVehicle.get(s.vehicle_uid) || { units: 0 };
      cur.units += units;
      soldByVehicle.set(s.vehicle_uid, cur);
    }
    const all = new Set([...loadedByVehicle.keys(), ...soldByVehicle.keys()]);
    return Array.from(all).map(uid => {
      const veh = vehicles.find(v => v.vehicle_uid === uid);
      const loaded = loadedByVehicle.get(uid)?.units || 0;
      const sold = soldByVehicle.get(uid)?.units || 0;
      return {
        vehicle_uid: uid,
        registration: veh?.registration || '—',
        driver: veh?.driver || 'Unassigned',
        loaded,
        sold,
        remaining: loaded - sold,
        sellThrough: pct(sold, loaded),
      };
    }).sort((a, b) => b.loaded - a.loaded);
  }, [stock, currSales, vehicles, range.days]);

  // ── inactive shops (no sale in 30d, but had sale before) ────────────────
  const inactiveShops = useMemo(() => {
    const lastSeen = new Map();
    for (const s of sales) {
      if (!s.shop_uid) continue;
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const cur = lastSeen.get(s.shop_uid);
      if (!cur || d > cur.date) {
        lastSeen.set(s.shop_uid, { date: d, name: s.shop_owner_name || s.shop_uid, contact: s.shop_contact_number });
      }
    }
    const cutoff = Date.now() - 30 * 86400000;
    return Array.from(lastSeen.entries())
      .filter(([, v]) => v.date.getTime() < cutoff)
      .map(([uid, v]) => ({
        shop_uid: uid,
        name: v.name,
        contact: v.contact,
        lastDate: v.date,
        daysAgo: Math.floor((Date.now() - v.date.getTime()) / 86400000),
      }))
      .sort((a, b) => b.daysAgo - a.daysAgo)
      .slice(0, 10);
  }, [sales]);

  // ── fleet/route summary ─────────────────────────────────────────────────
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeRoutes = routes.filter(r => r.status === 'active').length;

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <DeliwheelsLayout headerTitle="Reports" headerSubtitle="Analytics and performance insights">
      {/* Header + Range Selector */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)',
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Reports</h2>
          <p style={{ color: 'var(--color-text-subtle)', margin: '4px 0 0 0' }}>Analytics overview and performance insights.</p>
        </div>
        <div style={{
          display: 'inline-flex', gap: '4px', padding: '4px',
          backgroundColor: 'var(--bg-body)', borderRadius: '10px',
          border: '1px solid var(--color-border, #e5e7eb)',
        }}>
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRangeKey(r.key)} style={{
              padding: '6px 14px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px',
              background: rangeKey === r.key ? 'var(--color-surface, white)' : 'transparent',
              color: rangeKey === r.key ? 'var(--color-text)' : 'var(--color-text-subtle)',
              boxShadow: rangeKey === r.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        {isLoadingSales
          ? [1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} padding="lg">
                <Skeleton width="40px" height="40px" borderRadius="10px" style={{ marginBottom: '12px' }} />
                <Skeleton width="60%" height="28px" style={{ marginBottom: '6px' }} />
                <Skeleton width="80%" height="14px" />
              </Card>
            ))
          : kpis.map((k, idx) => {
              const Icon = k.icon;
              const up = (k.delta || 0) > 0;
              const down = (k.delta || 0) < 0;
              return (
                <div key={k.label} className={`animate-in delay-${(idx % 3) * 100}`}>
                  <Card padding="lg" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        backgroundColor: k.bg, color: k.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={20} />
                      </div>
                      {!k.noDelta && k.delta !== undefined && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '2px',
                          padding: '3px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                          backgroundColor: up ? '#d1fae5' : down ? '#fee2e2' : '#f3f4f6',
                          color: up ? '#059669' : down ? '#dc2626' : '#6b7280',
                        }}>
                          {up ? <ArrowUpRight size={12} /> : down ? <ArrowDownRight size={12} /> : null}
                          {Math.abs(k.delta)}%
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px' }}>{k.value}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>{k.label}</p>
                  </Card>
                </div>
              );
            })
        }
      </div>

      {/* Revenue Trend */}
      <div className="animate-in delay-100" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Revenue Trend</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', margin: '2px 0 0 0' }}>Daily revenue over the selected period</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
              <Activity size={16} /> {range.label}
            </div>
          </div>
          <AreaChart points={trendPoints} height={220} />
        </Card>
      </div>

      {/* Payment Mode + Day of Week */}
      <div className="report-grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="animate-in delay-200">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Payment Mode</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 auto' }}>
                <Donut segments={paymentModeSegments} />
              </div>
              <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {paymentModeSegments.length === 0 && (
                  <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No data</p>
                )}
                {paymentModeSegments.map(seg => (
                  <div key={seg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color }} />
                      <span style={{ fontSize: '0.85rem' }}>{seg.label}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{seg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="animate-in delay-200">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Revenue by Day of Week</h3>
            <VBarChart bars={dowBars} height={200} />
          </Card>
        </div>
      </div>

      {/* Payment Status + Receivables Aging */}
      <div className="report-grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="animate-in delay-200">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Payment Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paymentStatusBreakdown.length === 0 && (
                <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No data</p>
              )}
              {paymentStatusBreakdown.map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-body)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.c }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>{item.count} orders</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>{formatINRShort(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="animate-in delay-300">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Receivables Aging</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', margin: '0 0 var(--spacing-md) 0' }}>Outstanding by age (across all sales)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aging.map(b => {
                const max = Math.max(...aging.map(x => x.value), 1);
                const w = Math.max((b.value / max) * 100, b.value > 0 ? 4 : 0);
                return (
                  <div key={b.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{b.label}</span>
                      <span><span style={{ color: 'var(--color-text-subtle)', marginRight: 10 }}>{b.count}</span><strong>{formatINRShort(b.value)}</strong></span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-body)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${w}%`, background: b.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Shops + Top Products by Revenue */}
      <div className="report-grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="animate-in delay-200">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Top 10 Shops</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topShops.length === 0 && <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No data</p>}
              {topShops.map((s, i) => {
                const max = topShops[0]?.revenue || 1;
                const w = Math.max((s.revenue / max) * 100, 4);
                return (
                  <div key={s.shop_uid}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 18, color: 'var(--color-text-subtle)', fontSize: '0.75rem', fontWeight: 700 }}>#{i + 1}</span>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </span>
                      <span style={{ fontWeight: 700 }}>{formatINRShort(s.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-body)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w}%`, background: 'var(--color-primary)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', minWidth: 56, textAlign: 'right' }}>{s.orders} orders</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="animate-in delay-300">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Top 10 Products by Revenue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topProducts.byRevenue.length === 0 && <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No data</p>}
              {topProducts.byRevenue.map((p, i) => {
                const max = topProducts.byRevenue[0]?.revenue || 1;
                const w = Math.max((p.revenue / max) * 100, 4);
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 18, color: 'var(--color-text-subtle)', fontSize: '0.75rem', fontWeight: 700 }}>#{i + 1}</span>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </span>
                      <span style={{ fontWeight: 700 }}>{formatINRShort(p.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-body)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w}%`, background: '#7c3aed', borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', minWidth: 56, textAlign: 'right' }}>{p.units} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Products by Units + Discount/Tax */}
      <div className="report-grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="animate-in delay-200">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Top 10 Products by Units</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topProducts.byUnits.length === 0 && <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>No data</p>}
              {topProducts.byUnits.map((p, i) => {
                const max = topProducts.byUnits[0]?.units || 1;
                const w = Math.max((p.units / max) * 100, 4);
                return (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 24, color: 'var(--color-text-subtle)', fontSize: '0.8rem', fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <div style={{ width: 100, height: 6, background: 'var(--bg-body)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${w}%`, background: '#0891b2', borderRadius: 3 }} />
                    </div>
                    <span style={{ minWidth: 50, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{p.units}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="animate-in delay-300">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Discounts & Tax</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', margin: '0 0 var(--spacing-md) 0' }}>Selected period</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 14, background: '#fef3c7', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#92400e', fontWeight: 600, marginBottom: 6 }}>
                  <Percent size={13} /> Total Discount
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatINRShort(discountStats.totalDisc)}</div>
                <div style={{ fontSize: '0.72rem', color: '#92400e' }}>{discountStats.discPct}% of gross</div>
              </div>
              <div style={{ padding: 14, background: '#dbeafe', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#1e40af', fontWeight: 600, marginBottom: 6 }}>
                  <Receipt size={13} /> Tax Collected
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatINRShort(discountStats.taxTotal)}</div>
                <div style={{ fontSize: '0.72rem', color: '#1e40af' }}>across {currSales.length} sales</div>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-body)', borderRadius: 10 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontWeight: 600, marginBottom: 6 }}>Invoice-level</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatINRShort(discountStats.saleDiscount)}</div>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-body)', borderRadius: 10 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', fontWeight: 600, marginBottom: 6 }}>Line-item</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatINRShort(discountStats.lineDiscount)}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Vehicle Leaderboard */}
      <div className="animate-in delay-200" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Card padding="lg">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Vehicle / Driver Leaderboard</h3>
          {vehicleLeaderboard.length === 0 ? (
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>No sales in this range</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>Vehicle</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>Driver</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>Orders</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>AOV</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600, color: 'var(--color-text-subtle)' }}>Paid %</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleLeaderboard.map((v, i) => (
                    <tr key={v.vehicle_uid} style={{ borderBottom: '1px solid var(--color-border, #f3f4f6)' }}>
                      <td style={{ padding: '10px 8px', color: 'var(--color-text-subtle)', fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v.registration}</div>
                        {v.model && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{v.model}</div>}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{v.driver}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>{v.orders}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>{formatINRShort(v.revenue)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>{formatINRShort(v.aov)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                          background: v.paidPct >= 80 ? '#d1fae5' : v.paidPct >= 50 ? '#fef3c7' : '#fee2e2',
                          color: v.paidPct >= 80 ? '#059669' : v.paidPct >= 50 ? '#92400e' : '#dc2626',
                        }}>{v.paidPct}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Stock Reconciliation */}
      <div className="animate-in delay-200" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--spacing-md)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Stock Loaded vs Sold</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', margin: '2px 0 0 0' }}>Per vehicle in selected range — sell-through highlights wastage / unsold stock</p>
            </div>
            <Boxes size={18} style={{ color: 'var(--color-text-subtle)' }} />
          </div>
          {stockReconciliation.length === 0 ? (
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>No stock activity in this range</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stockReconciliation.map(r => (
                <div key={r.vehicle_uid} style={{ padding: '10px 12px', background: 'var(--bg-body)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.registration}</span>
                      <span style={{ color: 'var(--color-text-subtle)' }}>— {r.driver}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem' }}>
                      <span><span style={{ color: 'var(--color-text-subtle)' }}>Loaded:</span> <strong>{r.loaded}</strong></span>
                      <span><span style={{ color: 'var(--color-text-subtle)' }}>Sold:</span> <strong>{r.sold}</strong></span>
                      <span><span style={{ color: 'var(--color-text-subtle)' }}>Remaining:</span> <strong style={{ color: r.remaining < 0 ? '#dc2626' : 'inherit' }}>{r.remaining}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        height: '100%', width: `${Math.min(r.sellThrough, 100)}%`,
                        background: r.sellThrough >= 80 ? '#059669' : r.sellThrough >= 50 ? '#d97706' : '#dc2626',
                        borderRadius: 4, transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: 44, textAlign: 'right' }}>{r.sellThrough}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Inactive Shops + Fleet Summary */}
      <div className="report-grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="animate-in delay-200">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Inactive Shops</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', margin: '0 0 var(--spacing-md) 0' }}>No purchase in 30+ days — recovery list</p>
            {inactiveShops.length === 0 ? (
              <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>No inactive shops 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inactiveShops.map(s => (
                  <div key={s.shop_uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-body)', borderRadius: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      {s.contact && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)' }}>{s.contact}</div>}
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: '#fee2e2', color: '#dc2626', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {s.daysAgo}d
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="animate-in delay-300">
          <Card padding="lg" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Fleet & Operations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 14, background: '#cffafe', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#155e75', fontWeight: 600, marginBottom: 6 }}>
                  <Truck size={13} /> Active Fleet
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeVehicles}<span style={{ fontSize: '0.9rem', color: '#155e75', fontWeight: 600 }}>/{vehicles.length}</span></div>
              </div>
              <div style={{ padding: 14, background: '#ffedd5', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#9a3412', fontWeight: 600, marginBottom: 6 }}>
                  <MapPin size={13} /> Active Routes
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{activeRoutes}<span style={{ fontSize: '0.9rem', color: '#9a3412', fontWeight: 600 }}>/{routes.length}</span></div>
              </div>
              <div style={{ padding: 14, background: '#ede9fe', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#5b21b6', fontWeight: 600, marginBottom: 6 }}>
                  <Package size={13} /> Stock Entries
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stock.length}</div>
              </div>
              <div style={{ padding: 14, background: '#d1fae5', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#065f46', fontWeight: 600, marginBottom: 6 }}>
                  <Calendar size={13} /> Sales Logged
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{sales.length}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .report-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
        }
        @media (max-width: 768px) {
          .report-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </DeliwheelsLayout>
  );
};

export default ReportsPage;

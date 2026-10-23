import React, { useEffect, useMemo, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import {
  Truck,
  Route,
  PackageCheck,
  Package,
  Wallet,
  Plus,
  Banknote,
  Smartphone,
  Trophy,
} from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import { useDashboardSummary } from "../context/useDashboardSummary";
import StockFormModal from "./modals/stock/StockFormModal";

const formatMoney = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
};

const toISO = (d) => {
  const x = new Date(d);
  const tz = x.getTimezoneOffset() * 60000;
  return new Date(x.getTime() - tz).toISOString().slice(0, 10);
};

const TIME_RANGES = [
  { key: "today", label: "Today", getRange: () => { const t = toISO(new Date()); return { from: t, to: t }; } },
  { key: "week", label: "This Week", getRange: () => { const now = new Date(); const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return { from: toISO(d), to: toISO(now) }; } },
  { key: "month", label: "This Month", getRange: () => { const now = new Date(); return { from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, to: toISO(now) }; } },
  { key: "year", label: "This Year", getRange: () => { const now = new Date(); return { from: `${now.getFullYear()}-01-01`, to: toISO(now) }; } },
  { key: "alltime", label: "All Time", getRange: () => ({ from: "", to: "" }) },
];

const DashboardPage = () => {
  const {
    vehicles,
    fetchVehicles,
    addStockLoading,
    updateStock,
    isLoadingVehicles,
  } = useDeliwheels();
  const { products } = useGlobal();

  const [timeRangeKey, setTimeRangeKey] = useState("today");
  const dateRange = useMemo(
    () => TIME_RANGES.find((r) => r.key === timeRangeKey)?.getRange() ?? {},
    [timeRangeKey],
  );

  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
  } = useDashboardSummary({ fromDate: dateRange.from, toDate: dateRange.to });

  const [isStockFormOpen, setIsStockFormOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const isLoading = isLoadingDashboard || isLoadingVehicles;

  const summary = dashboard?.summary || {};
  const leaderboardRaw = useMemo(
    () => dashboard?.leaderboard ?? [],
    [dashboard],
  );

  // One row per vehicle: every active vehicle, plus inactive ones only if they had sales or
  // returns in the period. Backend rows are matched on vehicle_uid; the vehicle number
  // (ignoring case/spaces) is only a fallback for an older backend that doesn't send it.
  const leaderboard = useMemo(() => {
    const normalize = (number) => String(number || "").replace(/\s+/g, "").toUpperCase();
    const byUid = new Map();
    const byNumber = new Map();
    leaderboardRaw.forEach((row) => {
      if (row.vehicle_uid) byUid.set(row.vehicle_uid, row);
      else if (row.vehicle_number) byNumber.set(normalize(row.vehicle_number), row);
    });

    const toRow = (vehicle, row = {}) => ({
      vehicle_uid: vehicle?.vehicle_uid || row.vehicle_uid,
      vehicle_number: vehicle?.registration || row.vehicle_number || "—",
      driver_name: vehicle?.driver || row.driver_name || "Unassigned",
      total_revenue: Number(row.total_revenue || 0),
      total_sales_count: Number(row.total_sales_count || 0),
      avg_sale: Number(row.avg_sale || 0),
      total_returns: Number(row.total_returns || 0),
      return_value: Number(row.return_value || 0),
      cash_amount: Number(row.cash_amount || 0),
      upi_amount: Number(row.upi_amount || 0),
      credit_amount: Number(row.credit_amount || 0),
    });

    const used = new Set();
    const merged = [];
    vehicles.forEach((v) => {
      const row = byUid.get(v.vehicle_uid) || byNumber.get(normalize(v.registration));
      if (row) used.add(row);
      if (!row && v.status === "inactive") return; // inactive with no activity → hide
      merged.push(toRow(v, row));
    });
    // Activity for a vehicle that isn't in the vehicle list (e.g. deleted since)
    leaderboardRaw.forEach((row) => {
      if (!used.has(row)) merged.push(toRow(null, row));
    });
    return merged.sort((a, b) => b.total_revenue - a.total_revenue);
  }, [leaderboardRaw, vehicles]);

  const collection = dashboard?.collection || {};
  const stockLoaded = useMemo(
    () => dashboard?.stock_loaded ?? [],
    [dashboard],
  );

  const paymentSplitToday = useMemo(() => {
    const total = Number(collection.total_collected || 0);
    const cash = Number(collection.cash_collected || 0);
    const upi = Number(collection.upi_collected || 0);
    const other = Math.max(0, total - cash - upi);
    return { cash, upi, other, total };
  }, [collection]);

  const rangeLabel = TIME_RANGES.find((r) => r.key === timeRangeKey)?.label ?? "Today";

  const stats = [
    {
      label: "Total Vehicles",
      value: Number(summary.total_vehicles || 0),
      sub: `${Number(summary.active_vehicles || 0)} active`,
      icon: Truck,
      color: "var(--color-primary)",
      bg: "var(--color-primary-subtle)",
    },
    {
      label: "Active Routes",
      value: Number(summary.active_routes || 0),
      sub: `of ${Number(summary.total_routes || 0)} total`,
      icon: Route,
      color: "#0891b2",
      bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    },
    {
      label: `${rangeLabel} Sales`,
      value: Number(summary.total_sales_today || 0),
      sub: `${Number(summary.total_sales_alltime || 0)} all-time`,
      icon: PackageCheck,
      color: "#059669",
      bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    },
    {
      label: `${rangeLabel} Revenue`,
      value: `₹${formatCompact(summary.total_revenue_today)}`,
      sub:
        Number(summary.total_pending_today || 0) > 0
          ? `₹${formatCompact(summary.total_pending_today)} pending`
          : "All settled",
      icon: Wallet,
      color: "#7c3aed",
      bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    },
  ];

  return (
    <DeliwheelsLayout
      headerTitle="Dashboard"
      headerSubtitle="DeliWheels operations overview"
    >
      {/* Time-range selector */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "inline-flex", gap: "4px", padding: "4px", backgroundColor: "var(--bg-body)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              type="button"
              onClick={() => setTimeRangeKey(range.key)}
              style={{
                padding: "6px 14px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                border: "none", borderRadius: "7px",
                background: timeRangeKey === range.key ? "var(--color-primary, #6366f1)" : "transparent",
                color: timeRangeKey === range.key ? "#fff" : "var(--color-text-subtle)",
                boxShadow: timeRangeKey === range.key ? "0 1px 3px rgba(99,102,241,0.25)" : "none",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="dashboard-grid"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`animate-in ${i > 1 ? `delay-${(i - 1) * 100}` : ""}`}
              >
                <Card padding="md" style={{ height: "100%" }}>
                  <div className="stat-card-body">
                    <Skeleton width="44px" height="44px" borderRadius="12px" />
                    <div style={{ flex: 1 }}>
                      <Skeleton
                        width="60px"
                        height="24px"
                        style={{ marginBottom: "6px" }}
                      />
                      <Skeleton width="100px" height="12px" />
                    </div>
                  </div>
                </Card>
              </div>
            ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              const delayClass = index === 0 ? "" : `delay-${index * 100}`;
              return (
                <div key={stat.label} className={`animate-in ${delayClass}`}>
                  <Card hoverable padding="md" style={{ height: "100%" }}>
                    <div className="stat-card-body">
                      <div
                        className="stat-card-icon"
                        style={{ background: stat.bg, color: stat.color }}
                      >
                        <Icon size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="stat-card-value">
                          <span>{stat.value}</span>
                          <span className="stat-card-label">{stat.label}</span>
                        </div>
                        <p className="stat-card-sub">{stat.sub}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
      </div>

      {/* Vehicle Leaderboard — Today (full width) */}
      <div
        className="animate-in delay-200"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <Card padding="lg">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: "var(--spacing-md)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Trophy size={18} style={{ color: "#f59e0b" }} />
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Vehicle Leaderboard — {rangeLabel}
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-subtle)",
                    margin: "2px 0 0 0",
                  }}
                >
                  All vehicles ranked by revenue
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--color-text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {leaderboard.length} vehicle{leaderboard.length === 1 ? "" : "s"}
            </span>
          </div>
          <VehicleLeaderboard rows={leaderboard} />
        </Card>
      </div>

      {/* Two-column: Payment split today + Stock loaded today */}
      <div
        className="today-grid-2"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <div className="animate-in delay-300">
          <Card padding="lg" style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "var(--spacing-md)",
              }}
            >
              <Wallet size={18} style={{ color: "#059669" }} />
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Today&apos;s Collection
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-subtle)",
                    margin: "2px 0 0 0",
                  }}
                >
                  Cash vs UPI (paid invoices only)
                </p>
              </div>
            </div>
            <PaymentSplitDonut split={paymentSplitToday} />
          </Card>
        </div>

        <div className="animate-in delay-400">
          <Card padding="lg" style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "var(--spacing-md)",
              }}
            >
              <Package size={18} style={{ color: "#7c3aed" }} />
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Stock Loaded Today
                </h3>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-subtle)",
                    margin: "2px 0 0 0",
                  }}
                >
                  Units loaded per vehicle
                </p>
              </div>
            </div>
            <VehicleStockGauges rows={stockLoaded} />
          </Card>
        </div>
      </div>

      <StockFormModal
        isOpen={isStockFormOpen}
        onClose={() => setIsStockFormOpen(false)}
        initialEntry={null}
        products={products}
        vehicles={vehicles}
        onAdd={addStockLoading}
        onUpdate={updateStock}
      />

      {!isStockFormOpen && (
        <button
          type="button"
          className="load-stock-fab"
          onClick={() => setIsStockFormOpen(true)}
          aria-label="Load Stock"
          title="Load Stock"
        >
          <Plus size={20} />
          <span>Load Stock</span>
        </button>
      )}

      <style>{`
        .stat-card-body {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .stat-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-card-value {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          column-gap: 8px;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .stat-card-label {
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0;
          color: var(--color-text-main);
        }
        .stat-card-sub {
          font-size: 0.78rem;
          color: var(--color-text-subtle);
          margin: 2px 0 0 0;
        }
        .load-stock-fab {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 50;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border: none;
          border-radius: 999px;
          background: var(--color-primary, #6366f1);
          color: #fff;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .load-stock-fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.45);
        }
        @media (max-width: 640px) {
          .load-stock-fab { right: 16px; bottom: 16px; padding: 14px; }
          .load-stock-fab span { display: none; }
        }

        .today-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
        }
        @media (max-width: 900px) {
          .today-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </DeliwheelsLayout>
  );
};

/* -------------------------- Inline widget components -------------------------- */

const VehicleLeaderboard = ({ rows }) => {
  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-subtle)",
          fontSize: "0.85rem",
          border: "1px dashed var(--color-border, #e5e7eb)",
          borderRadius: 8,
        }}
      >
        No vehicles found.
      </div>
    );
  }

  const medals = ["#f59e0b", "#94a3b8", "#b45309"];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", minWidth: 680 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--color-border, #e5e7eb)" }}>
            {["#", "Vehicle", "Sales", "Revenue", "Returns", "Ret. Value", "Cash", "UPI", "Credit"].map((h, i) => (
              <th key={h} style={{ padding: "8px 10px", textAlign: i <= 1 ? "left" : "right", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const reg = row.vehicle_number || "—";
            const driver = row.driver_name || "Unassigned";
            const revenue = Number(row.total_revenue || 0);
            const count = Number(row.total_sales_count || 0);
            const returns = Number(row.total_returns || 0);
            const returnVal = Number(row.return_value || 0);
            const cash = Number(row.cash_amount || 0);
            const upi = Number(row.upi_amount || 0);
            const credit = Number(row.credit_amount || 0);
            const medal = medals[i] || "var(--color-primary, #6366f1)";
            const hasActivity = revenue > 0 || count > 0;
            return (
              <tr key={`${reg}-${i}`} style={{ borderBottom: "1px solid var(--border-subtle, #f3f4f6)", opacity: hasActivity ? 1 : 0.55 }}>
                <td style={{ padding: "10px 10px", width: 36 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: i < 3 && hasActivity ? medal : "var(--bg-body, #f9fafb)",
                    color: i < 3 && hasActivity ? "#fff" : "var(--color-text-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.72rem", fontWeight: 800, flexShrink: 0,
                  }}>
                    {i < 3 && hasActivity ? <Trophy size={13} /> : `${i + 1}`}
                  </div>
                </td>
                <td style={{ padding: "10px 10px" }}>
                  <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.88rem" }}>{reg}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: 1 }}>{driver}</div>
                </td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{count}</td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: revenue > 0 ? "#059669" : "var(--color-text-subtle)" }}>₹{formatCompact(revenue)}</td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", color: returns > 0 ? "#d97706" : "var(--color-text-subtle)" }}>{returns}</td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", color: returnVal > 0 ? "#d97706" : "var(--color-text-subtle)" }}>₹{formatCompact(returnVal)}</td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", color: cash > 0 ? "#059669" : "var(--color-text-subtle)" }}>₹{formatCompact(cash)}</td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", color: upi > 0 ? "#6366f1" : "var(--color-text-subtle)" }}>₹{formatCompact(upi)}</td>
                <td style={{ padding: "10px 10px", textAlign: "right", fontFamily: "monospace", color: credit > 0 ? "#dc2626" : "var(--color-text-subtle)" }}>₹{formatCompact(credit)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const PaymentSplitDonut = ({ split }) => {
  const { cash, upi, other, total } = split;
  if (!total) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-subtle)",
          fontSize: "0.85rem",
          border: "1px dashed var(--color-border, #e5e7eb)",
          borderRadius: 8,
        }}
      >
        No collection yet today
      </div>
    );
  }

  const segments = [
    { label: "Cash", value: cash, color: "#059669", icon: Banknote },
    { label: "UPI", value: upi, color: "#6366f1", icon: Smartphone },
    ...(other > 0
      ? [{ label: "Other", value: other, color: "#94a3b8", icon: Wallet }]
      : []),
  ];

  const size = 160;
  const thickness = 24;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-lg)",
        flexWrap: "wrap",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-body, #f3f4f6)"
          strokeWidth={thickness}
        />
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null;
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
              strokeLinecap="butt"
            >
              <title>{`${seg.label}: ₹${formatMoney(seg.value)}`}</title>
            </circle>
          );
        })}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fill="var(--color-text-main, #111)"
        >
          ₹{formatCompact(total)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          fontSize="10"
          fill="var(--color-text-subtle, #6b7280)"
        >
          collected
        </text>
      </svg>
      <div
        style={{
          flex: 1,
          minWidth: 160,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {segments.map((seg) => {
          const Icon = seg.icon;
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div
              key={seg.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                background: "var(--bg-body)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${seg.color}1a`,
                  color: seg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  <span>{seg.label}</span>
                  <span>₹{formatMoney(seg.value)}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {pct}% of collection
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VehicleStockGauges = ({ rows }) => {
  if (!rows || rows.length === 0) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-subtle)",
          fontSize: "0.85rem",
          border: "1px dashed var(--color-border, #e5e7eb)",
          borderRadius: 8,
        }}
      >
        No stock loaded yet today
      </div>
    );
  }

  const maxLoaded =
    Math.max(...rows.map((r) => Number(r.total_loaded || 0))) || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((row, i) => {
        const reg = row.vehicle_number || "—";
        const driver = row.driver_name || "Unassigned";
        const loaded = Number(row.total_loaded || 0);
        const loadedPct = (loaded / maxLoaded) * 100;
        return (
          <div key={`${reg}-${i}`}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <Truck
                  size={14}
                  style={{ color: "var(--color-text-subtle)", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {reg}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-text-subtle)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  · {driver}
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#7c3aed",
                  fontWeight: 700,
                }}
              >
                {formatMoney(loaded)} loaded
              </span>
            </div>
            <div
              style={{
                position: "relative",
                height: 10,
                background: "var(--bg-body)",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${loadedPct}%`,
                  background: "linear-gradient(90deg, #ddd6fe, #7c3aed)",
                  borderRadius: 5,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardPage;

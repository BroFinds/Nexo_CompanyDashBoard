import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import {
  Truck,
  Package,
  Wallet,
  Activity,
  MapPin,
  Boxes,
  Filter,
} from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import StockReport from "./reports/StockReport";
import OverviewReport from "./reports/OverviewReport";
import SalesByVehicleReport from "./reports/SalesByVehicleReport";
import PaymentByVehicleReport from "./reports/PaymentByVehicleReport";
import { formatINRShort } from "./reports/ReportHelpers";
import { IndianRupee, AlertCircle, Users, ShoppingCart } from "lucide-react";

const toISODate = (d) => {
  const x = new Date(d);
  const tz = x.getTimezoneOffset() * 60000;
  return new Date(x.getTime() - tz).toISOString().slice(0, 10);
};

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

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const deltaPct = (curr, prev) => {
  if (!prev) return curr ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const isPaidSale = (s) =>
  (s.payment_status_text || "").toUpperCase() === "PAID" ||
  (s.payment_status || "").toUpperCase() === "PAID";

const REPORTS = [
  {
    key: "overview",
    label: "Overview",
    icon: Activity,
    desc: "Overall performance snapshot",
  },
  {
    key: "by-vehicle",
    label: "Sales by Vehicle",
    icon: Truck,
    desc: "Drilldown sales for a vehicle",
  },
  {
    key: "payment-by-vehicle",
    label: "Payment by Vehicle",
    icon: Wallet,
    desc: "Payment status breakdown by vehicle",
  },
  {
    key: "stock",
    label: "Stock",
    icon: Boxes,
    desc: "Stock loaded, sold & sell-through",
  },
];

const RANGE_PRESETS = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
  { key: "all", label: "All", days: null },
];

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ReportsPage = () => {
  const {
    vehicles,
    sales,
    fetchVehicles,
    fetchStock,
    fetchRoutes,
    fetchSales,
    isLoadingSales,
  } = useDeliwheels();
  const { products } = useGlobal();

  const today = useMemo(() => toISODate(new Date()), []);
  const monthAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return toISODate(d);
  }, []);

  const [activeReport, setActiveReport] = useState("overview");
  const [filterApplied, setFilterApplied] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: "",
    toDate: "",
    vehicleUid: "",
    productUid: "",
  });

  const [rangeKey, setRangeKey] = useState("30d");
  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(today);
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  useEffect(() => {
    fetchVehicles();
    fetchStock();
    fetchRoutes();
    fetchSales();
  }, [fetchVehicles, fetchStock, fetchRoutes, fetchSales]);

  const stockDefaultedRef = useRef(false);
  useEffect(() => {
    if (activeReport !== "stock" || stockDefaultedRef.current) return;
    stockDefaultedRef.current = true;
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const weekAgo = toISODate(d);
    setFromDate(weekAgo);
    setToDate(today);
    setVehicleFilter("");
    setProductFilter("");
    setAppliedFilters({
      fromDate: weekAgo,
      toDate: today,
      vehicleUid: "",
      productUid: "",
    });
    setFilterApplied(true);
  }, [activeReport, today]);

  const range =
    RANGE_PRESETS.find((r) => r.key === rangeKey) || RANGE_PRESETS[1];

  const productOptions = useMemo(
    () =>
      (products || [])
        .filter((p) => p.is_active !== false)
        .map((p) => ({
          uid: p.product_uid,
          name: p.product_name,
          code: p.product_code,
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [products],
  );

  const dateWindow = useMemo(() => {
    const fromD = fromDate ? startOfDay(new Date(fromDate)) : null;
    const toD = toDate ? startOfDay(new Date(toDate)) : null;
    return { fromD, toD };
  }, [fromDate, toDate]);

  const inWindow = useCallback(
    (d) => {
      if (!d) return false;
      const ds = startOfDay(d);
      if (dateWindow.fromD && ds < dateWindow.fromD) return false;
      if (dateWindow.toD && ds > dateWindow.toD) return false;
      return true;
    },
    [dateWindow],
  );

  const { currSales, prevSales } = useMemo(() => {
    if (range.days === null) return { currSales: sales, prevSales: [] };
    const now = startOfDay(new Date());
    const from = new Date(now);
    from.setDate(from.getDate() - range.days + 1);
    const prevTo = new Date(from);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - range.days + 1);
    const curr = [],
      prev = [];
    for (const s of sales) {
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const ds = startOfDay(d);
      if (ds >= from && ds <= now) curr.push(s);
      else if (ds >= prevFrom && ds <= prevTo) prev.push(s);
    }
    return { currSales: curr, prevSales: prev };
  }, [sales, range.days]);

  const overviewKpis = useMemo(() => {
    const sumGrand = (arr) =>
      arr.reduce((s, x) => s + (x.grand_total || x.total_amount || 0), 0);
    const revenue = sumGrand(currSales);
    const prevRevenue = sumGrand(prevSales);
    const orders = currSales.length;
    const prevOrders = prevSales.length;
    const collected = currSales
      .filter(isPaidSale)
      .reduce((s, x) => s + (x.grand_total || 0), 0);
    const prevCollected = prevSales
      .filter(isPaidSale)
      .reduce((s, x) => s + (x.grand_total || 0), 0);
    const outstanding = revenue - collected;
    const uniqueShops = new Set(
      currSales.map((s) => s.shop_uid).filter(Boolean),
    ).size;
    const prevUniqueShops = new Set(
      prevSales.map((s) => s.shop_uid).filter(Boolean),
    ).size;
    return [
      {
        label: "Revenue",
        value: formatINRShort(revenue),
        delta: deltaPct(revenue, prevRevenue),
        icon: IndianRupee,
        color: "#059669",
        bg: "#d1fae5",
      },
      {
        label: "Collected",
        value: formatINRShort(collected),
        delta: deltaPct(collected, prevCollected),
        icon: Wallet,
        color: "#0891b2",
        bg: "#cffafe",
      },
      {
        label: "Outstanding",
        value: formatINRShort(outstanding),
        icon: AlertCircle,
        color: outstanding > 0 ? "#dc2626" : "#059669",
        bg: outstanding > 0 ? "#fee2e2" : "#d1fae5",
        noDelta: true,
      },
      {
        label: "Orders",
        value: orders.toLocaleString("en-IN"),
        delta: deltaPct(orders, prevOrders),
        icon: ShoppingCart,
        color: "#6366f1",
        bg: "#e0e7ff",
      },
      {
        label: "Active Shops",
        value: uniqueShops,
        delta: deltaPct(uniqueShops, prevUniqueShops),
        icon: Users,
        color: "#ea580c",
        bg: "#ffedd5",
      },
    ];
  }, [currSales, prevSales]);

  const overviewTrend = useMemo(() => {
    const buckets = new Map();
    const totalDays =
      range.days === null
        ? (() => {
            let min = null;
            for (const s of sales) {
              const d = parseDate(s.sale_date);
              if (d && (!min || d < min)) min = d;
            }
            if (!min) return 30;
            return Math.min(
              180,
              Math.max(
                7,
                Math.ceil((Date.now() - min.getTime()) / 86400000) + 1,
              ),
            );
          })()
        : range.days;
    const now = startOfDay(new Date());
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, {
        label: d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        value: 0,
        key,
      });
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

  const paymentModeSegments = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      const k = s.payment_mode_text || s.payment_mode || "Unknown";
      m.set(k, (m.get(k) || 0) + 1);
    }
    const palette = [
      "#6366f1",
      "#059669",
      "#ea580c",
      "#0891b2",
      "#7c3aed",
      "#dc2626",
      "#9ca3af",
    ];
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        color: palette[i % palette.length],
      }));
  }, [currSales]);

  const paymentStatusBreakdown = useMemo(() => {
    const m = new Map(),
      amount = new Map();
    for (const s of currSales) {
      const k = (
        s.payment_status_text ||
        s.payment_status ||
        "Unknown"
      ).toUpperCase();
      m.set(k, (m.get(k) || 0) + 1);
      amount.set(k, (amount.get(k) || 0) + (s.grand_total || 0));
    }
    const colorOf = (k) => {
      if (k === "PAID") return { c: "#059669", bg: "#d1fae5" };
      if (k === "PENDING" || k === "PARTIAL")
        return { c: "#d97706", bg: "#fef3c7" };
      if (k === "FAILED" || k === "CANCELLED")
        return { c: "#dc2626", bg: "#fee2e2" };
      return { c: "#6b7280", bg: "#f3f4f6" };
    };
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        count,
        amount: amount.get(label) || 0,
        ...colorOf(label),
      }));
  }, [currSales]);

  const topShops = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      if (!s.shop_uid) continue;
      const cur = m.get(s.shop_uid) || {
        key: s.shop_uid,
        name: s.shop_owner_name || s.shop_uid,
        revenue: 0,
        orders: 0,
      };
      cur.revenue += s.grand_total || 0;
      cur.orders += 1;
      m.set(s.shop_uid, cur);
    }
    return Array.from(m.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [currSales]);

  const topProducts = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      for (const d of s.details || []) {
        const k = d.product_uid || d.product_name;
        if (!k) continue;
        const cur = m.get(k) || {
          key: k,
          name: d.product_name || k,
          units: 0,
          revenue: 0,
        };
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

  const dowBars = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    for (const s of currSales) {
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      buckets[d.getDay()] += s.grand_total || 0;
    }
    return DOW_LABELS.map((label, i) => ({ label, value: buckets[i] }));
  }, [currSales]);

  const vehicleLeaderboard = useMemo(() => {
    const m = new Map();
    for (const s of currSales) {
      if (!s.vehicle_uid) continue;
      const cur = m.get(s.vehicle_uid) || {
        vehicle_uid: s.vehicle_uid,
        registration: s.vehicle_number || "",
        orders: 0,
        revenue: 0,
        paidCount: 0,
      };
      cur.revenue += s.grand_total || 0;
      cur.orders += 1;
      if (isPaidSale(s)) cur.paidCount += 1;
      m.set(s.vehicle_uid, cur);
    }
    return Array.from(m.values())
      .map((v) => {
        const veh = vehicles.find((x) => x.vehicle_uid === v.vehicle_uid);
        return {
          ...v,
          registration: veh?.registration || v.registration || "—",
          model: veh?.model || "",
          driver: veh?.driver || "Unassigned",
          aov: v.orders ? v.revenue / v.orders : 0,
          paidPct: pct(v.paidCount, v.orders),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [currSales, vehicles]);

  const aging = useMemo(() => {
    const buckets = { "0-7": 0, "8-15": 0, "16-30": 0, "30+": 0 };
    const counts = { "0-7": 0, "8-15": 0, "16-30": 0, "30+": 0 };
    const todayTs = startOfDay(new Date()).getTime();
    for (const s of sales) {
      if (isPaidSale(s)) continue;
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const days = Math.floor((todayTs - startOfDay(d).getTime()) / 86400000);
      const bucket =
        days <= 7 ? "0-7" : days <= 15 ? "8-15" : days <= 30 ? "16-30" : "30+";
      buckets[bucket] += s.grand_total || 0;
      counts[bucket] += 1;
    }
    return [
      {
        label: "0–7 days",
        value: buckets["0-7"],
        count: counts["0-7"],
        color: "#059669",
      },
      {
        label: "8–15 days",
        value: buckets["8-15"],
        count: counts["8-15"],
        color: "#d97706",
      },
      {
        label: "16–30 days",
        value: buckets["16-30"],
        count: counts["16-30"],
        color: "#ea580c",
      },
      {
        label: "30+ days",
        value: buckets["30+"],
        count: counts["30+"],
        color: "#dc2626",
      },
    ];
  }, [sales]);

  const byVehicleData = useMemo(() => {
    const filtered = sales.filter((s) => {
      if (vehicleFilter && s.vehicle_uid !== vehicleFilter) return false;
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      return inWindow(d);
    });
    const orders = filtered.length;
    const revenue = filtered.reduce((s, x) => s + (x.grand_total || 0), 0);
    const collected = filtered
      .filter(isPaidSale)
      .reduce((s, x) => s + (x.grand_total || 0), 0);
    const units = filtered.reduce(
      (s, x) =>
        s + (x.details || []).reduce((u, d) => u + (d.quantity || 0), 0),
      0,
    );
    const uniqueShops = new Set(filtered.map((s) => s.shop_uid).filter(Boolean))
      .size;
    const aov = orders ? revenue / orders : 0;

    const dayBuckets = new Map();
    if (dateWindow.fromD && dateWindow.toD) {
      const cur = new Date(dateWindow.fromD);
      while (cur <= dateWindow.toD) {
        const key = toISODate(cur);
        dayBuckets.set(key, {
          key,
          label: cur.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          value: 0,
        });
        cur.setDate(cur.getDate() + 1);
      }
    }
    for (const s of filtered) {
      const d = parseDate(s.sale_date) || parseDate(s.created_on);
      if (!d) continue;
      const key = toISODate(d);
      const b = dayBuckets.get(key);
      if (b) b.value += s.grand_total || 0;
    }
    const trend = Array.from(dayBuckets.values());

    const shopMap = new Map();
    for (const s of filtered) {
      if (!s.shop_uid) continue;
      const cur = shopMap.get(s.shop_uid) || {
        key: s.shop_uid,
        name: s.shop_owner_name || s.shop_uid,
        revenue: 0,
        orders: 0,
      };
      cur.revenue += s.grand_total || 0;
      cur.orders += 1;
      shopMap.set(s.shop_uid, cur);
    }
    const shops = Array.from(shopMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );

    const productMap = new Map();
    for (const s of filtered) {
      for (const d of s.details || []) {
        const k = d.product_uid || d.product_name;
        if (!k) continue;
        const cur = productMap.get(k) || {
          key: k,
          name: d.product_name || k,
          revenue: 0,
          units: 0,
        };
        cur.revenue += d.total_amount || 0;
        cur.units += d.quantity || 0;
        productMap.set(k, cur);
      }
    }
    const productsByRevenue = Array.from(productMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );

    const recent = [...filtered]
      .sort((a, b) => {
        const ad =
          parseDate(a.sale_date) || parseDate(a.created_on) || new Date(0);
        const bd =
          parseDate(b.sale_date) || parseDate(b.created_on) || new Date(0);
        return bd - ad;
      })
      .slice(0, 25);

    return {
      filtered,
      orders,
      revenue,
      collected,
      outstanding: revenue - collected,
      units,
      uniqueShops,
      aov,
      trend,
      shops,
      products: productsByRevenue,
      recent,
    };
  }, [sales, vehicleFilter, dateWindow, inWindow]);

  const selectedVehicle = vehicles.find((v) => v.vehicle_uid === vehicleFilter);
  const selectedProduct = productOptions.find((p) => p.uid === productFilter);

  const showVehicleFilter = activeReport !== "overview";
  const showProductFilter = activeReport === "stock";
  const showDateFields = activeReport !== "overview";

  return (
    <DeliwheelsLayout
      headerTitle="Reports"
      headerSubtitle="Analytics and performance insights"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Reports
          </h2>
          <p style={{ color: "var(--color-text-subtle)", margin: "4px 0 0 0" }}>
            Switch between overview, vehicle, and stock views to drill down on
            what matters.
          </p>
        </div>
      </div>

      <div
        className="reports-tabs"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const active = activeReport === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setActiveReport(r.key)}
              className={`reports-tab ${active ? "is-active" : ""}`}
            >
              <div className="reports-tab__icon">
                <Icon size={18} />
              </div>
              <div className="reports-tab__text">
                <div className="reports-tab__label">{r.label}</div>
                <div className="reports-tab__desc">{r.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {activeReport !== "overview" && (
        <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-text-subtle)",
              }}
            >
              <Filter size={16} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Filters
              </span>
            </div>
          </div>

          <div
            className="reports-filters"
            style={{
              marginTop: "var(--spacing-md)",
              marginBottom: "var(--spacing-md)",
              alignItems: "flex-end",
            }}
          >
            {showDateFields && (
              <>
                <div className="reports-field" style={{ marginBottom: 0 }}>
                  <label>From</label>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || today}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setRangeKey("");
                    }}
                  />
                </div>
                <div className="reports-field" style={{ marginBottom: 0 }}>
                  <label>To</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    max={today}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setRangeKey("");
                    }}
                  />
                </div>
              </>
            )}
            {showVehicleFilter && (
              <div className="reports-field" style={{ marginBottom: 0 }}>
                <label>Vehicle</label>
                <SearchableSelect
                  options={[
                    { value: "", label: "All Vehicles" },
                    ...vehicles.map((v) => ({
                      value: v.vehicle_uid,
                      label: v.registration,
                      sub: [
                        v.model,
                        v.driver && v.driver !== "Unassigned" ? v.driver : null,
                      ]
                        .filter(Boolean)
                        .join(" — "),
                    })),
                  ]}
                  value={vehicleFilter}
                  onChange={setVehicleFilter}
                  placeholder="All Vehicles"
                  noResultsText="No vehicles found"
                />
              </div>
            )}
            {showProductFilter && (
              <div className="reports-field" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <SearchableSelect
                  options={[
                    { value: "", label: "All Products" },
                    ...productOptions.map((p) => ({
                      value: p.uid,
                      label: p.name,
                      sub: p.code,
                    })),
                  ]}
                  value={productFilter}
                  onChange={setProductFilter}
                  placeholder="All Products"
                  noResultsText="No products found"
                />
              </div>
            )}
            <button
              onClick={() => {
                setAppliedFilters({
                  fromDate,
                  toDate,
                  vehicleUid: vehicleFilter,
                  productUid: productFilter,
                });
                setFilterApplied(true);
              }}
              style={{
                padding: "10px 16px",
                background: "var(--color-primary, #6366f1)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              <Filter size={14} />
              Filter
            </button>
          </div>
          {(selectedVehicle || selectedProduct) && (
            <div
              style={{
                marginTop: "var(--spacing-md)",
                padding: "10px 12px",
                background: "var(--bg-body)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {selectedVehicle && (
                <>
                  <Truck
                    size={16}
                    style={{ color: "var(--color-primary, #6366f1)" }}
                  />
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                    {selectedVehicle.registration}
                  </span>
                  {selectedVehicle.model && (
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {selectedVehicle.model}
                    </span>
                  )}
                  <span style={{ fontSize: "0.85rem" }}>
                    Driver: <strong>{selectedVehicle.driver}</strong>
                  </span>
                  {(selectedVehicle.route_origin ||
                    selectedVehicle.route_destination) && (
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      <MapPin
                        size={12}
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />{" "}
                      {selectedVehicle.route_origin} →{" "}
                      {selectedVehicle.route_destination}
                    </span>
                  )}
                </>
              )}
              {selectedProduct && (
                <>
                  <Package size={16} style={{ color: "#7c3aed" }} />
                  <span style={{ fontWeight: 700 }}>
                    {selectedProduct.name}
                  </span>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      {activeReport === "overview" && (
        <OverviewReport
          isLoadingSales={isLoadingSales}
          overviewKpis={overviewKpis}
          overviewTrend={overviewTrend}
          paymentModeSegments={paymentModeSegments}
          dowBars={dowBars}
          paymentStatusBreakdown={paymentStatusBreakdown}
          aging={aging}
          topShops={topShops}
          topProducts={topProducts}
          vehicleLeaderboard={vehicleLeaderboard}
          range={range}
        />
      )}

      {activeReport === "by-vehicle" && (
        <SalesByVehicleReport
          filterApplied={filterApplied}
          byVehicleData={byVehicleData}
          vehicleFilter={vehicleFilter}
          fromDate={fromDate}
          toDate={toDate}
        />
      )}

      {activeReport === "stock" && (
        <StockReport
          filterApplied={filterApplied}
          fromDate={appliedFilters.fromDate}
          toDate={appliedFilters.toDate}
          vehicleUid={appliedFilters.vehicleUid || null}
          productUid={appliedFilters.productUid || null}
        />
      )}

      {activeReport === "payment-by-vehicle" && (
        <PaymentByVehicleReport
          filterApplied={filterApplied}
          fromDate={appliedFilters.fromDate}
          toDate={appliedFilters.toDate}
          vehicleFilter={appliedFilters.vehicleUid || null}
        />
      )}

      <style>{`
        .reports-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 6px;
          background: var(--bg-body);
          border-radius: 12px;
          border: 1px solid var(--color-border, #e5e7eb);
        }
        .reports-tab {
          flex: 1 1 200px;
          min-width: 180px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          cursor: pointer;
          border: none;
          border-radius: 9px;
          background: transparent;
          text-align: left;
          transition: all 0.15s ease;
        }
        .reports-tab.is-active {
          background: var(--color-surface, white);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .reports-tab__icon {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          color: var(--color-text-subtle);
          border: 1px solid var(--color-border, #e5e7eb);
        }
        .reports-tab.is-active .reports-tab__icon {
          background: var(--color-primary, #6366f1);
          color: white;
          border: none;
        }
        .reports-tab__label {
          font-size: 0.92rem; font-weight: 700;
          color: var(--color-text-subtle);
        }
        .reports-tab.is-active .reports-tab__label { color: var(--color-text); }
        .reports-tab__desc {
          font-size: 0.72rem; color: var(--color-text-subtle);
        }

        .reports-filters {
          display: grid;
          gap: var(--spacing-md);
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .reports-field label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text-subtle);
          margin-bottom: 6px;
        }
        .reports-field input,
        .reports-field select {
          width: 100%;
          padding: 9px 12px;
          font-size: 0.9rem;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          background: var(--color-surface, white);
          color: var(--color-text);
        }
        .reports-field select { cursor: pointer; }

        .report-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
        }
        @media (max-width: 768px) {
          .report-grid-2 { grid-template-columns: 1fr; }
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .reports-table thead tr {
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }
        .reports-table th {
          text-align: left;
          padding: 10px 8px;
          font-weight: 600;
          color: var(--color-text-subtle);
        }
        .reports-table th.num,
        .reports-table td.num { text-align: right; }
        .reports-table td.strong { font-weight: 700; }
        .reports-table td.muted-strong {
          color: var(--color-text-subtle);
          font-weight: 700;
        }
        .reports-table tbody tr {
          border-bottom: 1px solid var(--color-border, #f3f4f6);
        }
        .reports-table td { padding: 10px 8px; }
      `}</style>
    </DeliwheelsLayout>
  );
};

export default ReportsPage;

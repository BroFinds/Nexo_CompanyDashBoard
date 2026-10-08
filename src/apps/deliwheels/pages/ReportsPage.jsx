import React, { useEffect, useMemo, useRef, useState } from "react";
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
import DateRangeBar, { STANDARD_PRESETS } from "../components/DateRangeBar";
import StockReport from "./reports/StockReport";
import OverviewReport from "./reports/OverviewReport";
import SalesByVehicleReport from "./reports/SalesByVehicleReport";
import PaymentByVehicleReport from "./reports/PaymentByVehicleReport";

const toISODate = (d) => {
  const x = new Date(d);
  const tz = x.getTimezoneOffset() * 60000;
  return new Date(x.getTime() - tz).toISOString().slice(0, 10);
};

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

// RANGE_PRESETS replaced by STANDARD_PRESETS from DateRangeBar

const ReportsPage = () => {
  const { vehicles, fetchVehicles, fetchStock, fetchRoutes, fetchSales } =
    useDeliwheels();
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

  const [rangeKey, setRangeKey] = useState("month");
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

  const paymentDefaultedRef = useRef(false);
  useEffect(() => {
    if (activeReport !== "payment-by-vehicle" || paymentDefaultedRef.current)
      return;
    paymentDefaultedRef.current = true;
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const weekAgo = toISODate(d);
    setFromDate(weekAgo);
    setToDate(today);
    setVehicleFilter("");
    setAppliedFilters({
      fromDate: weekAgo,
      toDate: today,
      vehicleUid: "",
      productUid: "",
    });
    setFilterApplied(true);
  }, [activeReport, today]);

  const byVehicleDefaultedRef = useRef(false);
  useEffect(() => {
    if (activeReport !== "by-vehicle" || byVehicleDefaultedRef.current) return;
    byVehicleDefaultedRef.current = true;
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const weekAgo = toISODate(d);
    setFromDate(weekAgo);
    setToDate(today);
    setVehicleFilter("");
    setAppliedFilters({
      fromDate: weekAgo,
      toDate: today,
      vehicleUid: "",
      productUid: "",
    });
    setFilterApplied(true);
  }, [activeReport, today]);

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

  // Direct state for overview date range; rangeKey just tracks which pill is highlighted.
  const [overviewFrom, setOverviewFromRaw] = useState(() => {
    const { from } = (STANDARD_PRESETS.find((r) => r.key === "month") ?? STANDARD_PRESETS[1]).getRange();
    return from;
  });
  const [overviewTo, setOverviewToRaw] = useState(() => {
    const { to } = (STANDARD_PRESETS.find((r) => r.key === "month") ?? STANDARD_PRESETS[1]).getRange();
    return to;
  });

  const setOverviewFrom = (val) => {
    setOverviewFromRaw(val);
    // Clear preset highlight when user types a custom date
    const matched = STANDARD_PRESETS.find((p) => { const r = p.getRange(); return r.from === val && r.to === overviewTo; });
    setRangeKey(matched?.key ?? "");
  };
  const setOverviewTo = (val) => {
    setOverviewToRaw(val);
    const matched = STANDARD_PRESETS.find((p) => { const r = p.getRange(); return r.from === overviewFrom && r.to === val; });
    setRangeKey(matched?.key ?? "");
  };

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

      {activeReport === "overview" && (
        <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--color-text-subtle)" }}>
            <Filter size={16} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Date Range</span>
          </div>
          <DateRangeBar
            presets={STANDARD_PRESETS}
            fromDate={overviewFrom}
            setFromDate={setOverviewFrom}
            toDate={overviewTo}
            setToDate={setOverviewTo}
            onPresetApply={(from, to) => {
              setOverviewFromRaw(from);
              setOverviewToRaw(to);
              const key = STANDARD_PRESETS.find(
                (p) => { const r = p.getRange(); return r.from === from && r.to === to; }
              )?.key ?? "";
              setRangeKey(key);
            }}
          />
        </Card>
      )}

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

          {/* Quick date presets for non-overview tabs — auto-apply on click */}
          <div style={{ marginTop: "var(--spacing-sm)", marginBottom: "var(--spacing-md)" }}>
            <DateRangeBar
              presets={STANDARD_PRESETS}
              fromDate={fromDate}
              setFromDate={(val) => { setFromDate(val); setRangeKey(""); }}
              toDate={toDate}
              setToDate={(val) => { setToDate(val); setRangeKey(""); }}
              onPresetApply={(from, to) => {
                setFromDate(from);
                setToDate(to);
                setAppliedFilters((prev) => ({ ...prev, fromDate: from, toDate: to }));
                setFilterApplied(true);
              }}
            />
          </div>

          <div
            className="reports-filters"
            style={{
              marginTop: 0,
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
          fromDate={overviewFrom}
          toDate={overviewTo}
        />
      )}

      {activeReport === "by-vehicle" && (
        <SalesByVehicleReport
          filterApplied={filterApplied}
          fromDate={appliedFilters.fromDate}
          toDate={appliedFilters.toDate}
          vehicleFilter={appliedFilters.vehicleUid || null}
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

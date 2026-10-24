import React, { useCallback, useEffect, useMemo, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Skeleton from "@shared/components/ui/Skeleton";
import { AlertCircle, ChevronDown, ChevronRight, Truck, User, Route as RouteIcon } from "lucide-react";
import api, { getSession } from "@/services/api";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import { fetchCompanyUnloads, fetchReasons } from "../context/dayCloseApi";
import { formatMoney, paymentStatusVariant } from "../utils/salesFormat";

// Daily Summary: pick a day and an active vehicle → its money, sales (with items) and returns
// (getdeliwheels_vehicledailyreport). Settling a trip (count, cash) is on the Trips page.

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Timestamps are UTC; older responses had no zone ("2026-10-21T17:15:55"), so mark those UTC before display
const formatTime = (utc) => {
  if (!utc) return "";
  const d = new Date(/Z$|[+-]\d\d:\d\d$/.test(utc) ? utc : `${utc}Z`);
  return Number.isNaN(d.getTime())
    ? utc
    : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const qty = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const th = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "0.75rem",
  color: "var(--color-text-subtle)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
  // Stays visible while an expanded list scrolls
  position: "sticky",
  top: 0,
  zIndex: 1,
  background: "var(--bg-body)",
};
const td = { padding: "12px 14px", whiteSpace: "nowrap" };
const sectionTitle = { fontSize: "var(--text-lg)", fontWeight: "600", margin: "var(--spacing-xl) 0 12px" };

// Every list shows all its rows inside a fixed-height box that scrolls (the header row stays visible)
const LIST_MAX_HEIGHT = "480px";

const useRowLimit = (rows) => {
  const reset = useCallback(() => {}, []);
  return { visible: rows, expanded: true, hasMore: false, toggle: reset, reset };
};

const ShowMore = ({ limit, total }) =>
  limit.hasMore ? (
    <button
      type="button"
      onClick={limit.toggle}
      style={{ width: "100%", padding: "10px", border: "none", borderTop: "1px solid var(--border-subtle)", background: "transparent", color: "var(--color-primary)", fontWeight: "600", cursor: "pointer" }}
    >
      {limit.expanded ? "Show less" : `Show all (${total})`}
    </button>
  ) : null;

const scrollBox = () => ({ overflowX: "auto", overflowY: "auto", maxHeight: LIST_MAX_HEIGHT });

const SummaryTile = ({ label, value, hint }) => (
  <Card>
    <div style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", fontWeight: "600" }}>{label}</div>
    <div style={{ fontSize: "1.35rem", fontWeight: "700", marginTop: "6px" }}>{value}</div>
    {hint && <div style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", marginTop: "2px" }}>{hint}</div>}
  </Card>
);

const EmptyRow = ({ colSpan, text }) => (
  <tr>
    <td colSpan={colSpan} style={{ ...td, textAlign: "center", color: "var(--color-text-subtle)", padding: "28px" }}>
      {text}
    </td>
  </tr>
);

const DailySummaryPage = () => {
  const { vehicles, vehiclesLoaded, fetchVehicles } = useDeliwheels();
  const [date, setDate] = useState(todayISO);
  const [selectedUid, setSelectedUid] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSales, setOpenSales] = useState({}); // saleUid → expanded
  const [refreshKey, setRefreshKey] = useState(0); // bumped after a close so sales show as paid

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
  }, [vehiclesLoaded, fetchVehicles]);

  const activeVehicles = useMemo(
    () =>
      vehicles
        .filter((v) => v.status !== "inactive")
        .sort((a, b) => (a.registration || "").localeCompare(b.registration || "")),
    [vehicles],
  );

  // Keep a vehicle selected: default to the first active one, and re-pick if it disappears
  useEffect(() => {
    if (activeVehicles.length === 0) return;
    if (!activeVehicles.some((v) => v.vehicle_uid === selectedUid)) {
      setSelectedUid(activeVehicles[0].vehicle_uid);
    }
  }, [activeVehicles, selectedUid]);

  useEffect(() => {
    if (!selectedUid || !date) return;
    const session = getSession();
    if (!session?.companyId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setOpenSales({});
    api
      .get(`/api/v1/deliwheels/reports/daily-summary/company/${session.companyId}/vehicle/${selectedUid}`, {
        params: { date },
      })
      .then(({ data }) => {
        if (!cancelled) setReport(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setReport(null);
        setError(
          e?.response?.status === 404
            ? "This vehicle was not found."
            : e?.response?.data?.message || "Failed to load the daily summary. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUid, date, refreshKey]);

  // The vehicle's unloads that day (stock taken off the vehicle, with a reason)
  const { products } = useGlobal();
  const [unloads, setUnloads] = useState([]);
  const [reasons, setReasons] = useState([]);
  useEffect(() => { fetchReasons().then(setReasons).catch(() => {}); }, []);
  useEffect(() => {
    if (!selectedUid || !date) return;
    let cancelled = false;
    fetchCompanyUnloads({ vehicleUid: selectedUid, fromDate: date, toDate: date })
      .then((rows) => { if (!cancelled) setUnloads(rows); })
      .catch(() => { if (!cancelled) setUnloads([]); });
    return () => { cancelled = true; };
  }, [selectedUid, date, refreshKey]);
  const productName = (uid) => {
    const p = (products || []).find((x) => (x.product_uid || x.productUid) === uid);
    return p?.product_name || p?.productName || "—";
  };
  const reasonName = (uid) => reasons.find((r) => r.uid === uid)?.name || "—";

  const totals = report?.totals || {};
  const vehicle = report?.vehicle || {};
  const sales = report?.sales || [];
  const returns = report?.returns || [];
  const salesLimit = useRowLimit(sales);
  const returnsLimit = useRowLimit(returns);
  const { reset: resetSales } = salesLimit;
  const { reset: resetReturns } = returnsLimit;

  // A new vehicle or day starts with the lists collapsed again
  useEffect(() => {
    resetSales();
    resetReturns();
  }, [selectedUid, date, resetSales, resetReturns]);

  return (
    <DeliwheelsLayout headerTitle="Daily Summary" headerSubtitle="One vehicle, one day">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "var(--spacing-xl)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>Daily Summary</h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Sales, stock and returns of one vehicle for the day — count, collect and close it here.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label htmlFor="daily-summary-vehicle" style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)", fontWeight: "600" }}>
            Vehicle
          </label>
          <select
            id="daily-summary-vehicle"
            value={selectedUid || ""}
            onChange={(e) => setSelectedUid(e.target.value)}
            disabled={activeVehicles.length === 0}
            style={{ padding: "8px 12px", border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "0.9rem", background: "var(--bg-card)", color: "var(--color-text)", minWidth: "200px", maxWidth: "100%" }}
          >
            {activeVehicles.length === 0 && <option value="">{vehiclesLoaded ? "No active vehicles" : "Loading…"}</option>}
            {activeVehicles.map((v) => (
              <option key={v.vehicle_uid} value={v.vehicle_uid}>
                {v.registration || "—"} · {v.driver || "Unassigned"}
              </option>
            ))}
          </select>
          <label htmlFor="daily-summary-date" style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)", fontWeight: "600" }}>
            Date
          </label>
          <input
            id="daily-summary-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "0.9rem", background: "var(--bg-card)", color: "var(--color-text)" }}
          />
        </div>
      </div>

      <div>
        {/* Detail */}
        <div style={{ minWidth: 0 }}>
          {!selectedUid ? (
            <Card>
              <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
                {vehiclesLoaded ? "No active vehicles to show." : "Loading vehicles…"}
              </div>
            </Card>
          ) : error ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", padding: "12px 16px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
              <AlertCircle size={16} /> {error}
            </div>
          ) : loading || !report ? (
            <Card>
              <Skeleton width="40%" height="22px" />
              <div style={{ marginTop: "16px" }}>
                <Skeleton width="100%" height="120px" />
              </div>
            </Card>
          ) : (
            <>
              {/* Vehicle header */}
              <Card>
                <div style={{ display: "flex", gap: "28px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Truck size={18} style={{ color: "var(--color-primary)" }} />
                    <span style={{ fontFamily: "monospace", fontWeight: "700", fontSize: "1.1rem" }}>{vehicle.vehicle_number || "—"}</span>
                    {vehicle.vehicle_name && <span style={{ color: "var(--color-text-subtle)" }}>{vehicle.vehicle_name}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User size={16} style={{ color: "var(--color-text-subtle)" }} />
                    {vehicle.driver_name || "Unassigned"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <RouteIcon size={16} style={{ color: "var(--color-text-subtle)" }} />
                    {vehicle.route_from ? `${vehicle.route_from} → ${vehicle.route_to}` : "No route"}
                  </div>
                </div>
              </Card>

              {/* Money summary */}
              <h3 style={sectionTitle}>Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
                <SummaryTile label="Revenue" value={`₹${formatMoney(totals.total_revenue)}`} hint={`${totals.sales_count || 0} sales · ${totals.shops_visited || 0} shops`} />
                <SummaryTile label="Cash + UPI" value={`₹${formatMoney(totals.total_collected)}`} />
                <SummaryTile label="Credit" value={`₹${formatMoney(totals.total_pending)}`} />
                <SummaryTile label="Cash" value={`₹${formatMoney(totals.total_cash)}`} />
                <SummaryTile label="UPI" value={`₹${formatMoney(totals.total_upi)}`} />
                <SummaryTile label="Credit" value={`₹${formatMoney(totals.total_credit)}`} />
                <SummaryTile label="Discount" value={`₹${formatMoney(totals.total_discount)}`} />
                <SummaryTile label="Returned" value={qty(totals.returned_qty)} hint={`₹${formatMoney(totals.return_value)}`} />
              </div>

              {/* Day: status, stock, count & close, unloads */}
              

              {/* Sales with items */}
              <h3 style={sectionTitle}>Sales ({sales.length})</h3>
              <Card padding="none">
                <div style={scrollBox(salesLimit)}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                        {["", "Time", "Invoice", "Shop", "Total", "Cash", "UPI", "Credit", "Status"].map((h, i) => (
                          <th key={`s-${i}`} style={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <EmptyRow colSpan={9} text="No sales on this day." />
                      ) : (
                        salesLimit.visible.map((s) => {
                          const open = !!openSales[s.sale_uid];
                          return (
                            <React.Fragment key={s.sale_uid}>
                              <tr
                                onClick={() => setOpenSales((p) => ({ ...p, [s.sale_uid]: !open }))}
                                style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}
                              >
                                <td style={{ ...td, width: "28px" }}>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                                <td style={td}>{formatTime(s.sale_date)}</td>
                                <td style={{ ...td, fontFamily: "monospace" }}>{s.invoice_no || "—"}</td>
                                <td style={td}>{s.shop_name || "—"}</td>
                                <td style={{ ...td, fontWeight: "600" }}>₹{formatMoney(s.grand_total)}</td>
                                <td style={td}>₹{formatMoney(s.cash_amount)}</td>
                                <td style={td}>₹{formatMoney(s.upi_amount)}</td>
                                <td style={td}>₹{formatMoney(s.credit_amount)}</td>
                                <td style={td}>
                                  <Badge variant={paymentStatusVariant(s.payment_status)}>{s.payment_status || "—"}</Badge>
                                  {s.payment_mode && <span style={{ marginLeft: "6px", color: "var(--color-text-subtle)", fontSize: "0.8rem" }}>{s.payment_mode}</span>}
                                </td>
                              </tr>
                              {open && (
                                <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                                  <td />
                                  <td colSpan={8} style={{ padding: "8px 14px 14px" }}>
                                    {(s.items || []).length === 0 ? (
                                      <span style={{ color: "var(--color-text-subtle)" }}>No items.</span>
                                    ) : (
                                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                        <thead>
                                          <tr>
                                            {["Product", "Qty", "Unit price", "Discount", "Tax", "Total"].map((h) => (
                                              <th key={h} style={{ ...th, padding: "6px 10px" }}>{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {s.items.map((it, i) => (
                                            <tr key={`${s.sale_uid}-${i}`}>
                                              <td style={{ ...td, padding: "6px 10px" }}>{it.product_name || "—"}</td>
                                              <td style={{ ...td, padding: "6px 10px" }}>{qty(it.quantity)}</td>
                                              <td style={{ ...td, padding: "6px 10px" }}>₹{formatMoney(it.unit_price)}</td>
                                              <td style={{ ...td, padding: "6px 10px" }}>₹{formatMoney(it.discount)}</td>
                                              <td style={{ ...td, padding: "6px 10px" }}>₹{formatMoney(it.tax_amount)}</td>
                                              <td style={{ ...td, padding: "6px 10px", fontWeight: "600" }}>₹{formatMoney(it.total_amount)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <ShowMore limit={salesLimit} total={sales.length} />
              </Card>

              {/* Unloads */}
              <h3 style={sectionTitle}>Unloads ({unloads.length})</h3>
              <Card padding="none">
                <div style={scrollBox()}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                      {["Product", "Qty", "Reason", "Note"].map((h) => <th key={h} style={th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {unloads.length === 0 ? (
                      <EmptyRow colSpan={4} text="No unloads on this day." />
                    ) : unloads.map((u) => (
                      <tr key={u.unloadedStockUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ ...td, fontWeight: "600" }}>{productName(u.productUid)}</td>
                        <td style={td}>{qty(u.quantity)}</td>
                        <td style={td}>{reasonName(u.reasonUid)}</td>
                        <td style={td}>{u.reasonNote || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </Card>

              {/* Returns */}
              <h3 style={sectionTitle}>Returns ({returns.length})</h3>
              <Card padding="none">
                <div style={scrollBox(returnsLimit)}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                        {["Product", "Shop", "Qty", "Value"].map((h) => (
                          <th key={h} style={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {returns.length === 0 ? (
                        <EmptyRow colSpan={4} text="No returns on this day." />
                      ) : (
                        returnsLimit.visible.map((r) => (
                          <tr key={r.returned_stock_uid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ ...td, fontWeight: "600" }}>{r.product_name || "—"}</td>
                            <td style={td}>{r.shop_name || "—"}</td>
                            <td style={td}>{qty(r.returned_qty)}</td>
                            <td style={td}>₹{formatMoney(r.return_value)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <ShowMore limit={returnsLimit} total={returns.length} />
              </Card>
            </>
          )}
        </div>
      </div>
    </DeliwheelsLayout>
  );
};

export default DailySummaryPage;

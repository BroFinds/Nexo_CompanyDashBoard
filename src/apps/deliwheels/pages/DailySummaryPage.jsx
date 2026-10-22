import React, { useEffect, useMemo, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Skeleton from "@shared/components/ui/Skeleton";
import { AlertCircle, ChevronDown, ChevronRight, Truck, User, Route as RouteIcon } from "lucide-react";
import api, { getSession } from "@/services/api";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { formatMoney, paymentStatusVariant } from "../utils/salesFormat";

// Daily Summary: pick a day and an active vehicle → its sales (with items), stock movement and
// returns for that day. All numbers come from one backend call (getdeliwheels_vehicledailyreport).

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// The DB sends UTC timestamps without a zone ("2026-10-21T17:15:55"); mark them UTC before display
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
};
const td = { padding: "12px 14px", whiteSpace: "nowrap" };
const sectionTitle = { fontSize: "var(--text-lg)", fontWeight: "600", margin: "var(--spacing-xl) 0 12px" };

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
  }, [selectedUid, date]);

  const totals = report?.totals || {};
  const vehicle = report?.vehicle || {};
  const stock = report?.stock || [];
  const sales = report?.sales || [];
  const returns = report?.returns || [];
  const stockTotals = stock.reduce(
    (t, r) => ({
      loaded: t.loaded + Number(r.loaded_value || 0),
      sold: t.sold + Number(r.sold_value || 0),
      closing: t.closing + Number(r.closing_value || 0),
    }),
    { loaded: 0, sold: 0, closing: 0 },
  );

  return (
    <DeliwheelsLayout headerTitle="Daily Summary" headerSubtitle="One vehicle, one day">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "var(--spacing-xl)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>Daily Summary</h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Pick a vehicle to see its sales, stock and returns for the day.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

      <div style={{ display: "flex", gap: "var(--spacing-lg)", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Vehicle list */}
        <Card padding="none" style={{ flex: "0 0 260px", maxWidth: "100%" }}>
          <div style={{ ...th, borderBottom: "1px solid var(--border-subtle)" }}>Active vehicles</div>
          {!vehiclesLoaded && activeVehicles.length === 0 ? (
            <div style={{ padding: "14px" }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height="40px" style={{ marginBottom: "8px" }} />
              ))}
            </div>
          ) : activeVehicles.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-subtle)" }}>No active vehicles.</div>
          ) : (
            activeVehicles.map((v) => {
              const selected = v.vehicle_uid === selectedUid;
              return (
                <button
                  key={v.vehicle_uid}
                  type="button"
                  onClick={() => setSelectedUid(v.vehicle_uid)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: selected ? "var(--color-primary-subtle)" : "transparent",
                    color: selected ? "var(--color-primary)" : "var(--color-text)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontWeight: "700" }}>{v.registration || "—"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>{v.driver || "Unassigned"}</div>
                </button>
              );
            })
          )}
        </Card>

        {/* Detail */}
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          {!selectedUid ? (
            <Card>
              <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
                Select a vehicle to see its daily summary.
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
                <SummaryTile label="Collected" value={`₹${formatMoney(totals.total_collected)}`} />
                <SummaryTile label="Pending" value={`₹${formatMoney(totals.total_pending)}`} />
                <SummaryTile label="Cash" value={`₹${formatMoney(totals.total_cash)}`} />
                <SummaryTile label="UPI" value={`₹${formatMoney(totals.total_upi)}`} />
                <SummaryTile label="Credit" value={`₹${formatMoney(totals.total_credit)}`} />
                <SummaryTile label="Discount" value={`₹${formatMoney(totals.total_discount)}`} />
                <SummaryTile label="Returned" value={qty(totals.returned_qty)} hint={`₹${formatMoney(totals.return_value)}`} />
              </div>

              {/* Stock */}
              <h3 style={sectionTitle}>Stock (wholesale value)</h3>
              <Card padding="none">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                        {["Product", "Old remaining", "Loaded", "Sold", "Remaining", "Returned"].map((h) => (
                          <th key={h} style={th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stock.length === 0 ? (
                        <EmptyRow colSpan={6} text="No stock on this vehicle for the day." />
                      ) : (
                        stock.map((r) => (
                          <tr key={r.product_uid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ ...td, fontWeight: "600" }}>{r.product_name || "—"}</td>
                            <td style={td}>{qty(r.old_remaining)}</td>
                            <td style={td}>{qty(r.loaded_qty)} <span style={{ color: "var(--color-text-subtle)" }}>· ₹{formatMoney(r.loaded_value)}</span></td>
                            <td style={td}>{qty(r.sold_qty)} <span style={{ color: "var(--color-text-subtle)" }}>· ₹{formatMoney(r.sold_value)}</span></td>
                            <td style={td}>{qty(r.closing_remaining)} <span style={{ color: "var(--color-text-subtle)" }}>· ₹{formatMoney(r.closing_value)}</span></td>
                            <td style={td}>{qty(r.returned_qty)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {stock.length > 0 && (
                      <tfoot>
                        <tr style={{ fontWeight: "700" }}>
                          <td style={td}>Total</td>
                          <td style={td} />
                          <td style={td}>₹{formatMoney(stockTotals.loaded)}</td>
                          <td style={td}>₹{formatMoney(stockTotals.sold)}</td>
                          <td style={td}>₹{formatMoney(stockTotals.closing)}</td>
                          <td style={td} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </Card>

              {/* Sales with items */}
              <h3 style={sectionTitle}>Sales ({sales.length})</h3>
              <Card padding="none">
                <div style={{ overflowX: "auto" }}>
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
                        sales.map((s) => {
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
              </Card>

              {/* Returns */}
              <h3 style={sectionTitle}>Returns ({returns.length})</h3>
              <Card padding="none">
                <div style={{ overflowX: "auto" }}>
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
                        returns.map((r) => (
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
              </Card>
            </>
          )}
        </div>
      </div>
    </DeliwheelsLayout>
  );
};

export default DailySummaryPage;

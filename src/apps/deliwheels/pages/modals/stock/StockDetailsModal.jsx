import React, { useState } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Truck, Calendar, Package, CheckCircle, Clock, IndianRupee } from "lucide-react";

const formatMoney = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
};

const formatTime = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
};

const StockDetailsModal = ({ delivery, logs, loading, error, onClose, products, onCompleteDelivery }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  if (!delivery) return null;

  const pct = delivery.totalQty > 0
    ? Math.min(100, Math.round((delivery.deliveredQty / delivery.totalQty) * 100))
    : 0;
  const barColor = pct === 100 ? "#16a34a" : pct >= 80 ? "#059669" : pct >= 40 ? "#2563eb" : "#d97706";

  // Compute per-entry cost from products list
  const entriesWithCost = (delivery.entries || []).map((entry) => {
    const product = (products || []).find(
      (p) => (p.product_uid || p.productUid) === entry.product_uid
    );
    const unitPrice = parseFloat(
      product?.general_price || product?.generalPrice || product?.price || 0
    );
    const rem = entry.remaining_quantity ?? entry.quantity;
    const delivered = Math.max(0, entry.quantity - rem);
    return { ...entry, unitPrice, totalCost: unitPrice * entry.quantity, deliveredCost: unitPrice * delivered, delivered, remaining: rem };
  });

  const totalCost = entriesWithCost.reduce((s, e) => s + e.totalCost, 0);
  const deliveredCost = entriesWithCost.reduce((s, e) => s + e.deliveredCost, 0);
  const hasPricing = entriesWithCost.some((e) => e.unitPrice > 0);

  return (
    <Modal isOpen={!!delivery} onClose={onClose} title="Delivery Details" maxWidth="820px">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>

        {/* Header: vehicle + date + status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--color-primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "monospace", fontWeight: "800", fontSize: "1.1rem" }}>
                {delivery.vehicle_number || "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "var(--color-text-subtle)", marginTop: "2px" }}>
                <Calendar size={12} /> {delivery.loaded_date || "—"}
              </div>
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "700",
            background: delivery.is_delivery_complete ? "#f0fdf4" : "#fffbeb",
            color: delivery.is_delivery_complete ? "#16a34a" : "#d97706",
            border: `1px solid ${delivery.is_delivery_complete ? "#86efac" : "#fde68a"}`,
          }}>
            {delivery.is_delivery_complete ? <CheckCircle size={13} /> : <Clock size={13} />}
            {delivery.is_delivery_complete ? "Delivery Complete" : "In Progress"}
          </span>
        </div>

        {/* Aggregate stats */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: "Products", value: delivery.entries.length, color: "var(--color-primary)" },
            { label: "Total Loaded", value: `${delivery.totalQty} units`, color: "var(--color-text)" },
            { label: "Delivered", value: `${delivery.deliveredQty} units`, color: "#16a34a" },
            { label: "Remaining", value: `${delivery.remainingQty} units`, color: delivery.remainingQty === 0 ? "#dc2626" : delivery.remainingQty < delivery.totalQty * 0.2 ? "#d97706" : "var(--color-text)" },
            ...(hasPricing ? [{ label: "Total Value", value: `₹${formatMoney(totalCost)}`, color: "var(--color-primary)" }] : []),
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, minWidth: "100px", padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-body)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>{label}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", fontFamily: "monospace", color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div style={{ background: "var(--bg-body)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Overall Delivery Progress
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: "800", color: barColor, fontFamily: "monospace" }}>
              {pct}%{pct === 100 ? " ✓" : ""}
            </span>
          </div>
          <div style={{ height: "10px", borderRadius: "999px", background: "var(--border-subtle)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px", background: barColor, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.72rem", color: "var(--color-text-subtle)" }}>
            <span>{delivery.deliveredQty} of {delivery.totalQty} units delivered</span>
            {hasPricing && deliveredCost > 0 && <span>₹{formatMoney(deliveredCost)} collected</span>}
          </div>
        </div>

        {/* Per-product breakdown */}
        <div>
          <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-subtle)", marginBottom: "10px" }}>
            Products Loaded ({delivery.entries.length})
          </h4>
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-body)" }}>
                  {["Product", "Loaded", "Delivered", "Remaining", ...(hasPricing ? ["Value"] : [])].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: h === "Product" ? "left" : "right", fontSize: "0.72rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entriesWithCost.map((e) => (
                  <tr key={e.stock_uid} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Package size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                        {e.product_name}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: "700" }}>{e.quantity}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: "700", color: e.delivered > 0 ? "#16a34a" : "var(--color-text-subtle)" }}>{e.delivered}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: "700", color: e.remaining === 0 ? "#dc2626" : e.remaining < e.quantity * 0.2 ? "#d97706" : "var(--color-text)" }}>{e.remaining}</td>
                    {hasPricing && (
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", color: "var(--color-text-subtle)", fontSize: "0.8rem" }}>
                        {e.unitPrice > 0 ? `₹${formatMoney(e.totalCost)}` : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery logs */}
        <div>
          <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-subtle)", marginBottom: "10px" }}>
            Delivery Log ({loading ? "…" : (logs || []).length} sales)
          </h4>
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflowX: "auto" }}>
            {loading ? (
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height="20px" />)}
              </div>
            ) : error ? (
              <div style={{ padding: "14px", background: "#fee2e2", color: "#991b1b", fontSize: "0.9rem" }}>{error}</div>
            ) : (
              <table style={{ width: "100%", minWidth: "540px", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-body)" }}>
                    {["Shop", "Product", "Date", "Invoice", "Qty", "Payment"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: h === "Qty" ? "right" : "left", fontSize: "0.72rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(logs || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "var(--color-text-subtle)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <Clock size={20} style={{ opacity: 0.4 }} />
                          No deliveries recorded yet.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (logs || []).map((log, i) => (
                      <tr key={log.saleUid || i} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "500" }}>{log.shopName || "—"}</td>
                        <td style={{ padding: "10px 12px", fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>{log.product_name || "—"}</td>
                        <td style={{ padding: "10px 12px", color: "var(--color-text-subtle)", whiteSpace: "nowrap" }}>{formatDate(log.saleDate)} {formatTime(log.saleDate)}</td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>{log.invoiceNo || "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: "700", color: "#16a34a" }}>{parseFloat(log.quantitySold || 0)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600", background: "var(--bg-body)", border: "1px solid var(--border-subtle)", color: "var(--color-text-subtle)" }}>
                            {log.paymentStatus || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {(logs || []).length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: "2px solid var(--border-subtle)", backgroundColor: "var(--bg-body)" }}>
                      <td colSpan={4} style={{ padding: "10px 12px", fontWeight: "700", fontSize: "0.8rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle size={14} style={{ color: "#16a34a" }} /> Total Delivered
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: "800", color: "#16a34a" }}>
                        {(logs || []).reduce((s, l) => s + parseFloat(l.quantitySold || 0), 0)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Complete Delivery — only shown when delivery is still in progress */}
          {!delivery.is_delivery_complete && onCompleteDelivery && (
            showConfirm ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#c2410c" }}>
                  Mark this delivery as complete?
                </span>
                <button
                  onClick={async () => {
                    setIsCompleting(true);
                    try {
                      await onCompleteDelivery(delivery.vehicle_uid);
                    } finally {
                      setIsCompleting(false);
                      setShowConfirm(false);
                    }
                  }}
                  disabled={isCompleting}
                  style={{
                    padding: "6px 14px", borderRadius: "var(--radius-sm)", fontSize: "0.82rem",
                    fontWeight: "700", background: "#16a34a", color: "#fff",
                    border: "none", cursor: isCompleting ? "not-allowed" : "pointer", opacity: isCompleting ? 0.6 : 1,
                  }}
                >
                  {isCompleting ? "Completing…" : "Yes, Complete"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isCompleting}
                  style={{ padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", fontWeight: "600", background: "transparent", color: "var(--color-text-subtle)", border: "1px solid var(--border-subtle)", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "9px 18px", borderRadius: "var(--radius-sm)", fontSize: "0.875rem",
                  fontWeight: "700", background: "#16a34a", color: "#fff",
                  border: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                }}
              >
                <CheckCircle size={15} /> Complete Delivery
              </button>
            )
          )}

          {delivery.is_delivery_complete && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#16a34a", fontWeight: "600" }}>
              <CheckCircle size={14} /> Delivery already completed
            </span>
          )}

          <Button onClick={onClose} style={{ marginLeft: "auto" }}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default StockDetailsModal;

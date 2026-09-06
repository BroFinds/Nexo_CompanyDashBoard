import React from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

const StatBox = ({ label, value, color }) => (
  <div
    style={{
      flex: 1,
      padding: "12px 16px",
      borderRadius: "var(--radius-sm)",
      background: "var(--bg-body)",
      border: "1px solid var(--border-subtle)",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: "0.7rem",
        fontWeight: "600",
        color: "var(--color-text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "1.4rem",
        fontWeight: "800",
        fontFamily: "monospace",
        color: color || "var(--color-text)",
      }}
    >
      {value}
    </div>
  </div>
);

const StockDetailsModal = ({ entry, logs, loading, error, onClose }) => {
  const total = entry?.quantity || 0;
  const delivered = entry?.delivered_quantity || 0;
  const remaining = entry?.remaining_quantity ?? total - delivered;

  const formatDate = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <Modal
      isOpen={!!entry}
      onClose={onClose}
      title="Stock Delivery Logs"
      maxWidth="760px"
    >
      {entry && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
          {/* Header info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
              <Package size={15} style={{ color: "var(--color-primary)" }} />
              {entry.product_name}
            </span>
            <span style={{ color: "var(--color-text-subtle)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "monospace", fontSize: "0.85rem" }}>
              <Truck size={14} style={{ color: "var(--color-text-subtle)" }} />
              {entry.vehicle_number}
            </span>
            <span style={{ color: "var(--color-text-subtle)" }}>·</span>
            <span style={{ color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>
              Loaded {entry.loaded_date}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <StatBox label="Total Loaded" value={total} />
            <StatBox
              label="Delivered"
              value={delivered}
              color={delivered > 0 ? "var(--color-success, #16a34a)" : "var(--color-text-subtle)"}
            />
            <StatBox
              label="Remaining"
              value={remaining}
              color={
                remaining === 0
                  ? "var(--color-error, #dc2626)"
                  : remaining < total * 0.2
                  ? "var(--color-warning, #d97706)"
                  : "var(--color-text)"
              }
            />
          </div>

          {/* Logs table */}
          <div>
            <h4
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-text-subtle)",
                marginBottom: "10px",
              }}
            >
              Delivery Log ({loading ? "…" : (logs || []).length} sales)
            </h4>

            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                overflowX: "auto",
              }}
            >
              {loading ? (
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} width="100%" height="20px" />
                  ))}
                </div>
              ) : error ? (
                <div
                  style={{
                    padding: "14px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    fontSize: "0.9rem",
                  }}
                >
                  {error}
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    minWidth: "480px",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-body)" }}>
                      {["Shop", "Date", "Invoice", "Qty Sold", "Payment"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            textAlign: h === "Qty Sold" ? "right" : "left",
                            fontSize: "0.72rem",
                            fontWeight: "600",
                            color: "var(--color-text-subtle)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            borderBottom: "1px solid var(--border-subtle)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(logs || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "28px",
                            textAlign: "center",
                            color: "var(--color-text-subtle)",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <Clock size={20} style={{ opacity: 0.4 }} />
                            No deliveries recorded yet for this stock entry.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (logs || []).map((log, i) => (
                        <tr
                          key={log.saleUid || i}
                          style={{ borderTop: "1px solid var(--border-subtle)" }}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: "500" }}>
                            {log.shopName || "—"}
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--color-text-subtle)" }}>
                            {formatDate(log.saleDate)}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              color: "var(--color-text-subtle)",
                            }}
                          >
                            {log.invoiceNo || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              textAlign: "right",
                              fontFamily: "monospace",
                              fontWeight: "700",
                              color: "var(--color-success, #16a34a)",
                            }}
                          >
                            {parseFloat(log.quantitySold || 0)}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontSize: "0.72rem",
                                fontWeight: "600",
                                background: "var(--bg-body)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--color-text-subtle)",
                              }}
                            >
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
                        <td colSpan={3} style={{ padding: "10px 12px", fontWeight: "700", fontSize: "0.8rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <CheckCircle size={14} style={{ color: "var(--color-success, #16a34a)" }} />
                            Total Delivered
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: "800",
                            color: "var(--color-success, #16a34a)",
                          }}
                        >
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

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StockDetailsModal;

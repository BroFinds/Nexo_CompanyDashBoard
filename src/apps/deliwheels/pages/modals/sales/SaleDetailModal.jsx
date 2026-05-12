import React from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import Skeleton from "@shared/components/ui/Skeleton";
import { Lock, Receipt, Truck, Calendar, User } from "lucide-react";
import {
  formatMoney,
  formatSaleDate,
  paymentStatusVariant,
} from "../../../utils/salesFormat";

const InfoCell = ({ icon, label, value, mono }) => (
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.7rem",
        color: "var(--color-text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        fontWeight: "600",
        marginBottom: "4px",
      }}
    >
      {icon} {label}
    </div>
    <div
      style={{
        fontWeight: "600",
        fontSize: "0.95rem",
        fontFamily: mono ? "monospace" : "inherit",
      }}
    >
      {value}
    </div>
  </div>
);

const TotalRow = ({ label, value, negative, emphasized }) => (
  <div
    style={{
      display: "flex",
      gap: "24px",
      width: "100%",
      maxWidth: "320px",
      justifyContent: "space-between",
      fontSize: emphasized ? "1.05rem" : "0.9rem",
      fontWeight: emphasized ? "800" : "500",
      color: emphasized ? "var(--color-text)" : "var(--color-text-subtle)",
      paddingTop: emphasized ? "6px" : 0,
      borderTop: emphasized ? "1px dashed var(--border-subtle)" : "none",
    }}
  >
    <span>{label}</span>
    <span style={{ fontFamily: "monospace" }}>
      {negative ? "−" : ""}₹{formatMoney(value)}
    </span>
  </div>
);

const SaleDetailModal = ({ sale, loading, error, onClose }) => {
  return (
    <Modal
      isOpen={!!sale}
      onClose={onClose}
      title={sale?.invoice_no ? `Invoice ${sale.invoice_no}` : "Sale Details"}
      maxWidth="720px"
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Skeleton width="100%" height="20px" />
          <Skeleton width="80%" height="16px" />
          <Skeleton width="60%" height="16px" />
          <Skeleton width="100%" height="120px" />
        </div>
      ) : error ? (
        <div
          style={{
            padding: "14px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      ) : sale ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--bg-body)",
              border: "1px solid var(--border-subtle)",
              color: "var(--color-text-subtle)",
              fontSize: "0.8rem",
            }}
          >
            <Lock size={14} /> Read-only view. Sales cannot be edited from this
            page.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <InfoCell
              icon={<User size={14} />}
              label="Shop Owner"
              value={sale.shop_owner_name || "—"}
            />
            <InfoCell
              icon={<Receipt size={14} />}
              label="Contact"
              value={sale.shop_contact_number || "—"}
            />
            <InfoCell
              icon={<Truck size={14} />}
              label="Vehicle"
              value={sale.vehicle_number || "—"}
              mono
            />
            <InfoCell
              icon={<Calendar size={14} />}
              label="Sale Date"
              value={formatSaleDate(sale.sale_date)}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Badge variant={paymentStatusVariant(sale.payment_status_text)}>
              {sale.payment_status_text || "—"}
            </Badge>
            <span
              style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}
            >
              Mode:{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {sale.payment_mode_text || "—"}
              </strong>
            </span>
          </div>

          <div>
            <h4
              style={{
                fontSize: "0.85rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-text-subtle)",
                marginBottom: "10px",
              }}
            >
              Products Sold ({sale.details?.length || 0})
            </h4>
            <div
              style={{
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                overflowX: "auto",
              }}
            >
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
                    {["Product", "Qty", "Unit ₹", "Disc ₹", "Tax ₹", "Total ₹"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 12px",
                            textAlign: h === "Product" ? "left" : "right",
                            fontSize: "0.72rem",
                            fontWeight: "600",
                            color: "var(--color-text-subtle)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(sale.details || []).map((d) => (
                    <tr
                      key={d.sale_detail_uid}
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
                    >
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: "600" }}>
                          {d.product_name || "—"}
                        </div>
                        {d.product_code && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-text-subtle)",
                              fontFamily: "monospace",
                            }}
                          >
                            {d.product_code}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: "600",
                        }}
                      >
                        {d.quantity}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatMoney(d.unit_price)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatMoney(d.discount)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatMoney(d.tax_amount)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontWeight: "700",
                        }}
                      >
                        {formatMoney(d.total_amount)}
                      </td>
                    </tr>
                  ))}
                  {(!sale.details || sale.details.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        No line items recorded for this sale.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              alignItems: "flex-end",
              paddingTop: "8px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <TotalRow label="Subtotal" value={sale.total_amount} />
            <TotalRow label="Discount" value={sale.discount_amount} negative />
            <TotalRow label="Tax" value={sale.tax_amount} />
            <TotalRow label="Grand Total" value={sale.grand_total} emphasized />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default SaleDetailModal;

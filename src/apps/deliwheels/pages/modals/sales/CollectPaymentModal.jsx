import React, { useState } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import { CheckCircle, CreditCard, User, Receipt, Calendar } from "lucide-react";
import { formatMoney, formatSaleDate, paymentStatusVariant } from "../../../utils/salesFormat";

const Row = ({ label, children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
    <span style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>{label}</span>
    <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{children}</span>
  </div>
);

const CollectPaymentModal = ({ sale, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!sale) return null;

  const isPaid = (sale.payment_status_text || "").toUpperCase() === "PAID";

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      await onConfirm(sale.sale_uid);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to collect payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!sale}
      onClose={onClose}
      title="Collect Payment"
      maxWidth="480px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
        {isPaid ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", background: "#dcfce7", border: "1px solid #86efac", color: "#15803d", fontSize: "0.875rem", fontWeight: "600" }}>
            <CheckCircle size={16} /> Payment already collected for this sale.
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "8px", background: "#fef9c3", border: "1px solid #fde047", color: "#854d0e", fontSize: "0.875rem" }}>
            <CreditCard size={16} /> Confirm that payment has been received for this sale.
          </div>
        )}

        <div style={{ background: "var(--bg-body)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", padding: "0 14px" }}>
          <Row label={<><User size={13} style={{ display: "inline", marginRight: 4 }} />Shop Owner</>}>
            {sale.shop_owner_name || "—"}
          </Row>
          <Row label={<><Receipt size={13} style={{ display: "inline", marginRight: 4 }} />Invoice</>}>
            <span style={{ fontFamily: "monospace" }}>{sale.invoice_no || "—"}</span>
          </Row>
          <Row label={<><Calendar size={13} style={{ display: "inline", marginRight: 4 }} />Sale Date</>}>
            {formatSaleDate(sale.sale_date)}
          </Row>
          <Row label="Payment Mode">
            <span style={{ textTransform: "capitalize" }}>{sale.payment_mode_text || "—"}</span>
          </Row>
          <Row label="Current Status">
            <Badge variant={paymentStatusVariant(sale.payment_status_text)}>
              {sale.payment_status_text || "—"}
            </Badge>
          </Row>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>Grand Total</span>
            <span style={{ fontFamily: "monospace", fontWeight: "800", fontSize: "1.1rem" }}>₹{formatMoney(sale.grand_total)}</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {!isPaid && (
            <Button
              onClick={handleConfirm}
              disabled={loading}
              style={{ background: "#16a34a", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <CheckCircle size={15} />
              {loading ? "Confirming…" : "Confirm Payment Collected"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CollectPaymentModal;

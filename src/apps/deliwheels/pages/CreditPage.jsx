import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import { useCredit } from "../context/useCredit";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { CreditCard, AlertCircle, Trash2, Plus, ChevronRight, X } from "lucide-react";

const fmt = (n) => `₹${parseFloat(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
};

// wa.me needs the number with the country code; a 10-digit number is taken as Indian
const waNumber = (raw) => {
  const digits = String(raw ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
};

// Opens WhatsApp with a reminder of the pending amount, ready for the admin to send
const reminderLink = (shop) => {
  const number = waNumber(shop.shopContactNumber);
  if (!number) return null;
  const name = shop.shopOwnerName || shop.shopName;
  const text = `Hello ${name}, this is a reminder that ${fmt(shop.remainingCredit)} is pending for ${shop.shopName}. `
    + "Please clear it at the earliest. Thank you.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.82 9.82 0 0 1-1.5-5.24c0-5.42 4.42-9.84 9.85-9.84 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.96c0 5.43-4.42 9.84-9.86 9.84zm8.38-18.22A11.75 11.75 0 0 0 12.04.1C5.5.1.17 5.42.17 11.97c0 2.09.55 4.13 1.59 5.93L.07 24l6.25-1.64a11.84 11.84 0 0 0 5.71 1.46h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.48-8.39z" />
  </svg>
);

// Green WhatsApp button; greyed out when the shop has no usable phone number
function WhatsAppButton({ shop, size = 16, padding = "6px" }) {
  const link = reminderLink(shop);
  return (
    <a
      href={link ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { e.stopPropagation(); if (!link) e.preventDefault(); }}
      title={link ? `Send a WhatsApp reminder to ${shop.shopOwnerName || shop.shopName}` : "No valid phone number for this shop"}
      aria-disabled={!link}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", padding,
        borderRadius: "var(--radius-sm)", color: link ? "#fff" : "var(--color-text-subtle)",
        background: link ? "#25D366" : "var(--bg-body)", cursor: link ? "pointer" : "not-allowed",
        opacity: link ? 1 : 0.6, textDecoration: "none",
      }}
    >
      <WhatsAppIcon size={size} />
    </a>
  );
}

export default function CreditPage() {
  const {
    creditSummary, creditSales, creditPayments,
    isLoadingCredit, isLoadingDetail, creditError,
    fetchCreditSummary, fetchCreditDetail, addPayment, deletePayment,
  } = useCredit();

  const [selectedShop, setSelectedShop] = useState(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchCreditSummary(); }, [fetchCreditSummary]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setShowPayForm(false);
    setPayAmount("");
    setPayNote("");
    setFormError("");
    fetchCreditDetail(shop.shopUid);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setFormError("");
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { setFormError("Enter a valid amount greater than 0"); return; }
    setIsSubmitting(true);
    try {
      await addPayment(selectedShop.shopUid, amt, payNote);
      setShowPayForm(false);
      setPayAmount("");
      setPayNote("");
      // Refresh selected shop in summary
      fetchCreditSummary().then(() => {});
    } catch (e) {
      setFormError(e?.response?.data?.message ?? "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentUid) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await deletePayment(paymentUid, selectedShop.shopUid);
    } catch (e) {
      alert(e?.response?.data?.message ?? "Failed to delete payment");
    }
  };

  const totalOutstanding = creditSummary.reduce((s, c) => s + parseFloat(c.remainingCredit ?? 0), 0);

  return (
    <DeliwheelsLayout headerTitle="Credits" headerSubtitle="Manage outstanding credit balances">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-xl)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>Credits</h2>
          <p style={{ color: "var(--color-text-subtle)" }}>Track and collect outstanding payments from credit sales.</p>
        </div>
        {totalOutstanding > 0 && (
          <div style={{ textAlign: "right", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", padding: "10px 16px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Outstanding</div>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#dc2626", fontFamily: "monospace" }}>{fmt(totalOutstanding)}</div>
          </div>
        )}
      </div>

      {creditError && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fee2e2", color: "#991b1b", padding: "14px 16px", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-lg)" }}>
          <AlertCircle size={16} />
          {creditError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selectedShop ? "1fr 1.6fr" : "1fr", gap: "var(--spacing-xl)", alignItems: "start" }}>
        {/* Shop list */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>Shops with Credit</span>
            <button onClick={fetchCreditSummary} style={{ fontSize: "0.75rem", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Refresh</button>
          </div>

          {isLoadingCredit ? (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} width="100%" height="56px" />)}
            </div>
          ) : creditSummary.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-subtle)" }}>
              <CreditCard size={28} style={{ opacity: 0.3, margin: "0 auto 10px" }} />
              <p style={{ fontWeight: "600" }}>No outstanding credit</p>
              <p style={{ fontSize: "0.85rem" }}>Credit sales will appear here automatically.</p>
            </div>
          ) : (
            creditSummary.map((shop) => (
              <div
                key={shop.shopUid}
                onClick={() => handleSelectShop(shop)}
                style={{
                  padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)",
                  background: selectedShop?.shopUid === shop.shopUid ? "var(--color-primary-subtle)" : "transparent",
                  transition: "background 0.15s",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{shop.shopName}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-subtle)", marginTop: "2px" }}>
                    Total: {fmt(shop.totalCredit)} · Paid: {fmt(shop.paidAmount)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontWeight: "800", fontFamily: "monospace", fontSize: "0.95rem",
                    color: parseFloat(shop.remainingCredit) > 0 ? "#dc2626" : "#16a34a",
                  }}>
                    {fmt(shop.remainingCredit)}
                  </span>
                  {parseFloat(shop.remainingCredit) > 0 && <WhatsAppButton shop={shop} size={14} padding="5px" />}
                  <ChevronRight size={14} style={{ color: "var(--color-text-subtle)" }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selectedShop && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
            {/* Shop header */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "4px" }}>{selectedShop.shopName}</h3>
                  <div style={{ display: "flex", gap: "20px", fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>
                    <span>Credit Sales: <strong style={{ color: "var(--color-text)" }}>{fmt(selectedShop.totalCredit)}</strong></span>
                    <span>Paid: <strong style={{ color: "#16a34a" }}>{fmt(selectedShop.paidAmount)}</strong></span>
                    <span>Outstanding: <strong style={{ color: "#dc2626" }}>{fmt(selectedShop.remainingCredit)}</strong></span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {parseFloat(selectedShop.remainingCredit) > 0 && <WhatsAppButton shop={selectedShop} size={18} padding="8px" />}
                  <Button onClick={() => { setShowPayForm(!showPayForm); setFormError(""); }} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                    <Plus size={14} /> Record Payment
                  </Button>
                  <button onClick={() => setSelectedShop(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-subtle)" }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Payment form */}
              {showPayForm && (
                <form onSubmit={handleAddPayment} style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 140px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-subtle)", display: "block", marginBottom: "4px" }}>Amount (₹)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.9rem", outline: "none" }}
                      />
                    </div>
                    <div style={{ flex: "2 1 200px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-subtle)", display: "block", marginBottom: "4px" }}>Note (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Cash collected on visit"
                        value={payNote}
                        onChange={(e) => setPayNote(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.9rem", outline: "none" }}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} style={{ alignSelf: "flex-end" }}>
                      {isSubmitting ? "Saving…" : "Save"}
                    </Button>
                  </div>
                  {formError && <p style={{ marginTop: "6px", fontSize: "0.8rem", color: "#dc2626" }}>{formError}</p>}
                </form>
              )}
            </div>

            {isLoadingDetail ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[1, 2].map((i) => <Skeleton key={i} width="100%" height="80px" />)}
              </div>
            ) : (
              <>
                {/* Credit Sales */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-subtle)" }}>
                    Credit Sales ({creditSales.length})
                  </div>
                  {creditSales.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>No credit sales found.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-body)" }}>
                          {["Date", "Invoice", "Amount"].map((h) => (
                            <th key={h} style={{ padding: "8px 16px", textAlign: h === "Amount" ? "right" : "left", fontSize: "0.72rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-subtle)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {creditSales.map((s, i) => (
                          <tr key={s.saleUid ?? i} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "10px 16px" }}>{fmtDate(s.saleDate)}</td>
                            <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>{s.invoiceNo || "—"}</td>
                            <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: "700", color: "#dc2626" }}>{fmt(s.creditAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: "2px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                          <td colSpan={2} style={{ padding: "10px 16px", fontWeight: "700", fontSize: "0.8rem" }}>Total Credit</td>
                          <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: "800", color: "#dc2626", fontFamily: "monospace" }}>
                            {fmt(creditSales.reduce((s, c) => s + parseFloat(c.creditAmount ?? 0), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>

                {/* Payment History */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-subtle)" }}>
                    Payment History ({creditPayments.length})
                  </div>
                  {creditPayments.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>No payments recorded yet.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-body)" }}>
                          {["Date", "Note", "Amount", ""].map((h, i) => (
                            <th key={i} style={{ padding: "8px 16px", textAlign: h === "Amount" ? "right" : "left", fontSize: "0.72rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border-subtle)", width: h === "" ? "40px" : "auto" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {creditPayments.map((p, i) => (
                          <tr key={p.paymentUid ?? i} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "10px 16px" }}>{fmtDate(p.paymentDate)}</td>
                            <td style={{ padding: "10px 16px", color: "var(--color-text-subtle)" }}>{p.note || "—"}</td>
                            <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: "700", color: "#16a34a" }}>{fmt(p.amount)}</td>
                            <td style={{ padding: "10px 16px", textAlign: "center" }}>
                              <button
                                onClick={() => handleDeletePayment(p.paymentUid)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "4px" }}
                                title="Delete payment"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: "2px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                          <td colSpan={2} style={{ padding: "10px 16px", fontWeight: "700", fontSize: "0.8rem" }}>Total Paid</td>
                          <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: "800", color: "#16a34a", fontFamily: "monospace" }}>
                            {fmt(creditPayments.reduce((s, p) => s + parseFloat(p.amount ?? 0), 0))}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DeliwheelsLayout>
  );
}

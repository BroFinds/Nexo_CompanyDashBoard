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
                <div style={{ display: "flex", gap: "8px" }}>
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
                            <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: "700", color: "#dc2626" }}>{fmt(s.grandTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: "2px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                          <td colSpan={2} style={{ padding: "10px 16px", fontWeight: "700", fontSize: "0.8rem" }}>Total Credit</td>
                          <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: "800", color: "#dc2626", fontFamily: "monospace" }}>
                            {fmt(creditSales.reduce((s, c) => s + parseFloat(c.grandTotal ?? 0), 0))}
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

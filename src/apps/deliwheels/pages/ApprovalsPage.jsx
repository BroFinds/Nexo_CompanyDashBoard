import React, { useCallback, useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { AlertCircle, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { acceptApproval, errorMessage, fetchApprovals, fetchReasons } from "../context/dayCloseApi";
import { formatMoney } from "../utils/salesFormat";

// Records waiting for the admin: synced from the app after their day was closed, or sent by the driver
// through Fix Sale. Accepting puts a record into effect on its own day (a correction replaces the original,
// a cancellation switches it off); that day's stock and the following days recalculate.

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
  background: "var(--bg-body)",
};
const td = { padding: "12px 14px", whiteSpace: "nowrap" };
const sectionTitle = { fontSize: "var(--text-lg)", fontWeight: "600", margin: "var(--spacing-xl) 0 12px" };

const formatDay = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const kindOf = (item) =>
  item.cancellation ? { text: "Cancellation", variant: "danger" }
    : item.correctsUid ? { text: "Correction", variant: "warning" }
      : { text: "New", variant: "default" };

const EmptyRow = ({ colSpan, text }) => (
  <tr>
    <td colSpan={colSpan} style={{ ...td, textAlign: "center", color: "var(--color-text-subtle)", padding: "28px" }}>
      {text}
    </td>
  </tr>
);

const ApprovalsPage = () => {
  const [data, setData] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState({}); // uid → true
  const [openSales, setOpenSales] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchApprovals());
    } catch (e) {
      setError(errorMessage(e, "Failed to load approvals. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetchReasons().then(setReasons).catch(() => setReasons([]));
  }, [load]);

  const reasonName = (uid) => reasons.find((r) => r.uid === uid)?.name || "—";

  const accept = async (kind, uid) => {
    setAccepting((p) => ({ ...p, [uid]: true }));
    setError("");
    try {
      await acceptApproval(kind, uid);
      await load();
    } catch (e) {
      setError(errorMessage(e, "Failed to accept. Please try again."));
    } finally {
      setAccepting((p) => ({ ...p, [uid]: false }));
    }
  };

  const acceptButton = (kind, uid) => (
    <Button onClick={() => accept(kind, uid)} disabled={!!accepting[uid]}>
      <CheckCircle2 size={16} /> {accepting[uid] ? "Accepting…" : "Accept"}
    </Button>
  );

  const sales = data?.sales || [];
  const returns = data?.returns || [];
  const unloads = data?.unloads || [];
  const total = sales.length + returns.length + unloads.length;

  const stockTable = (rows, kind, withShop) => (
    <Card padding="none">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Day", "Vehicle", "Type", "Product", ...(withShop ? ["Shop"] : []), "Qty", "Reason", ""].map((h, i) => (
                <th key={`${kind}-${i}`} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={withShop ? 8 : 7} text="Nothing waiting." />
            ) : (
              rows.map((r) => {
                const k = kindOf(r);
                return (
                  <tr key={r.uid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={td}>{formatDay(r.businessDate)}</td>
                    <td style={{ ...td, fontFamily: "monospace" }}>{r.vehicleNumber || "—"}</td>
                    <td style={td}><Badge variant={k.variant}>{k.text}</Badge></td>
                    <td style={{ ...td, fontWeight: "600" }}>{r.productName || "—"}</td>
                    {withShop && <td style={td}>{r.shopName || "—"}</td>}
                    <td style={td}>{r.quantity != null ? qty(r.quantity) : "—"}</td>
                    <td style={td}>
                      {reasonName(r.reasonUid)}
                      {r.reasonNote && <span style={{ color: "var(--color-text-subtle)" }}> · {r.reasonNote}</span>}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>{acceptButton(kind, r.uid)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <DeliwheelsLayout headerTitle="Approvals" headerSubtitle="Records for closed days">
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>
          Approvals{data && ` (${total})`}
        </h2>
        <p style={{ color: "var(--color-text-subtle)" }}>
          Sales, returns and unloads that reached the server after their day was closed, or were sent by a driver
          with Fix Sale. Accepting counts them on their own day.
        </p>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", marginBottom: "16px", padding: "12px 16px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && !data ? (
        <Card>
          <Skeleton width="40%" height="22px" />
          <div style={{ marginTop: "16px" }}><Skeleton width="100%" height="120px" /></div>
        </Card>
      ) : (
        <>
          <h3 style={{ ...sectionTitle, marginTop: 0 }}>Sales ({sales.length})</h3>
          <Card padding="none">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {["", "Day", "Vehicle", "Type", "Invoice", "Shop", "Total", "Cash", "UPI", "Credit", ""].map((h, i) => (
                      <th key={`s-${i}`} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <EmptyRow colSpan={11} text="Nothing waiting." />
                  ) : (
                    sales.map((s) => {
                      const k = kindOf(s);
                      const open = !!openSales[s.saleUid];
                      return (
                        <React.Fragment key={s.saleUid}>
                          <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ ...td, width: "28px", cursor: "pointer" }} onClick={() => setOpenSales((p) => ({ ...p, [s.saleUid]: !open }))}>
                              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </td>
                            <td style={td}>{formatDay(s.businessDate)}</td>
                            <td style={{ ...td, fontFamily: "monospace" }}>{s.vehicleNumber || "—"}</td>
                            <td style={td}><Badge variant={k.variant}>{k.text}</Badge></td>
                            <td style={{ ...td, fontFamily: "monospace" }}>{s.invoiceNo || "—"}</td>
                            <td style={td}>{s.shopName || "—"}</td>
                            <td style={{ ...td, fontWeight: "600" }}>₹{formatMoney(s.grandTotal)}</td>
                            <td style={td}>₹{formatMoney(s.cashAmount)}</td>
                            <td style={td}>₹{formatMoney(s.upiAmount)}</td>
                            <td style={td}>₹{formatMoney(s.creditAmount)}</td>
                            <td style={{ ...td, textAlign: "right" }}>{acceptButton("SALE", s.saleUid)}</td>
                          </tr>
                          {open && (
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-body)" }}>
                              <td />
                              <td colSpan={10} style={{ padding: "8px 14px 14px" }}>
                                {s.cancellation ? (
                                  <span style={{ color: "var(--color-text-subtle)" }}>Cancels the original sale.</span>
                                ) : (s.lines || []).length === 0 ? (
                                  <span style={{ color: "var(--color-text-subtle)" }}>No items.</span>
                                ) : (
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                    <thead>
                                      <tr>
                                        {["Product", "Qty", "Unit price", "Total"].map((h) => (
                                          <th key={h} style={{ ...th, padding: "6px 10px" }}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {s.lines.map((l, i) => (
                                        <tr key={`${s.saleUid}-${i}`}>
                                          <td style={{ ...td, padding: "6px 10px" }}>{l.productName || "—"}</td>
                                          <td style={{ ...td, padding: "6px 10px" }}>{qty(l.quantity)}</td>
                                          <td style={{ ...td, padding: "6px 10px" }}>₹{formatMoney(l.unitPrice)}</td>
                                          <td style={{ ...td, padding: "6px 10px", fontWeight: "600" }}>₹{formatMoney(l.totalAmount)}</td>
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

          <h3 style={sectionTitle}>Returns ({returns.length})</h3>
          {stockTable(returns, "RETURN", true)}

          <h3 style={sectionTitle}>Unloads ({unloads.length})</h3>
          {stockTable(unloads, "UNLOAD", false)}
        </>
      )}
    </DeliwheelsLayout>
  );
};

export default ApprovalsPage;

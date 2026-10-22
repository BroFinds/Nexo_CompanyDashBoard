import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import Modal from "@shared/components/ui/Modal";
import Skeleton from "@shared/components/ui/Skeleton";
import { AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import {
  closeVehicleDay,
  correctCount,
  errorMessage,
  fetchReasons,
  fetchUnloads,
  fetchVehicleDay,
} from "../context/dayCloseApi";

// Close Day inside the Daily Summary: the vehicle's day status, its stock (opening + loaded − sold − unloaded
// = expected leftover), counting and closing (which also collects the day's cash), count corrections after
// the close, and the day's unloads (made by the driver in the app). Figures come from the backend.

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
const td = { padding: "10px 14px", whiteSpace: "nowrap" };
const sectionTitle = { fontSize: "var(--text-lg)", fontWeight: "600", margin: "var(--spacing-xl) 0 12px" };
const inputStyle = {
  padding: "6px 10px",
  border: "1px solid var(--border-subtle)",
  borderRadius: "6px",
  fontSize: "0.9rem",
  background: "var(--bg-card)",
  color: "var(--color-text)",
};
const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-subtle)", marginBottom: "4px" };

const statusVariant = { Open: "default", "Auto Closed": "warning", Closed: "success" };

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const ErrorBox = ({ text }) =>
  text ? (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", margin: "12px 0", padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
      <AlertCircle size={16} /> {text}
    </div>
  ) : null;

const ReasonSelect = ({ reasons, value, onChange, id }) => (
  <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, minWidth: "130px" }}>
    <option value="">Reason…</option>
    {reasons.map((r) => (
      <option key={r.uid} value={r.uid}>{r.name}</option>
    ))}
  </select>
);

const DayCloseSection = ({ vehicleUid, date, onClosed }) => {
  const [day, setDay] = useState(null);
  const [unloads, setUnloads] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Counting mode: productUid → { counted, reasonUid, reasonNote }
  const [counting, setCounting] = useState(false);
  const [counts, setCounts] = useState({});
  const [closing, setClosing] = useState(false);

  const [correcting, setCorrecting] = useState(null); // closing count being corrected

  const load = useCallback(async () => {
    if (!vehicleUid || !date) return;
    setLoading(true);
    setError("");
    try {
      const [d, u] = await Promise.all([fetchVehicleDay(vehicleUid, date), fetchUnloads(vehicleUid, date)]);
      setDay(d);
      setUnloads(u);
    } catch (e) {
      setDay(null);
      setUnloads([]);
      setError(errorMessage(e, "Failed to load the day. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [vehicleUid, date]);

  useEffect(() => {
    setCounting(false);
    setCounts({});
    load();
  }, [load]);

  useEffect(() => {
    fetchReasons().then(setReasons).catch(() => setReasons([]));
  }, []);

  const reasonName = useCallback((uid) => reasons.find((r) => r.uid === uid)?.name || "—", [reasons]);
  const stock = day?.stock || [];
  const countsByProduct = useMemo(
    () => Object.fromEntries((day?.counts || []).map((c) => [c.productUid, c])),
    [day],
  );
  const isClosed = day?.status === "Closed";
  const isOpen = day?.status === "Open";

  const startCounting = () => {
    setCounts(Object.fromEntries(stock.map((l) => [l.productUid, { counted: String(l.available), reasonUid: "", reasonNote: "" }])));
    setError("");
    setCounting(true);
  };

  const changed = (line) => {
    const c = counts[line.productUid];
    return c && c.counted !== "" && Number(c.counted) !== Number(line.available);
  };

  const submitClose = async () => {
    for (const line of stock) {
      const c = counts[line.productUid];
      if (!c || c.counted === "" || Number.isNaN(Number(c.counted)) || Number(c.counted) < 0) {
        setError(`Enter the count for ${line.productName || "every product"} (zero or more).`);
        return;
      }
      if (changed(line) && !c.reasonUid) {
        setError(`Choose a reason for the changed count of ${line.productName || "a product"}.`);
        return;
      }
    }
    setClosing(true);
    setError("");
    try {
      const payload = stock.map((line) => {
        const c = counts[line.productUid];
        return changed(line)
          ? { productUid: line.productUid, countedQty: Number(c.counted), reasonUid: c.reasonUid, reasonNote: c.reasonNote || null }
          : { productUid: line.productUid, countedQty: Number(c.counted) };
      });
      const d = await closeVehicleDay(vehicleUid, date, payload);
      setDay(d);
      setCounting(false);
      onClosed?.();
    } catch (e) {
      setError(errorMessage(e, "Failed to close the day. Please try again."));
    } finally {
      setClosing(false);
    }
  };

  if (loading && !day) {
    return (
      <Card>
        <Skeleton width="30%" height="20px" />
        <div style={{ marginTop: "12px" }}><Skeleton width="100%" height="100px" /></div>
      </Card>
    );
  }
  if (!day) return <ErrorBox text={error} />;

  const productName = (uid) => stock.find((l) => l.productUid === uid)?.productName || "—";
  const columns = ["Product", "Opening", "Loaded", "Sold", "Unloaded", "Returned", "Expected"];

  return (
    <>
      {/* Day status + close */}
      <h3 style={sectionTitle}>Day</h3>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Badge variant={statusVariant[day.status] || "neutral"}>{day.status}</Badge>
            {isClosed && (
              <span style={{ color: "var(--color-text-subtle)", fontSize: "0.9rem" }}>
                Closed {formatTime(day.closedOn)} · cash collected
              </span>
            )}
            {day.status === "Auto Closed" && (
              <span style={{ color: "var(--color-text-subtle)", fontSize: "0.9rem" }}>
                The day ended without a close. Count the stock and collect the cash to settle it.
              </span>
            )}
            {isOpen && (
              <span style={{ color: "var(--color-text-subtle)", fontSize: "0.9rem" }}>
                Selling is open. Closing counts the stock, collects the cash and locks the day.
              </span>
            )}
          </div>
          {!isClosed && !counting && (
            <Button onClick={startCounting}>
              <Lock size={16} /> Count &amp; close day
            </Button>
          )}
          {counting && (
            <div style={{ display: "flex", gap: "8px" }}>
              <Button variant="secondary" onClick={() => { setCounting(false); setError(""); }} disabled={closing}>
                Cancel
              </Button>
              <Button onClick={submitClose} disabled={closing}>
                <CheckCircle2 size={16} /> {closing ? "Closing…" : "Collect cash & close"}
              </Button>
            </div>
          )}
        </div>
        <ErrorBox text={error} />
      </Card>

      {/* Stock */}
      <h3 style={sectionTitle}>Stock{stock.length > 0 && ` · ${stock.length} products`}</h3>
      <Card padding="none">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {columns.map((h) => <th key={h} style={th}>{h}</th>)}
                {(counting || isClosed) && <th style={th}>Counted</th>}
                {counting && <th style={th}>Reason</th>}
                {isClosed && <th style={th}>Difference</th>}
                {isClosed && <th style={th}>Reason</th>}
                {isClosed && <th style={th} />}
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 4} style={{ ...td, textAlign: "center", color: "var(--color-text-subtle)", padding: "28px" }}>
                    No stock on this vehicle for the day.
                  </td>
                </tr>
              ) : (
                stock.map((l) => {
                  const c = counts[l.productUid];
                  const saved = countsByProduct[l.productUid];
                  const negative = Number(l.available) < 0;
                  return (
                    <tr key={l.productUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ ...td, fontWeight: "600" }}>{l.productName || "—"}</td>
                      <td style={td}>{qty(l.opening)}</td>
                      <td style={td}>{qty(l.loaded)}</td>
                      <td style={td}>{qty(l.sold)}</td>
                      <td style={td}>{qty(l.unloaded)}</td>
                      <td style={td}>{qty(l.returned)}</td>
                      <td style={{ ...td, fontWeight: "700", color: negative ? "#dc2626" : undefined }}>{qty(l.available)}</td>
                      {counting && (
                        <>
                          <td style={td}>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              aria-label={`Counted ${l.productName || ""}`}
                              value={c?.counted ?? ""}
                              onChange={(e) => setCounts((p) => ({ ...p, [l.productUid]: { ...p[l.productUid], counted: e.target.value } }))}
                              style={{ ...inputStyle, width: "90px" }}
                            />
                          </td>
                          <td style={td}>
                            {changed(l) ? (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <ReasonSelect
                                  reasons={reasons}
                                  value={c.reasonUid}
                                  onChange={(v) => setCounts((p) => ({ ...p, [l.productUid]: { ...p[l.productUid], reasonUid: v } }))}
                                />
                                <input
                                  placeholder="Note (optional)"
                                  value={c.reasonNote}
                                  onChange={(e) => setCounts((p) => ({ ...p, [l.productUid]: { ...p[l.productUid], reasonNote: e.target.value } }))}
                                  style={{ ...inputStyle, width: "160px" }}
                                />
                              </div>
                            ) : (
                              <span style={{ color: "var(--color-text-subtle)" }}>—</span>
                            )}
                          </td>
                        </>
                      )}
                      {isClosed && (
                        <>
                          <td style={{ ...td, fontWeight: "700" }}>{saved ? qty(saved.countedQty) : "—"}</td>
                          <td style={{ ...td, color: saved && Number(saved.difference) !== 0 ? "#dc2626" : "var(--color-text-subtle)" }}>
                            {saved && saved.difference != null ? (Number(saved.difference) > 0 ? "+" : "") + qty(saved.difference) : "—"}
                          </td>
                          <td style={td}>
                            {saved?.reasonUid ? reasonName(saved.reasonUid) : "—"}
                            {saved?.reasonNote && <span style={{ color: "var(--color-text-subtle)" }}> · {saved.reasonNote}</span>}
                          </td>
                          <td style={td}>
                            {saved && (
                              <button
                                type="button"
                                onClick={() => setCorrecting(saved)}
                                style={{ border: "none", background: "transparent", color: "var(--color-primary)", fontWeight: "600", cursor: "pointer" }}
                              >
                                Correct
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Unloads */}
      <h3 style={sectionTitle}>Unloads ({unloads.length})</h3>
      <Card padding="none">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Product", "Qty", "Reason", "Note"].map((h) => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {unloads.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...td, textAlign: "center", color: "var(--color-text-subtle)", padding: "28px" }}>
                    No stock unloaded on this day.
                  </td>
                </tr>
              ) : (
                unloads.map((u) => (
                  <tr key={u.unloadedStockUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ ...td, fontWeight: "600" }}>{productName(u.productUid)}</td>
                    <td style={td}>{qty(u.quantity)}</td>
                    <td style={td}>{reasonName(u.reasonUid)}</td>
                    <td style={td}>{u.reasonNote || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CorrectCountModal
        count={correcting}
        productName={correcting ? productName(correcting.productUid) : ""}
        reasons={reasons}
        vehicleUid={vehicleUid}
        date={date}
        onClose={() => setCorrecting(null)}
        onSaved={(d) => { setCorrecting(null); setDay(d); }}
      />
    </>
  );
};

const CorrectCountModal = ({ count, productName, reasons, vehicleUid, date, onClose, onSaved }) => {
  const [counted, setCounted] = useState("");
  const [reasonUid, setReasonUid] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!count) return;
    setCounted(String(count.countedQty ?? ""));
    setReasonUid("");
    setReasonNote("");
    setError("");
  }, [count]);

  const save = async () => {
    const q = Number(counted);
    if (counted === "" || Number.isNaN(q) || q < 0) return setError("The count must be zero or more.");
    if (!reasonUid) return setError("Choose a reason for the correction.");
    setSaving(true);
    setError("");
    try {
      onSaved(await correctCount(vehicleUid, date, count.productUid, q, reasonUid, reasonNote || null));
    } catch (e) {
      setError(errorMessage(e, "Failed to correct the count."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!count} onClose={onClose} title={`Correct count · ${productName}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <p style={{ color: "var(--color-text-subtle)", fontSize: "0.9rem" }}>
          Expected {qty(count?.expectedQty)}, counted {qty(count?.countedQty)} at close. The next day&apos;s opening stock
          follows the corrected count.
        </p>
        <div>
          <label htmlFor="correct-qty" style={labelStyle}>Counted *</label>
          <input id="correct-qty" type="number" min="0" step="any" value={counted} onChange={(e) => setCounted(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
        </div>
        <div>
          <label htmlFor="correct-reason" style={labelStyle}>Reason *</label>
          <ReasonSelect id="correct-reason" reasons={reasons} value={reasonUid} onChange={setReasonUid} />
        </div>
        <div>
          <label htmlFor="correct-note" style={labelStyle}>Note</label>
          <input id="correct-note" value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} style={{ ...inputStyle, width: "100%" }} />
        </div>
        <ErrorBox text={error} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save correction"}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default DayCloseSection;

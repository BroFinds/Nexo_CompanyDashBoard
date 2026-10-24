import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Smartphone, Truck, AlertCircle } from "lucide-react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import Modal from "@shared/components/ui/Modal";
import Input from "@shared/components/ui/Input";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { fetchReasons } from "../context/dayCloseApi";
import { fetchOpenIssues, fetchUnsettledTrips, markIssueSeen, releaseVehicle, settleTrip } from "../context/tripsApi";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const th = {
  padding: "10px 12px", textAlign: "left", fontWeight: "600", fontSize: "0.75rem", color: "var(--color-text-subtle)",
  textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", background: "var(--bg-body)",
};
const td = { padding: "10px 12px", whiteSpace: "nowrap" };
const sectionTitle = { fontSize: "var(--text-lg)", fontWeight: "600", margin: "0 0 12px" };
const fieldStyle = {
  width: "90px", padding: "6px 8px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md, 8px)",
  background: "var(--bg-surface, #fff)", color: "var(--color-text-main)",
};

const Fact = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", fontWeight: 600 }}>{label}</div>
    <div style={{ fontWeight: 700, marginTop: 2 }}>{value}</div>
  </div>
);

// Trips the drivers have submitted (Settle my trip) are settled here; each vehicle's phone can be released;
// records the server refused are listed for the admin to look at.
const TripsPage = () => {
  const { vehicles, vehiclesLoaded, fetchVehicles } = useDeliwheels();
  const [trips, setTrips] = useState([]);
  const [issues, setIssues] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [error, setError] = useState("");
  const [settling, setSettling] = useState(null);
  // Release phone: the vehicle being released (confirm), then the outcome
  const [releasing, setReleasing] = useState(null);
  const [releaseState, setReleaseState] = useState({ busy: false, done: false, error: "" });

  const load = useCallback(async () => {
    setError("");
    try {
      const [t, i] = await Promise.all([fetchUnsettledTrips(), fetchOpenIssues()]);
      setTrips(t);
      setIssues(i);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load trips");
    }
  }, []);

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    fetchReasons().then(setReasons).catch(() => {});
    load();
  }, [vehiclesLoaded, fetchVehicles, load]);

  const vehicleName = useMemo(() => {
    const m = new Map(vehicles.map((v) => [v.vehicle_uid, `${v.registration || ""} ${v.name || ""}`.trim()]));
    return (uid) => m.get(uid) || "Vehicle";
  }, [vehicles]);

  const submitted = trips.filter((t) => t.status === "Submitted");
  const activeVehicles = vehicles.filter((v) => v.status !== "inactive");

  const askRelease = (vehicleUid) => {
    setReleaseState({ busy: false, done: false, error: "" });
    setReleasing(vehicleUid);
  };
  const confirmRelease = async () => {
    setReleaseState({ busy: true, done: false, error: "" });
    try {
      await releaseVehicle(releasing);
      setReleaseState({ busy: false, done: true, error: "" });
    } catch (e) {
      setReleaseState({ busy: false, done: false, error: e?.response?.data?.message || "Could not release the phone" });
    }
  };

  return (
    <DeliwheelsLayout>
      <div style={{ padding: "var(--spacing-xl, 24px)", display: "grid", gap: "var(--spacing-xl, 24px)" }}>
        <div>
          <h2 style={{ margin: 0 }}>Trips</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-subtle)" }}>
            Settle the trips drivers have submitted, and release a vehicle from a lost or broken phone.
          </p>
        </div>
        {error && <div style={{ color: "var(--color-danger, #dc2626)" }}>{error}</div>}

        {submitted.length > 0 && (
          <section>
            <h3 style={sectionTitle}>Trips to settle ({submitted.length})</h3>
            <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
              {submitted.map((t) => (
                <Card key={t.tripUid}>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <Truck size={18} />
                        <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {vehicleName(t.vehicleUid)}
                        </strong>
                      </div>
                      <Badge variant="warning">Trip {t.tripNo} · Submitted</Badge>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                      <Fact label={`Sales (${t.money.sales})`} value={money(t.money.salesTotal)} />
                      <Fact label="Cash to collect" value={money(t.money.cash)} />
                      <Fact label="UPI" value={money(t.money.upi)} />
                      <Fact label="Credit" value={money(t.money.credit)} />
                    </div>
                    <Button onClick={() => setSettling(t)}>Settle trip</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 style={sectionTitle}>Phones</h3>
          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {activeVehicles.map((v) => (
              <Card key={v.vehicle_uid} padding="md">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--color-primary-light, rgba(59,130,246,0.12))", flexShrink: 0 }}>
                    <Smartphone size={20} color="var(--color-primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.98rem", letterSpacing: "0.02em", wordBreak: "break-word" }}>
                      {v.registration || v.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", marginTop: 2 }}>{v.name}</div>
                  </div>
                  <Button variant="secondary" onClick={() => askRelease(v.vehicle_uid)}>Release</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {issues.length > 0 && (
          <section>
            <h3 style={sectionTitle}>Needs attention ({issues.length})</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {issues.map((i) => (
                <Card key={i.issueUid} padding="none" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <AlertCircle size={18} color="var(--color-danger, #dc2626)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>
                        {vehicleName(i.vehicleUid)} · {i.entity.replace("deliwheels_", "").replace(/_/g, " ")}
                        {i.businessDate ? ` · ${i.businessDate}` : ""}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)" }}>{i.errorCode}: {i.message}</div>
                    </div>
                    <Button variant="secondary" onClick={async () => { await markIssueSeen(i.issueUid); load(); }}
                      style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
                      Mark seen
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal isOpen={!!releasing} onClose={() => setReleasing(null)} maxWidth="440px"
        title={releaseState.done ? "Phone released" : "Release phone?"}>
        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Smartphone size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {releaseState.done
                ? <>The driver of <strong>{vehicleName(releasing)}</strong> can now log in on the new phone. The old phone is signed out.</>
                : <>Release <strong>{vehicleName(releasing)}</strong> from its phone? Use this when the phone is lost or broken —
                  the driver can then log in on another phone, which downloads the open trip.</>}
            </p>
          </div>
          {releaseState.error && <div style={{ color: "var(--color-danger, #dc2626)" }}>{releaseState.error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {releaseState.done ? (
              <Button onClick={() => setReleasing(null)}>Done</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setReleasing(null)}>Cancel</Button>
                <Button onClick={confirmRelease} disabled={releaseState.busy}>{releaseState.busy ? "Releasing…" : "Release phone"}</Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!settling} onClose={() => setSettling(null)} maxWidth="860px"
        title={settling ? `Settle ${vehicleName(settling.vehicleUid)} · Trip ${settling.tripNo}` : ""}>
        {settling && (
          <SettleForm trip={settling} reasons={reasons} onDone={() => { setSettling(null); load(); }} />
        )}
      </Modal>
    </DeliwheelsLayout>
  );
};

// The driver's counts (against the expected figure), a correction per product (needs a reason), and the cash received
const SettleForm = ({ trip, reasons, onDone }) => {
  const [cash, setCash] = useState(String(trip.money.cash ?? 0));
  const [note, setNote] = useState("");
  const [fix, setFix] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const names = useMemo(() => new Map(trip.stock.map((l) => [l.productUid, l.productName])), [trip.stock]);
  const reasonName = (uid) => reasons.find((r) => r.uid === uid)?.name;
  const difference = Number(cash || 0) - Number(trip.money.cash || 0);

  const setFixField = (productUid, field, value) =>
    setFix((p) => ({ ...p, [productUid]: { ...p[productUid], [field]: value } }));

  const submit = async () => {
    setError("");
    const corrections = Object.entries(fix)
      .filter(([, f]) => f.qty !== "" && f.qty !== undefined)
      .map(([productUid, f]) => ({ productUid, countedQty: Number(f.qty), reasonUid: f.reason || null, reasonNote: f.note || null }));
    setBusy(true);
    try {
      await settleTrip(trip.tripUid, { cashReceived: Number(cash), note, corrections });
      onDone();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not settle");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <Card padding="none">
        <div style={{ maxHeight: "360px", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Product", "Expected", "Driver counted", "Driver's reason", "Correct to", "Reason"].map((h) => (
                  <th key={h} style={{ ...th, position: "sticky", top: 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trip.counts.map((c) => {
                const off = Number(c.difference || 0) !== 0;
                return (
                  <tr key={c.productUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ ...td, fontWeight: 600 }}>{names.get(c.productUid) || "Product"}</td>
                    <td style={td}>{c.expectedQty}</td>
                    <td style={{ ...td, fontWeight: off ? 700 : 400, color: off ? "var(--color-danger, #dc2626)" : undefined }}>
                      {c.driverCountedQty}
                    </td>
                    <td style={{ ...td, color: "var(--color-text-subtle)" }}>
                      {reasonName(c.driverReasonUid) || "—"}{c.driverReasonNote ? ` · ${c.driverReasonNote}` : ""}
                    </td>
                    <td style={td}>
                      <input type="number" min="0" style={fieldStyle} value={fix[c.productUid]?.qty ?? ""}
                        placeholder="—" onChange={(e) => setFixField(c.productUid, "qty", e.target.value)} />
                    </td>
                    <td style={td}>
                      <select style={{ ...fieldStyle, width: "130px" }} value={fix[c.productUid]?.reason ?? ""}
                        onChange={(e) => setFixField(c.productUid, "reason", e.target.value)}>
                        <option value="">—</option>
                        {reasons.map((r) => <option key={r.uid} value={r.uid}>{r.name}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "end" }}>
        <Input label={`Cash received (expected ${money(trip.money.cash)})`} type="number" min="0" value={cash}
          onChange={(e) => setCash(e.target.value)} />
        <Input label="Note" value={note} placeholder="Optional" onChange={(e) => setNote(e.target.value)} />
      </div>
      {difference !== 0 && (
        <div style={{ color: difference < 0 ? "var(--color-danger, #dc2626)" : "var(--color-text-subtle)", fontWeight: 600 }}>
          {difference < 0 ? `${money(-difference)} short` : `${money(difference)} extra`}
        </div>
      )}
      {error && <div style={{ color: "var(--color-danger, #dc2626)" }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={submit} disabled={busy}>{busy ? "Settling…" : "Settle trip"}</Button>
      </div>
    </div>
  );
};

export default TripsPage;

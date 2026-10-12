import React, { useEffect, useMemo, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { HandCoins, CheckCircle2, AlertCircle } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { formatMoney } from "../utils/salesFormat";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CollectCashPage = () => {
  const { vehicles, vehiclesLoaded, fetchVehicles, fetchAllSales, collectVehiclePayment } =
    useDeliwheels();

  const [date, setDate] = useState(todayISO);
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [collecting, setCollecting] = useState({}); // vehicleUid → bool
  const [collected, setCollected] = useState({}); // vehicleUid → bool

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
  }, [vehiclesLoaded, fetchVehicles]);

  const loadSales = async () => {
    if (!date) return;
    setLoading(true);
    setError("");
    setCollected({});
    try {
      const data = await fetchAllSales({ fromDate: date, toDate: date });
      setAllSales(data);
    } catch {
      setError("Failed to load sales. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [date]);

  // Group sales by vehicle, only include vehicles with at least one sale
  const vehicleRows = useMemo(() => {
    const map = {};
    for (const s of allSales) {
      if (!map[s.vehicle_uid]) {
        map[s.vehicle_uid] = {
          vehicleUid: s.vehicle_uid,
          vehicleNumber: s.vehicle_number,
          sales: [],
        };
      }
      map[s.vehicle_uid].sales.push(s);
    }
    return Object.values(map).map((row) => {
      const isPaid = (s) => (s.payment_status_text || "").toUpperCase() === "PAID";
      const pending = row.sales.filter((s) => !isPaid(s));
      const paid = row.sales.filter(isPaid);
      const totalGrand = row.sales.reduce((sum, s) => sum + Number(s.grand_total || 0), 0);
      const pendingGrand = pending.reduce((sum, s) => sum + Number(s.grand_total || 0), 0);
      const cashTotal = pending.reduce((sum, s) => sum + Number(s.cash_amount || 0), 0);
      const upiTotal = pending.reduce((sum, s) => sum + Number(s.upi_amount || 0), 0);
      const creditTotal = pending.reduce((sum, s) => sum + Number(s.credit_amount || 0), 0);
      return {
        ...row,
        pendingCount: pending.length,
        paidCount: paid.length,
        totalCount: row.sales.length,
        totalGrand,
        pendingGrand,
        cashTotal,
        upiTotal,
        creditTotal,
        allPaid: pending.length === 0,
      };
    });
  }, [allSales]);

  const handleCollect = async (vehicleUid) => {
    setCollecting((p) => ({ ...p, [vehicleUid]: true }));
    try {
      await collectVehiclePayment(vehicleUid, date);
      setCollected((p) => ({ ...p, [vehicleUid]: true }));
      setAllSales((prev) =>
        prev.map((s) =>
          s.vehicle_uid === vehicleUid
            ? { ...s, payment_status_text: "PAID" }
            : s,
        ),
      );
    } catch {
      alert("Failed to collect cash. Please try again.");
    } finally {
      setCollecting((p) => ({ ...p, [vehicleUid]: false }));
    }
  };

  const pendingVehicles = vehicleRows.filter((r) => !r.allPaid && !collected[r.vehicleUid]);
  const doneVehicles = vehicleRows.filter((r) => r.allPaid || collected[r.vehicleUid]);

  return (
    <DeliwheelsLayout headerTitle="Collect Cash" headerSubtitle="Verify and collect driver handovers">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-xl)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>
            Collect Cash
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Verify cash, UPI, and credit per vehicle before marking collected.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--color-text-subtle)", fontWeight: "600" }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "var(--bg-card)",
              color: "var(--color-text)",
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", marginBottom: "16px", padding: "12px 16px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <Card padding="none">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Vehicle", "Sales", "Pending", "Cash", "UPI", "Credit", "Total Pending", ""].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "600", fontSize: "0.8rem", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {[100, 60, 60, 80, 80, 80, 80, 100].map((w, j) => (
                    <td key={j} style={{ padding: "14px 16px" }}><Skeleton width={`${w}px`} height="16px" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : vehicleRows.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-subtle)" }}>
            No sales found for {date}.
          </div>
        </Card>
      ) : (
        <>
          {pendingVehicles.length > 0 && (
            <div style={{ marginBottom: "var(--spacing-xl)" }}>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <HandCoins size={18} style={{ color: "#f59e0b" }} />
                Pending Collection ({pendingVehicles.length})
              </h3>
              <Card padding="none">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-body)" }}>
                        {["Vehicle", "Total Sales", "Pending", "Cash (₹)", "UPI (₹)", "Credit (₹)", "Pending Amount (₹)", ""].map((h, i) => (
                          <th key={`ph-${i}`} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "600", fontSize: "0.8rem", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", position: "sticky", top: 0, backgroundColor: "var(--bg-body)", boxShadow: "0 1px 0 var(--border-subtle)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVehicles.map((row) => (
                        <tr key={row.vehicleUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "700" }}>
                            {row.vehicleNumber}
                          </td>
                          <td style={{ padding: "14px 16px", color: "var(--color-text-subtle)" }}>
                            {row.totalCount}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <Badge variant="warning">{row.pendingCount} pending</Badge>
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "600" }}>
                            {row.cashTotal > 0 ? `₹${formatMoney(row.cashTotal)}` : <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "600" }}>
                            {row.upiTotal > 0 ? `₹${formatMoney(row.upiTotal)}` : <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "600" }}>
                            {row.creditTotal > 0 ? `₹${formatMoney(row.creditTotal)}` : <span style={{ color: "var(--color-text-subtle)" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "700" }}>
                            ₹{formatMoney(row.pendingGrand)}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <Button
                              onClick={() => handleCollect(row.vehicleUid)}
                              disabled={collecting[row.vehicleUid]}
                              style={{
                                padding: "8px 16px",
                                fontSize: "0.85rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: collecting[row.vehicleUid] ? "#d1d5db" : "#10b981",
                                color: "#fff",
                                border: "none",
                                cursor: collecting[row.vehicleUid] ? "not-allowed" : "pointer",
                              }}
                            >
                              <HandCoins size={15} />
                              {collecting[row.vehicleUid] ? "Collecting…" : "Collect Cash"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {doneVehicles.length > 0 && (
            <div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} style={{ color: "#10b981" }} />
                Collected ({doneVehicles.length})
              </h3>
              <Card padding="none">
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-body)" }}>
                        {["Vehicle", "Total Sales", "Cash (₹)", "UPI (₹)", "Credit (₹)", "Total (₹)", "Status"].map((h, i) => (
                          <th key={`dh-${i}`} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "600", fontSize: "0.8rem", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", position: "sticky", top: 0, backgroundColor: "var(--bg-body)", boxShadow: "0 1px 0 var(--border-subtle)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {doneVehicles.map((row) => {
                        const cashT = row.sales.reduce((s, x) => s + Number(x.cash_amount || 0), 0);
                        const upiT = row.sales.reduce((s, x) => s + Number(x.upi_amount || 0), 0);
                        const creditT = row.sales.reduce((s, x) => s + Number(x.credit_amount || 0), 0);
                        return (
                          <tr key={row.vehicleUid} style={{ borderBottom: "1px solid var(--border-subtle)", opacity: 0.8 }}>
                            <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "700" }}>
                              {row.vehicleNumber}
                            </td>
                            <td style={{ padding: "14px 16px", color: "var(--color-text-subtle)" }}>
                              {row.totalCount}
                            </td>
                            <td style={{ padding: "14px 16px", fontFamily: "monospace" }}>
                              {cashT > 0 ? `₹${formatMoney(cashT)}` : "—"}
                            </td>
                            <td style={{ padding: "14px 16px", fontFamily: "monospace" }}>
                              {upiT > 0 ? `₹${formatMoney(upiT)}` : "—"}
                            </td>
                            <td style={{ padding: "14px 16px", fontFamily: "monospace" }}>
                              {creditT > 0 ? `₹${formatMoney(creditT)}` : "—"}
                            </td>
                            <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: "700" }}>
                              ₹{formatMoney(row.totalGrand)}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <Badge variant="success">Collected</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </DeliwheelsLayout>
  );
};

export default CollectCashPage;

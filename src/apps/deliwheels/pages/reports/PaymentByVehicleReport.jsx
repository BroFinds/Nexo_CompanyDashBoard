import React from "react";
import Card from "@shared/components/ui/Card";
import { Filter, Wallet, AlertCircle, IndianRupee } from "lucide-react";
import { KPICard, SectionCard, formatINRShort } from "./ReportHelpers";

const PaymentByVehicleReport = ({
  filterApplied,
  paymentByVehicles,
  vehicleFilter,
  fromDate,
  toDate,
}) => {
  if (!filterApplied) {
    return (
      <Card
        padding="lg"
        style={{
          textAlign: "center",
          color: "var(--color-text-subtle)",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        <Filter size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
        <p>
          Select filters and click <strong>Filter</strong> to see the data
        </p>
      </Card>
    );
  }

  const totalRevenue = paymentByVehicles.reduce(
    (s, v) => s + v.totalRevenue,
    0,
  );
  const totalPaid = paymentByVehicles.reduce((s, v) => s + v.paid, 0);
  const totalPending = paymentByVehicles.reduce((s, v) => s + v.pending, 0);
  const totalFailed = paymentByVehicles.reduce((s, v) => s + v.failed, 0);

  return (
    <div className="animate-in">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--spacing-lg)",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        <KPICard
          label="Total Revenue"
          value={formatINRShort(totalRevenue)}
          icon={IndianRupee}
          color="#059669"
          bg="#d1fae5"
          noDelta
        />
        <KPICard
          label="Total Paid"
          value={formatINRShort(totalPaid)}
          icon={Wallet}
          color="#059669"
          bg="#d1fae5"
          noDelta
        />
        <KPICard
          label="Total Pending"
          value={formatINRShort(totalPending)}
          icon={AlertCircle}
          color="#d97706"
          bg="#fef3c7"
          noDelta
        />
        <KPICard
          label="Total Failed"
          value={formatINRShort(totalFailed)}
          icon={AlertCircle}
          color="#dc2626"
          bg="#fee2e2"
          noDelta
        />
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Payment Status by Vehicle"
          subtitle={`Payment breakdown for ${vehicleFilter ? "selected vehicle" : "all vehicles"} between ${fromDate || "—"} and ${toDate || "—"}`}
        >
          {paymentByVehicles.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-subtle)",
                fontSize: "0.85rem",
                textAlign: "center",
                padding: 20,
              }}
            >
              No sales in this selection
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th className="num">Total Revenue</th>
                    <th className="num">Paid</th>
                    <th className="num">Pending</th>
                    <th className="num">Failed</th>
                    <th className="num">Collection %</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentByVehicles.map((v) => {
                    const collectionPct = v.totalRevenue
                      ? Math.round((v.paid / v.totalRevenue) * 100)
                      : 0;
                    return (
                      <tr key={v.vehicle_uid}>
                        <td>
                          <div
                            style={{
                              fontWeight: 600,
                              fontFamily: "monospace",
                            }}
                          >
                            {v.registration}
                          </div>
                        </td>
                        <td>{v.driver}</td>
                        <td className="num strong">
                          {formatINRShort(v.totalRevenue)}
                        </td>
                        <td className="num">
                          <span style={{ color: "#059669", fontWeight: 600 }}>
                            {formatINRShort(v.paid)}
                          </span>
                        </td>
                        <td className="num">
                          <span style={{ color: "#d97706", fontWeight: 600 }}>
                            {formatINRShort(v.pending)}
                          </span>
                        </td>
                        <td className="num">
                          <span style={{ color: "#dc2626", fontWeight: 600 }}>
                            {formatINRShort(v.failed)}
                          </span>
                        </td>
                        <td className="num">
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: 999,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              background:
                                collectionPct >= 80
                                  ? "#d1fae5"
                                  : collectionPct >= 50
                                    ? "#fef3c7"
                                    : "#fee2e2",
                              color:
                                collectionPct >= 80
                                  ? "#059669"
                                  : collectionPct >= 50
                                    ? "#92400e"
                                    : "#dc2626",
                            }}
                          >
                            {collectionPct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default PaymentByVehicleReport;

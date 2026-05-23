import React from "react";
import Card from "@shared/components/ui/Card";
import {
  Filter,
  Wallet,
  IndianRupee,
  AlertCircle,
  Users,
  ShoppingCart,
} from "lucide-react";
import {
  AreaChart,
  KPICard,
  RankedList,
  SectionCard,
  formatINRShort,
} from "./ReportHelpers";

const SalesByVehicleReport = ({
  filterApplied,
  byVehicleData,
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
          label="Total Sales"
          value={byVehicleData.orders.toLocaleString("en-IN")}
          icon={ShoppingCart}
          color="#6366f1"
          bg="#e0e7ff"
          noDelta
        />
        <KPICard
          label="Revenue"
          value={formatINRShort(byVehicleData.revenue)}
          icon={IndianRupee}
          color="#059669"
          bg="#d1fae5"
          noDelta
        />
        <KPICard
          label="Collected"
          value={formatINRShort(byVehicleData.collected)}
          icon={Wallet}
          color="#0891b2"
          bg="#cffafe"
          noDelta
        />
        <KPICard
          label="Outstanding"
          value={formatINRShort(byVehicleData.outstanding)}
          icon={AlertCircle}
          color={byVehicleData.outstanding > 0 ? "#dc2626" : "#059669"}
          bg={byVehicleData.outstanding > 0 ? "#fee2e2" : "#d1fae5"}
          noDelta
        />
        <KPICard
          label="Shops Served"
          value={byVehicleData.uniqueShops}
          icon={Users}
          color="#ea580c"
          bg="#ffedd5"
          noDelta
        />
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Daily Sales Trend"
          subtitle={`${vehicleFilter ? "Revenue for the selected vehicle" : "Revenue across all vehicles"} between ${fromDate || "—"} and ${toDate || "—"}`}
        >
          <AreaChart points={byVehicleData.trend} height={220} />
        </SectionCard>
      </div>

      <div
        className="report-grid-2"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <SectionCard title="Top Shops">
          <RankedList
            items={byVehicleData.shops.slice(0, 10)}
            barColor="var(--color-primary)"
          />
        </SectionCard>
        <SectionCard
          title="Top Products"
          subtitle="Revenue per product on the filtered sales"
        >
          <RankedList
            items={byVehicleData.products.slice(0, 10)}
            metaKey="units"
            metaSuffix="units"
            barColor="#7c3aed"
          />
        </SectionCard>
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Recent Sales"
          subtitle="Latest 25 sales in this selection"
        >
          {byVehicleData.recent.length === 0 ? (
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
                    <th>Date</th>
                    <th>Invoice</th>
                    <th>Shop</th>
                    <th>Vehicle</th>
                    <th className="num">Amount</th>
                    <th className="num">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {byVehicleData.recent.map((s) => {
                    const raw = s.sale_date || s.created_on;
                    const d = raw ? new Date(raw) : null;
                    const status = (
                      s.payment_status_text ||
                      s.payment_status ||
                      ""
                    ).toUpperCase();
                    const statusColor =
                      status === "PAID"
                        ? { c: "#059669", bg: "#d1fae5" }
                        : status === "PENDING" || status === "PARTIAL"
                          ? { c: "#92400e", bg: "#fef3c7" }
                          : { c: "#6b7280", bg: "#f3f4f6" };
                    return (
                      <tr key={s.sale_uid}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {d instanceof Date && !Number.isNaN(d.getTime())
                            ? d.toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                          }}
                        >
                          {s.invoice_no || "—"}
                        </td>
                        <td>{s.shop_owner_name || "—"}</td>
                        <td style={{ fontFamily: "monospace" }}>
                          {s.vehicle_number || "—"}
                        </td>
                        <td className="num strong">
                          {formatINRShort(s.grand_total)}
                        </td>
                        <td className="num">
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: statusColor.bg,
                              color: statusColor.c,
                            }}
                          >
                            {status || "—"}
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

export default SalesByVehicleReport;

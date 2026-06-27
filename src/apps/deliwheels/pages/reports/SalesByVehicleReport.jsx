import React from "react";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import {
  Filter,
  Wallet,
  IndianRupee,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import {
  AreaChart,
  KPICard,
  RankedList,
  SectionCard,
  formatINRShort,
} from "./ReportHelpers";
import { useSalesSummaryReport } from "../../context/useSalesSummaryReport";

const formatDateShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const SalesByVehicleReport = ({
  filterApplied,
  vehicleFilter,
  fromDate,
  toDate,
}) => {
  const { data, isLoading, error } = useSalesSummaryReport({
    enabled: filterApplied,
    fromDate,
    toDate,
    vehicleUid: vehicleFilter,
  });

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

  if (error) {
    return (
      <Card
        padding="lg"
        style={{ marginBottom: "var(--spacing-lg)", color: "#dc2626" }}
      >
        Failed to load sales report: {error}
      </Card>
    );
  }

  if (isLoading) {
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
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton
                width="40px"
                height="40px"
                borderRadius="10px"
                style={{ marginBottom: 12 }}
              />
              <Skeleton width="60%" height="28px" style={{ marginBottom: 6 }} />
              <Skeleton width="80%" height="14px" />
            </Card>
          ))}
        </div>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <SectionCard title="Daily Quantity Trend" subtitle="Loading…">
            <Skeleton width="100%" height="220px" borderRadius="8px" />
          </SectionCard>
        </div>
        <div
          className="report-grid-2"
          style={{ marginBottom: "var(--spacing-lg)" }}
        >
          <SectionCard title="Top 10 Shops" subtitle="Loading…">
            <Skeleton width="100%" height="160px" borderRadius="8px" />
          </SectionCard>
          <SectionCard title="Top 10 Products" subtitle="Loading…">
            <Skeleton width="100%" height="160px" borderRadius="8px" />
          </SectionCard>
        </div>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <SectionCard title="Recent Sales" subtitle="Loading…">
            <Skeleton width="100%" height="200px" borderRadius="8px" />
          </SectionCard>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const totalRevenue = Number(summary.total_revenue) || 0;
  const totalPaid = Number(summary.total_paid_amount) || 0;
  const totalPending = Number(summary.total_pending_payment) || 0;
  const totalRecords = Number(summary.total_records) || 0;

  const trendPoints = (data?.trend ?? []).map((t) => ({
    key: t.trend_date,
    label: formatDateShort(t.trend_date),
    value: Number(t.total_quantity) || 0,
  }));

  const topShops = (data?.top_five_shops ?? []).map((s) => ({
    key: s.shop_uid,
    name: s.shop_owner_name || "—",
    revenue: Number(s.total_revenue) || 0,
  }));

  const topProducts = (data?.top_five_products ?? []).map((p) => ({
    key: p.product_uid,
    name: p.product_name || "—",
    revenue: Number(p.total_revenue) || 0,
  }));

  const recent = data?.last_25_sales ?? [];

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
          value={totalRecords.toLocaleString("en-IN")}
          icon={ShoppingCart}
          color="#6366f1"
          bg="#e0e7ff"
          noDelta
        />
        <KPICard
          label="Revenue"
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
          color="#0891b2"
          bg="#cffafe"
          noDelta
        />
        <KPICard
          label="Total Pending"
          value={formatINRShort(totalPending)}
          icon={AlertCircle}
          color={totalPending > 0 ? "#d97706" : "#059669"}
          bg={totalPending > 0 ? "#fef3c7" : "#d1fae5"}
          noDelta
        />
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Daily Quantity Trend"
          subtitle={`${vehicleFilter ? "Units sold for the selected vehicle" : "Units sold across all vehicles"} between ${fromDate || "—"} and ${toDate || "—"}`}
        >
          <AreaChart
            points={trendPoints}
            height={220}
            color="#7c3aed"
            formatY={(v) => `${v}u`}
          />
        </SectionCard>
      </div>

      <div
        className="report-grid-2"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <SectionCard
          title="Top 10 Shops"
          subtitle="Revenue per shop on the filtered sales"
        >
          <RankedList items={topShops} barColor="var(--color-primary)" />
        </SectionCard>
        <SectionCard
          title="Top 10 Products"
          subtitle="Revenue per product on the filtered sales"
        >
          <RankedList items={topProducts} barColor="#7c3aed" />
        </SectionCard>
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Recent Sales"
          subtitle="Latest 25 sales in this selection"
        >
          {recent.length === 0 ? (
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
                    <th>Driver</th>
                    <th>Payment Mode</th>
                    <th className="num">Amount</th>
                    <th className="num">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s, i) => {
                    const status = (s.payment_status || "").toUpperCase();
                    const statusColor =
                      status === "PAID"
                        ? { c: "#059669", bg: "#d1fae5" }
                        : status === "PENDING" || status === "PARTIAL"
                          ? { c: "#92400e", bg: "#fef3c7" }
                          : { c: "#6b7280", bg: "#f3f4f6" };
                    return (
                      <tr key={`${s.invoice || "row"}-${i}`}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatDateTime(s.created_on)}
                        </td>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                          }}
                        >
                          {s.invoice || "—"}
                        </td>
                        <td>{s.shop || "—"}</td>
                        <td style={{ fontFamily: "monospace" }}>
                          {s.vehicle_number || "—"}
                        </td>
                        <td>{s.driver_name || "Unassigned"}</td>
                        <td>{s.payment_mode || "—"}</td>
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

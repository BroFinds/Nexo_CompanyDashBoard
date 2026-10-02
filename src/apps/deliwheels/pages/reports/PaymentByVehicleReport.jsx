import React from "react";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import {
  Filter,
  Wallet,
  AlertCircle,
  IndianRupee,
  Percent,
  Receipt,
  ShoppingCart,
  Store,
} from "lucide-react";
import { KPICard, SectionCard, formatINRShort } from "./ReportHelpers";
import { useStockPaymentReport } from "../../context/useStockPaymentReport";

const PaymentByVehicleReport = ({
  filterApplied,
  vehicleFilter,
  fromDate,
  toDate,
}) => {
  const { data, isLoading, error } = useStockPaymentReport({
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
        Failed to load payment report: {error}
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <SectionCard title="Payment Status by Vehicle" subtitle="Loading…">
            <Skeleton width="100%" height="160px" borderRadius="8px" />
          </SectionCard>
        </div>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <SectionCard title="Pending by Shop" subtitle="Loading…">
            <Skeleton width="100%" height="160px" borderRadius="8px" />
          </SectionCard>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const byVehicle = data?.summary_by_vehicle ?? [];
  const byShop = data?.pending_by_shop ?? [];

  const totalRevenue = Number(summary.total_revenue) || 0;
  const totalPaid = Number(summary.total_paid_amount) || 0;
  const totalPending = Number(summary.total_pending_payment) || 0;
  const totalDiscount = Number(summary.total_discount_given) || 0;
  const totalTax = Number(summary.total_tax) || 0;
  const totalRecords = Number(summary.total_records) || 0;

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
          label="Total Discount"
          value={formatINRShort(totalDiscount)}
          icon={Percent}
          color="#7c3aed"
          bg="#ede9fe"
          noDelta
        />
        <KPICard
          label="Total Tax"
          value={formatINRShort(totalTax)}
          icon={Receipt}
          color="#0891b2"
          bg="#cffafe"
          noDelta
        />
        <KPICard
          label="Total Sales"
          value={totalRecords.toLocaleString("en-IN")}
          icon={ShoppingCart}
          color="#6366f1"
          bg="#e0e7ff"
          noDelta
        />
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Payment Status by Vehicle"
          subtitle={`Payment breakdown for ${vehicleFilter ? "selected vehicle" : "all vehicles"} between ${fromDate || "—"} and ${toDate || "—"}`}
        >
          {byVehicle.length === 0 ? (
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
                    <th className="num">Discount</th>
                    <th className="num">Tax</th>
                    <th className="num">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {byVehicle.map((v) => (
                    <tr key={v.vehicle_uid}>
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            fontFamily: "monospace",
                          }}
                        >
                          {v.vehicle_number || "—"}
                        </div>
                      </td>
                      <td>{v.driver_name || "Unassigned"}</td>
                      <td className="num strong">
                        {formatINRShort(v.total_revenue)}
                      </td>
                      <td className="num">
                        <span style={{ color: "#059669", fontWeight: 600 }}>
                          {formatINRShort(v.total_paid_amount)}
                        </span>
                      </td>
                      <td className="num">
                        <span style={{ color: "#d97706", fontWeight: 600 }}>
                          {formatINRShort(v.total_pending_payment)}
                        </span>
                      </td>
                      <td className="num">
                        {formatINRShort(v.total_discount_given)}
                      </td>
                      <td className="num">{formatINRShort(v.total_tax)}</td>
                      <td className="num strong">
                        {Number(v.total_sales_count || 0).toLocaleString(
                          "en-IN",
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Pending by Shop"
          subtitle="Outstanding balances by shop, ordered by pending amount"
          right={<Store size={18} style={{ color: "var(--color-text-subtle)" }} />}
        >
          {byShop.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-subtle)",
                fontSize: "0.85rem",
                textAlign: "center",
                padding: 20,
              }}
            >
              No shop activity in this selection
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th className="num">Total Revenue</th>
                    <th className="num">Paid</th>
                    <th className="num">Pending</th>
                    <th className="num">Discount</th>
                    <th className="num">Tax</th>
                    <th className="num">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {byShop.map((s) => (
                    <tr key={s.shop_uid}>
                      <td style={{ fontWeight: 600 }}>
                        {s.shop_owner_name || "—"}
                      </td>
                      <td className="num strong">
                        {formatINRShort(s.total_revenue)}
                      </td>
                      <td className="num">
                        <span style={{ color: "#059669", fontWeight: 600 }}>
                          {formatINRShort(s.total_paid_amount)}
                        </span>
                      </td>
                      <td className="num">
                        <span style={{ color: "#d97706", fontWeight: 600 }}>
                          {formatINRShort(s.total_pending_payment)}
                        </span>
                      </td>
                      <td className="num">
                        {formatINRShort(s.total_discount_given)}
                      </td>
                      <td className="num">{formatINRShort(s.total_tax)}</td>
                      <td className="num strong">
                        {Number(s.total_sales_count || 0).toLocaleString(
                          "en-IN",
                        )}
                      </td>
                    </tr>
                  ))}
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

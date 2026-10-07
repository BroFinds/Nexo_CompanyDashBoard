import React, { useMemo } from "react";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import {
  IndianRupee,
  Wallet,
  AlertCircle,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Donut,
  KPICard,
  RankedList,
  SectionCard,
  VBarChart,
  formatINRShort,
} from "./ReportHelpers";
import { useOverviewReport } from "../../context/useOverviewReport";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const OverviewReport = ({ fromDate, toDate }) => {
  const { data, isLoading, error } = useOverviewReport({
    enabled: Boolean(fromDate && toDate),
    fromDate,
    toDate,
  });

  const kpis = useMemo(() => {
    const s = data?.summary || {};
    const outstanding = Number(s.total_pending_payment) || 0;
    return [
      {
        label: "Revenue",
        value: formatINRShort(s.total_revenue),
        icon: IndianRupee,
        color: "#059669",
        bg: "#d1fae5",
      },
      {
        label: "Collected",
        value: formatINRShort(s.total_paid_amount),
        icon: Wallet,
        color: "#0891b2",
        bg: "#cffafe",
      },
      {
        label: "Outstanding",
        value: formatINRShort(s.total_pending_payment),
        icon: AlertCircle,
        color: outstanding > 0 ? "#dc2626" : "#059669",
        bg: outstanding > 0 ? "#fee2e2" : "#d1fae5",
      },
      {
        label: "Orders",
        value: Number(s.total_records || 0).toLocaleString("en-IN"),
        icon: ShoppingCart,
        color: "#6366f1",
        bg: "#e0e7ff",
      },
      {
        label: "Active Shops",
        value: Number(s.total_active_shops || 0).toLocaleString("en-IN"),
        icon: Users,
        color: "#ea580c",
        bg: "#ffedd5",
      },
    ];
  }, [data]);

  const trendPoints = useMemo(
    () =>
      (data?.revenue_trend ?? []).map((t) => ({
        key: t.trend_date,
        label: formatDateShort(t.trend_date),
        value: Number(t.total_quantity) || 0,
      })),
    [data],
  );

  const dowBars = useMemo(() => {
    const series = data?.current_week_revenue ?? [];
    return series.map((p) => {
      const d = new Date(p.trend_date);
      const label = Number.isNaN(d.getTime()) ? "" : DOW_LABELS[d.getDay()];
      return { label, value: Number(p.total_quantity) || 0 };
    });
  }, [data]);

  const paymentSegments = useMemo(() => {
    const pm = data?.payment_mode || {};
    const cash = Number(pm.paid_as_cash ?? pm.cash_amount ?? pm.cash ?? 0) || 0;
    const upi = Number(pm.paid_as_upi ?? pm.upi_amount ?? pm.upi ?? 0) || 0;
    const credit = Number(pm.paid_as_credit ?? pm.credit_amount ?? pm.credit ?? 0) || 0;
    const segs = [];
    if (cash > 0) segs.push({ label: "Cash", value: cash, color: "#059669" });
    if (upi > 0) segs.push({ label: "UPI", value: upi, color: "#6366f1" });
    if (credit > 0) segs.push({ label: "Credit", value: credit, color: "#dc2626" });
    return segs;
  }, [data]);

  const topShops = useMemo(
    () =>
      (data?.top_shops ?? []).map((s) => ({
        key: s.shop_uid,
        name: s.shop_owner_name || "—",
        revenue: Number(s.total_revenue) || 0,
      })),
    [data],
  );

  const topProducts = useMemo(
    () =>
      (data?.top_products ?? []).map((p) => ({
        key: p.product_uid,
        name: p.product_name || "—",
        revenue: Number(p.total_revenue) || 0,
      })),
    [data],
  );

  const leaderboard = useMemo(
    () =>
      (data?.leaderboard ?? []).slice(0, 25).map((v) => ({
        vehicle_number: v.vehicle_number || "—",
        driver_name: v.driver_name || "Unassigned",
        orders: Number(v.total_orders) || 0,
        revenue: Number(v.total_revenue) || 0,
      })),
    [data],
  );

  if (error) {
    return (
      <Card
        padding="lg"
        style={{ marginBottom: "var(--spacing-lg)", color: "#dc2626" }}
      >
        Failed to load overview report: {error}
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
            marginBottom: "var(--spacing-xl)",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
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
          <SectionCard title="Revenue Trend" subtitle="Loading…">
            <Skeleton width="100%" height="220px" borderRadius="8px" />
          </SectionCard>
        </div>
        <div
          className="report-grid-2"
          style={{ marginBottom: "var(--spacing-lg)" }}
        >
          <SectionCard title="Payment Mode" subtitle="Loading…">
            <Skeleton width="100%" height="180px" borderRadius="8px" />
          </SectionCard>
          <SectionCard title="Revenue by Day of Week" subtitle="Loading…">
            <Skeleton width="100%" height="180px" borderRadius="8px" />
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "var(--spacing-lg)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Revenue Trend"
          subtitle="Daily revenue across the selected range"
        >
          <AreaChart points={trendPoints} height={220} />
        </SectionCard>
      </div>

      <div
        className="report-grid-2"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <SectionCard title="Payment Mode">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-lg)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "0 0 auto" }}>
              <Donut segments={paymentSegments} centerLabel="Orders" />
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {paymentSegments.length === 0 && (
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.85rem",
                  }}
                >
                  No data
                </p>
              )}
              {paymentSegments.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: seg.color,
                      }}
                    />
                    <span style={{ fontSize: "0.85rem" }}>{seg.label}</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    {seg.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Revenue by Day of Week"
          subtitle="Current week (Sun–Sat)"
        >
          <VBarChart bars={dowBars} height={200} />
        </SectionCard>
      </div>

      <div
        className="report-grid-2"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <SectionCard title="Top 10 Shops">
          <RankedList items={topShops} barColor="var(--color-primary)" />
        </SectionCard>
        <SectionCard title="Top 10 Products by Revenue">
          <RankedList items={topProducts} barColor="#7c3aed" />
        </SectionCard>
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard title="Vehicle / Driver Leaderboard">
          {leaderboard.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-subtle)",
                fontSize: "0.85rem",
                textAlign: "center",
                padding: 20,
              }}
            >
              No sales in this range
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th className="num">Orders</th>
                    <th className="num">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((v, i) => (
                    <tr key={`${v.vehicle_number}-${i}`}>
                      <td className="muted-strong">{i + 1}</td>
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            fontFamily: "monospace",
                          }}
                        >
                          {v.vehicle_number}
                        </div>
                      </td>
                      <td>{v.driver_name}</td>
                      <td className="num strong">{v.orders}</td>
                      <td className="num strong">
                        {formatINRShort(v.revenue)}
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

export default OverviewReport;

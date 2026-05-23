import React from "react";
import {
  AreaChart,
  Donut,
  KPICard,
  RankedList,
  SectionCard,
  VBarChart,
  formatINRShort,
} from "./ReportHelpers";
import { TrendingUp } from "lucide-react";

const OverviewReport = ({
  isLoadingSales,
  overviewKpis,
  overviewTrend,
  paymentModeSegments,
  dowBars,
  paymentStatusBreakdown,
  aging,
  topShops,
  topProducts,
  vehicleLeaderboard,
  range,
}) => (
  <div className="animate-in">
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--spacing-lg)",
        marginBottom: "var(--spacing-xl)",
      }}
    >
      {isLoadingSales
        ? [1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div
                style={{
                  background: "var(--bg-body)",
                  borderRadius: 16,
                  padding: 24,
                  minHeight: 120,
                }}
              />
            </div>
          ))
        : overviewKpis.map((k) => <KPICard key={k.label} {...k} />)}
    </div>

    <div style={{ marginBottom: "var(--spacing-lg)" }}>
      <SectionCard
        title="Revenue Trend"
        subtitle="Daily revenue across the selected range"
        right={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#059669",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <TrendingUp size={16} /> {range.label}
          </div>
        }
      >
        <AreaChart points={overviewTrend} height={220} />
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
            <Donut segments={paymentModeSegments} centerLabel="Orders" />
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
            {paymentModeSegments.length === 0 && (
              <p
                style={{
                  color: "var(--color-text-subtle)",
                  fontSize: "0.85rem",
                }}
              >
                No data
              </p>
            )}
            {paymentModeSegments.map((seg) => (
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

      <SectionCard title="Revenue by Day of Week">
        <VBarChart bars={dowBars} height={200} />
      </SectionCard>
    </div>

    <div
      className="report-grid-2"
      style={{ marginBottom: "var(--spacing-lg)" }}
    >
      <SectionCard title="Payment Status">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {paymentStatusBreakdown.length === 0 && (
            <p
              style={{
                color: "var(--color-text-subtle)",
                fontSize: "0.85rem",
              }}
            >
              No data
            </p>
          )}
          {paymentStatusBreakdown.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 8,
                background: "var(--bg-body)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: item.c,
                  }}
                />
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {item.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {item.count} orders
                </span>
                <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                  {formatINRShort(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
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
        <RankedList
          items={topProducts.byRevenue}
          metaKey="units"
          metaSuffix="units"
          barColor="#7c3aed"
        />
      </SectionCard>
    </div>

    <div style={{ marginBottom: "var(--spacing-lg)" }}>
      <SectionCard title="Vehicle / Driver Leaderboard">
        {vehicleLeaderboard.length === 0 ? (
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
                  <th className="num">AOV</th>
                  <th className="num">Paid %</th>
                </tr>
              </thead>
              <tbody>
                {vehicleLeaderboard.map((v, i) => (
                  <tr key={v.vehicle_uid}>
                    <td className="muted-strong">{i + 1}</td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          fontFamily: "monospace",
                        }}
                      >
                        {v.registration}
                      </div>
                      {v.model && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-subtle)",
                          }}
                        >
                          {v.model}
                        </div>
                      )}
                    </td>
                    <td>{v.driver}</td>
                    <td className="num strong">{v.orders}</td>
                    <td className="num strong">{formatINRShort(v.revenue)}</td>
                    <td className="num">{formatINRShort(v.aov)}</td>
                    <td className="num">
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background:
                            v.paidPct >= 80
                              ? "#d1fae5"
                              : v.paidPct >= 50
                                ? "#fef3c7"
                                : "#fee2e2",
                          color:
                            v.paidPct >= 80
                              ? "#059669"
                              : v.paidPct >= 50
                                ? "#92400e"
                                : "#dc2626",
                        }}
                      >
                        {v.paidPct}%
                      </span>
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

export default OverviewReport;

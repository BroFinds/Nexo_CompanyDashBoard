import React from "react";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import { Filter, Boxes } from "lucide-react";
import { KPICard, SectionCard, AreaChart } from "./ReportHelpers";
import { useStockReport } from "../../context/useStockReport";

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

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

const StockReport = ({
  filterApplied,
  fromDate,
  toDate,
  vehicleUid,
  productUid,
}) => {
  const { data, isLoading, error } = useStockReport({
    enabled: filterApplied,
    fromDate,
    toDate,
    vehicleUid,
    productUid,
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
        Failed to load stock report: {error}
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
          <Card padding="lg">
            <Skeleton
              width="40px"
              height="40px"
              borderRadius="10px"
              style={{ marginBottom: 12 }}
            />
            <Skeleton width="60%" height="28px" style={{ marginBottom: 6 }} />
            <Skeleton width="80%" height="14px" />
          </Card>
        </div>

        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <SectionCard title="Daily Loading Trend" subtitle="Loading…">
            <Skeleton width="100%" height="220px" borderRadius="8px" />
          </SectionCard>
        </div>

        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <SectionCard title="Per Vehicle — Loaded vs Sold" subtitle="Loading…">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height="64px"
                  borderRadius="8px"
                />
              ))}
            </div>
          </SectionCard>
        </div>

        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <SectionCard title="Recent Loading Entries" subtitle="Loading…">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height="32px"
                  borderRadius="6px"
                />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  const totalLoaded = Number(data?.total_stock_added) || 0;
  const perVehicle = data?.per_vehicle_summary ?? [];
  const recent = data?.recent_records ?? [];
  const trendPoints = (data?.trend ?? []).map((t) => ({
    key: t.trend_date,
    label: formatDateShort(t.trend_date),
    value: Number(t.total_quantity) || 0,
  }));

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
          label="Units Loaded"
          value={totalLoaded.toLocaleString("en-IN")}
          icon={Boxes}
          color="#6366f1"
          bg="#e0e7ff"
          noDelta
        />
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Daily Loading Trend"
          subtitle={`Units loaded per day between ${fromDate || "—"} and ${toDate || "—"}`}
        >
          <AreaChart
            points={trendPoints}
            height={220}
            color="#7c3aed"
            formatY={(v) => `${v}u`}
          />
        </SectionCard>
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Per Vehicle — Loaded vs Sold"
          subtitle="Sell-through % highlights wastage or unsold stock"
          right={
            <Boxes size={18} style={{ color: "var(--color-text-subtle)" }} />
          }
        >
          {isLoading && perVehicle.length === 0 ? (
            <div style={{ padding: 20 }}>
              <div
                style={{
                  height: 120,
                  background: "var(--bg-body)",
                  borderRadius: 16,
                }}
              />
            </div>
          ) : perVehicle.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-subtle)",
                fontSize: "0.85rem",
                textAlign: "center",
                padding: 20,
              }}
            >
              No stock activity in this range
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {perVehicle.map((r) => {
                const loaded = Number(r.total_stock_added) || 0;
                const sold = Number(r.total_sales_quantity) || 0;
                const remaining = loaded - sold;
                const sellThrough = pct(sold, loaded);
                return (
                  <div
                    key={r.vehicle_uid}
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-body)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                        fontSize: "0.85rem",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{ fontFamily: "monospace", fontWeight: 700 }}
                        >
                          {r.vehicle_number}
                        </span>
                        <span style={{ color: "var(--color-text-subtle)" }}>
                          — {r.employee_name || "Unassigned"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          fontSize: "0.78rem",
                        }}
                      >
                        <span>
                          <span style={{ color: "var(--color-text-subtle)" }}>
                            Loaded:
                          </span>{" "}
                          <strong>{loaded}</strong>
                        </span>
                        <span>
                          <span style={{ color: "var(--color-text-subtle)" }}>
                            Sold:
                          </span>{" "}
                          <strong>{sold}</strong>
                        </span>
                        <span>
                          <span style={{ color: "var(--color-text-subtle)" }}>
                            Remaining:
                          </span>{" "}
                          <strong
                            style={{
                              color: remaining < 0 ? "#dc2626" : "inherit",
                            }}
                          >
                            {remaining}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          background: "rgba(0,0,0,0.06)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(sellThrough, 100)}%`,
                            background:
                              sellThrough >= 80
                                ? "#059669"
                                : sellThrough >= 50
                                  ? "#d97706"
                                  : "#dc2626",
                            borderRadius: 4,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          minWidth: 44,
                          textAlign: "right",
                        }}
                      >
                        {sellThrough}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <SectionCard
          title="Recent Loading Entries"
          subtitle="Latest 25 stock-loading entries in this selection"
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
              No loading entries in this range
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Product</th>
                    <th className="num">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e, i) => (
                    <tr
                      key={`${e.created_at}-${e.vehicle_number}-${e.product_name}-${i}`}
                    >
                      <td style={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(e.created_at)}
                      </td>
                      <td style={{ fontFamily: "monospace" }}>
                        {e.vehicle_number || "—"}
                      </td>
                      <td>{e.product_name || "—"}</td>
                      <td className="num strong">{e.total_quantity}</td>
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

export default StockReport;

import React, { useEffect, useMemo } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import {
  Truck,
  Route,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Package,
  Receipt,
  Wallet,
} from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";

const formatMoney = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
};

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

const DashboardPage = () => {
  const {
    vehicles,
    routes,
    stock,
    sales,
    fetchVehicles,
    fetchRoutes,
    fetchStock,
    fetchSales,
    isLoadingVehicles,
    isLoadingRoutes,
    isLoadingStock,
    isLoadingSales,
  } = useDeliwheels();

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
    fetchStock();
    fetchSales();
  }, [fetchVehicles, fetchRoutes, fetchStock, fetchSales]);

  const isLoading =
    isLoadingVehicles || isLoadingRoutes || isLoadingStock || isLoadingSales;

  const activeVehicles = vehicles.filter((v) => v.status === "active").length;
  const inactiveVehicles = vehicles.filter((v) => v.status !== "active").length;
  const activeRoutes = routes.filter((r) => r.status === "active").length;
  const inactiveRoutes = routes.filter((r) => r.status !== "active").length;

  const todaysSales = useMemo(
    () => sales.filter((s) => isToday(s.sale_date)),
    [sales],
  );
  const todaysRevenue = todaysSales.reduce(
    (sum, s) => sum + Number(s.grand_total || 0),
    0,
  );
  const pendingPayments = useMemo(
    () =>
      sales.filter(
        (s) => (s.payment_status_text || "").toUpperCase() !== "PAID",
      ),
    [sales],
  );
  const pendingAmount = pendingPayments.reduce(
    (sum, s) => sum + Number(s.grand_total || 0),
    0,
  );

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.sale_date || 0) - new Date(a.sale_date || 0))
        .slice(0, 4),
    [sales],
  );
  const recentLoadings = useMemo(
    () =>
      [...stock]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.loaded_date || 0) -
            new Date(a.created_at || a.loaded_date || 0),
        )
        .slice(0, 4),
    [stock],
  );

  const topVehicles = useMemo(() => {
    const map = new Map();
    for (const s of sales) {
      const key = s.vehicle_uid || s.vehicle_number || "—";
      const prev = map.get(key) || {
        vehicle_uid: s.vehicle_uid,
        vehicle_number: s.vehicle_number,
        revenue: 0,
        count: 0,
      };
      prev.revenue += Number(s.grand_total || 0);
      prev.count += 1;
      map.set(key, prev);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  }, [sales]);
  const topVehiclesMax = topVehicles[0]?.revenue || 0;

  const stats = [
    {
      label: "Total Vehicles",
      value: vehicles.length,
      sub: `${activeVehicles} active`,
      icon: Truck,
      color: "var(--color-primary)",
      bg: "var(--color-primary-subtle)",
    },
    {
      label: "Active Routes",
      value: activeRoutes,
      sub: `of ${routes.length} total`,
      icon: Route,
      color: "#0891b2",
      bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    },
    {
      label: "Today's Sales",
      value: todaysSales.length,
      sub: `${sales.length} all-time`,
      icon: PackageCheck,
      color: "#059669",
      bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    },
    {
      label: "Today's Revenue",
      value: `₹${formatCompact(todaysRevenue)}`,
      sub:
        pendingAmount > 0
          ? `₹${formatCompact(pendingAmount)} pending`
          : "All settled",
      icon: Wallet,
      color: "#7c3aed",
      bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    },
  ];

  const alerts = [];
  if (inactiveVehicles > 0)
    alerts.push({
      label: `${inactiveVehicles} vehicle${inactiveVehicles === 1 ? "" : "s"} inactive`,
      tone: "#d97706",
    });
  if (inactiveRoutes > 0)
    alerts.push({
      label: `${inactiveRoutes} route${inactiveRoutes === 1 ? "" : "s"} inactive`,
      tone: "#d97706",
    });
  if (pendingPayments.length > 0)
    alerts.push({
      label: `${pendingPayments.length} unpaid invoice${pendingPayments.length === 1 ? "" : "s"} (₹${formatMoney(pendingAmount)})`,
      tone: "#dc2626",
    });

  const getVehicleReg = (vuid) => {
    const v = vehicles.find((v) => v.vehicle_uid === vuid);
    return v ? v.registration : vuid;
  };

  return (
    <DeliwheelsLayout
      headerTitle="Dashboard"
      headerSubtitle="DeliWheels operations overview"
    >
      {/* Stats Grid */}
      <div
        className="dashboard-grid"
        style={{ marginBottom: "var(--spacing-xl)" }}
      >
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`animate-in ${i > 1 ? `delay-${(i - 1) * 100}` : ""}`}
              >
                <Card padding="lg" style={{ height: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "var(--spacing-md)",
                    }}
                  >
                    <Skeleton width="48px" height="48px" borderRadius="12px" />
                    <Skeleton width="16px" height="16px" borderRadius="4px" />
                  </div>
                  <Skeleton
                    width="60px"
                    height="32px"
                    style={{ marginBottom: "6px" }}
                  />
                  <Skeleton
                    width="100px"
                    height="14px"
                    style={{ marginBottom: "4px" }}
                  />
                  <Skeleton width="70px" height="12px" />
                </Card>
              </div>
            ))
          : stats.map((stat, index) => {
              const Icon = stat.icon;
              const delayClass = index === 0 ? "" : `delay-${index * 100}`;
              return (
                <div key={stat.label} className={`animate-in ${delayClass}`}>
                  <Card hoverable padding="lg" style={{ height: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stat.color,
                        }}
                      >
                        <Icon size={24} />
                      </div>
                      <TrendingUp
                        size={16}
                        style={{ color: "#10b981", marginTop: "4px" }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "2rem",
                        fontWeight: "800",
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        marginBottom: "4px",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "var(--color-text-main)",
                        marginBottom: "2px",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {stat.sub}
                    </p>
                  </Card>
                </div>
              );
            })}
      </div>

      {/* Alerts */}
      {!isLoading && alerts.length > 0 && (
        <div
          className="animate-in delay-100"
          style={{ marginBottom: "var(--spacing-lg)" }}
        >
          <Card padding="md" style={{ borderLeft: "4px solid #d97706" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#d97706",
                  fontWeight: 700,
                }}
              >
                <AlertTriangle size={18} />
                <span>Alerts</span>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {alerts.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      backgroundColor:
                        a.tone === "#dc2626"
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(245, 158, 11, 0.1)",
                      color: a.tone,
                    }}
                  >
                    {a.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Overview */}
      <div className="dashboard-overview-grid">
        {/* Top Performing Vehicles */}
        <div className="animate-in delay-200">
          <Card padding="lg">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--spacing-md)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                Top Performing Vehicles
              </h3>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--color-text-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                By revenue
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {isLoadingSales
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <Skeleton width="100px" height="14px" />
                        <Skeleton width="70px" height="14px" />
                      </div>
                      <Skeleton width="100%" height="6px" borderRadius="3px" />
                    </div>
                  ))
                : topVehicles.map((v, i) => {
                    const reg =
                      v.vehicle_number || getVehicleReg(v.vehicle_uid);
                    const pct =
                      topVehiclesMax > 0
                        ? (v.revenue / topVehiclesMax) * 100
                        : 0;
                    const medal =
                      ["#f59e0b", "#94a3b8", "#b45309", "var(--color-primary)"][
                        i
                      ] || "var(--color-primary)";
                    return (
                      <div key={v.vehicle_uid || reg}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginBottom: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: medal,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </span>
                            <Truck
                              size={14}
                              style={{
                                color: "var(--color-text-subtle)",
                                flexShrink: 0,
                              }}
                            />
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {reg}
                            </p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                fontFamily: "monospace",
                              }}
                            >
                              ₹{formatMoney(v.revenue)}
                            </p>
                            <p
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--color-text-subtle)",
                              }}
                            >
                              {v.count} sale{v.count === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            borderRadius: "3px",
                            backgroundColor: "var(--bg-body)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${medal}, ${medal}aa)`,
                              borderRadius: "3px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              {!isLoadingSales && topVehicles.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--color-text-subtle)",
                    padding: "20px",
                  }}
                >
                  No sales data yet
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Sales */}
        <div className="animate-in delay-300">
          <Card padding="lg">
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                marginBottom: "var(--spacing-md)",
              }}
            >
              Recent Sales
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {isLoadingSales
                ? [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--bg-body)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Skeleton
                          width="16px"
                          height="16px"
                          borderRadius="4px"
                        />
                        <div>
                          <Skeleton
                            width="120px"
                            height="14px"
                            style={{ marginBottom: "4px" }}
                          />
                          <Skeleton width="100px" height="12px" />
                        </div>
                      </div>
                      <Skeleton
                        width="60px"
                        height="20px"
                        borderRadius="12px"
                      />
                    </div>
                  ))
                : recentSales.map((s) => {
                    const paid =
                      (s.payment_status_text || "").toUpperCase() === "PAID";
                    return (
                      <div
                        key={s.sale_uid}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px",
                          borderRadius: "8px",
                          backgroundColor: "var(--bg-body)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            minWidth: 0,
                          }}
                        >
                          <Receipt
                            size={16}
                            style={{
                              color: paid ? "#059669" : "#d97706",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {s.shop_owner_name || s.invoice_no || "—"}
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-subtle)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ₹{formatMoney(s.grand_total)} ·{" "}
                              {s.vehicle_number || getVehicleReg(s.vehicle_uid)}
                            </p>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "600",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            flexShrink: 0,
                            backgroundColor: paid
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(245, 158, 11, 0.1)",
                            color: paid ? "#059669" : "#d97706",
                          }}
                        >
                          {paid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
              {!isLoadingSales && sales.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--color-text-subtle)",
                    padding: "20px",
                  }}
                >
                  No sales recorded yet
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Stock Loadings */}
        <div className="animate-in delay-400">
          <Card padding="lg">
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                marginBottom: "var(--spacing-md)",
              }}
            >
              Recent Loadings
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {isLoadingStock
                ? [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--bg-body)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Skeleton
                          width="16px"
                          height="16px"
                          borderRadius="4px"
                        />
                        <div>
                          <Skeleton
                            width="120px"
                            height="14px"
                            style={{ marginBottom: "4px" }}
                          />
                          <Skeleton width="100px" height="12px" />
                        </div>
                      </div>
                      <Skeleton
                        width="40px"
                        height="20px"
                        borderRadius="12px"
                      />
                    </div>
                  ))
                : recentLoadings.map((s) => (
                    <div
                      key={s.stock_uid}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "var(--bg-body)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          minWidth: 0,
                        }}
                      >
                        <Package
                          size={16}
                          style={{
                            color: "var(--color-primary)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.product_name || "—"}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--color-text-subtle)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.vehicle_number || getVehicleReg(s.vehicle_uid)} ·{" "}
                            {s.loaded_date || ""}
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: "600",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          flexShrink: 0,
                          backgroundColor: "rgba(124, 58, 237, 0.1)",
                          color: "#7c3aed",
                        }}
                      >
                        {s.quantity}×
                      </span>
                    </div>
                  ))}
              {!isLoadingStock && stock.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--color-text-subtle)",
                    padding: "20px",
                  }}
                >
                  No stock loaded yet
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .dashboard-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-lg);
        }
        @media (max-width: 1024px) {
          .dashboard-overview-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .dashboard-overview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </DeliwheelsLayout>
  );
};

export default DashboardPage;

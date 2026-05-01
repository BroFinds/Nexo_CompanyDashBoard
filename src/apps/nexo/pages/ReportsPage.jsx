import React, { useEffect, useState, useCallback, useMemo } from "react";
import NexoLayout from "../components/NexoLayout";
import Card from "@shared/components/ui/Card";
import { LayoutGrid, Activity, RefreshCw } from "lucide-react";
import { getSession, pingService } from "@/services/api";
import { APP_BY_ID } from "../constants/apps";

const STATUS_STYLE = {
  up: { label: "Active", bg: "#10b98115", color: "#10b981" },
  down: { label: "Down", bg: "#ef444415", color: "#ef4444" },
  checking: { label: "Checking…", bg: "#3b82f615", color: "#3b82f6" },
  pending: { label: "Pending", bg: "#f59e0b15", color: "#f59e0b" },
};

const ReportsPage = () => {
  // Stabilize the allocated-apps list so it doesn't get a new reference each render.
  // Key on a serialized form so the memo only changes when the actual list changes.
  const enabledAppsKey = JSON.stringify(getSession()?.apps ?? []);
  const baseModules = useMemo(() => {
    const ids = JSON.parse(enabledAppsKey);
    const list = [
      {
        id: "nexoapp",
        label: "Nexo Core",
        desc: "Employee & Product Management",
        service: "nexoapp",
        state: "checking",
      },
    ];
    ids.forEach((id) => {
      const meta = APP_BY_ID[id];
      if (!meta) return;
      list.push({
        id,
        label: meta.title,
        desc: meta.desc,
        service: meta.service,
        state: meta.service ? "checking" : "pending",
      });
    });
    return list;
  }, [enabledAppsKey]);

  const [modules, setModules] = useState(baseModules);
  const [isPinging, setIsPinging] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const runPings = useCallback(async () => {
    setIsPinging(true);
    setModules(baseModules);

    const results = await Promise.all(
      baseModules.map(async (m) => {
        if (!m.service) return { ...m, state: "pending" };
        const res = await pingService(m.service);
        return { ...m, state: res.ok ? "up" : "down" };
      }),
    );

    setModules(results);
    setLastChecked(new Date());
    setIsPinging(false);
  }, [baseModules]);

  // Run pings once on mount (and again only if the allocated-apps list actually changes).
  useEffect(() => {
    runPings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledAppsKey]);

  const upModules = modules.filter((m) => m.state === "up");
  const totalCheckable = modules.filter((m) => m.service).length;
  const allHealthy = totalCheckable > 0 && upModules.length === totalCheckable;
  const anyDown = modules.some((m) => m.state === "down");

  const systemStatusValue = isPinging
    ? "Checking…"
    : anyDown
      ? "Degraded"
      : allHealthy
        ? "Healthy"
        : "Unknown";
  const systemStatusColor = isPinging
    ? "#3b82f6"
    : anyDown
      ? "#ef4444"
      : allHealthy
        ? "#10b981"
        : "#f59e0b";
  const systemStatusSubtitle = isPinging
    ? "Pinging services"
    : `${upModules.length}/${totalCheckable} services up`;

  const stats = [
    {
      label: "Active Apps",
      value: isPinging ? "…" : upModules.length,
      subtitle: isPinging
        ? "Pinging…"
        : upModules.map((m) => m.label).join(", ") || "No apps online",
      icon: LayoutGrid,
      color: "#3b82f6",
    },
    {
      label: "System Status",
      value: systemStatusValue,
      subtitle: systemStatusSubtitle,
      icon: Activity,
      color: systemStatusColor,
    },
  ];

  return (
    <NexoLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "700",
              letterSpacing: "-0.02em",
              color: "var(--color-text-main)",
            }}
          >
            Reports & Analytics
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Overview of system usage and live status of your allocated modules.
            {lastChecked && (
              <span style={{ marginLeft: "8px", fontSize: "0.85rem" }}>
                · Last checked {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={runPings}
          disabled={isPinging}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface, white)",
            color: "var(--color-text-main)",
            fontWeight: "600",
            fontSize: "0.85rem",
            cursor: isPinging ? "not-allowed" : "pointer",
            opacity: isPinging ? 0.6 : 1,
          }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: isPinging ? "spin 1s linear infinite" : "none",
            }}
          />
          {isPinging ? "Checking…" : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--spacing-lg)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "var(--color-text-subtle)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "8px",
                    }}
                  >
                    {stat.label}
                  </h3>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: "var(--color-text-main)",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-text-subtle)",
                      marginTop: "8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stat.subtitle}
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card padding="none">
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            padding: "var(--spacing-lg)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          System Modules
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-body)",
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "var(--color-text-subtle)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  MODULE NAME
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "var(--color-text-subtle)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  DESCRIPTION
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "var(--color-text-subtle)",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m, i) => {
                const s = STATUS_STYLE[m.state];
                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom:
                        i < modules.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                    }}
                  >
                    <td style={{ padding: "16px", fontWeight: "600" }}>
                      {m.label}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {m.desc}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: s.bg,
                          color: s.color,
                          fontSize: "0.85rem",
                          fontWeight: "600",
                        }}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {modules.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    No modules allocated to this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <br />
    </NexoLayout>
  );
};

export default ReportsPage;

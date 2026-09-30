import React, { useRef } from "react";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Truck, Calendar, Package, ChevronRight } from "lucide-react";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const StatusBadge = ({ isComplete }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "4px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "700",
    whiteSpace: "nowrap",
    background: isComplete ? "#f0fdf4" : "#fffbeb",
    color: isComplete ? "#16a34a" : "#d97706",
    border: `1px solid ${isComplete ? "#86efac" : "#fde68a"}`,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: isComplete ? "#16a34a" : "#d97706", display: "inline-block" }} />
    {isComplete ? "Done" : "In Progress"}
  </span>
);

const ProgressBar = ({ total, delivered }) => {
  if (!total) return <span style={{ color: "var(--color-text-subtle)", fontSize: "0.8rem" }}>—</span>;
  const pct = Math.min(100, Math.round((delivered / total) * 100));
  const barColor = pct === 100 ? "#16a34a" : pct >= 80 ? "#059669" : pct >= 40 ? "#2563eb" : "#d97706";
  return (
    <div style={{ minWidth: "140px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>{delivered} / {total} units</span>
        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: barColor, fontFamily: "monospace" }}>{pct}%</span>
      </div>
      <div style={{ height: "6px", borderRadius: "999px", background: "var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px", background: barColor, transition: "width 0.3s" }} />
      </div>
    </div>
  );
};

const StockTable = ({
  showResults,
  deliveries = [],
  stockLoaded,
  isLoadingStock,
  stockHasMore,
  onLoadMore,
  onViewLogs,
}) => {
  const scrollContainerRef = useRef(null);
  const sentinelRef = useInfiniteScroll({
    hasMore: stockHasMore,
    isLoading: isLoadingStock,
    onLoadMore,
    root: scrollContainerRef,
  });

  return (
    <Card padding="none">
      <div
        ref={scrollContainerRef}
        style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 320px)" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-body)" }}>
              {["Delivery", "Products Loaded", "Progress", "Status", ""].map((h) => (
                <th key={h} style={{
                  position: "sticky", top: 0, zIndex: 10,
                  backgroundColor: "var(--bg-body)", padding: "14px 16px",
                  textAlign: "left", fontWeight: "600", fontSize: "0.8rem",
                  color: "var(--color-text-subtle)", textTransform: "uppercase",
                  letterSpacing: "0.04em", boxShadow: "0 1px 0 var(--border-subtle)",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Skeletons */}
            {!stockLoaded && isLoadingStock && [1, 2, 3, 4].map((i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "16px" }}>
                  <Skeleton width="160px" height="18px" style={{ marginBottom: "8px" }} />
                  <Skeleton width="110px" height="13px" />
                </td>
                {[1, 2, 3, 4].map((j) => (
                  <td key={j} style={{ padding: "16px" }}><Skeleton width="90px" height="16px" /></td>
                ))}
              </tr>
            ))}

            {/* Rows — one per vehicle per day */}
            {stockLoaded && deliveries.map((delivery) => (
              <tr
                key={delivery.key}
                style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-body)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {/* Delivery: vehicle + date */}
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <Truck size={15} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                      <span style={{ fontWeight: "700", fontSize: "0.95rem", fontFamily: "monospace" }}>
                        {delivery.vehicle_number || "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "var(--color-text-subtle)", paddingLeft: "2px" }}>
                      <Calendar size={12} />
                      {delivery.loaded_date || "—"}
                    </div>
                  </div>
                </td>

                {/* Products loaded — names listed */}
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {delivery.entries.map((e) => (
                      <div key={e.stock_uid} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
                        <Package size={11} style={{ color: "var(--color-text-subtle)", flexShrink: 0 }} />
                        <span style={{ color: "var(--color-text)", fontWeight: "500" }}>{e.product_name}</span>
                        <span style={{ color: "var(--color-text-subtle)", fontFamily: "monospace" }}>×{e.quantity}</span>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Aggregated progress */}
                <td style={{ padding: "14px 16px" }}>
                  <ProgressBar total={delivery.totalQty} delivered={delivery.deliveredQty} />
                </td>

                {/* Status */}
                <td style={{ padding: "14px 16px" }}>
                  <StatusBadge isComplete={delivery.is_delivery_complete} />
                </td>

                {/* Details */}
                <td style={{ padding: "14px 16px" }}>
                  <Button
                    variant="secondary"
                    onClick={() => onViewLogs(delivery)}
                    style={{ padding: "6px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}
                  >
                    Details <ChevronRight size={13} />
                  </Button>
                </td>
              </tr>
            ))}

            {/* Empty */}
            {stockLoaded && !isLoadingStock && deliveries.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--color-text-subtle)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Truck size={28} style={{ opacity: 0.3 }} />
                    <p style={{ fontWeight: "600" }}>No deliveries found</p>
                    <p style={{ fontSize: "0.85rem" }}>Adjust the filters or add stock to a vehicle.</p>
                  </div>
                </td>
              </tr>
            )}

            <tr>
              <td colSpan={5} style={{ padding: 0, border: "none" }}>
                <div ref={sentinelRef} style={{ height: "1px" }} />
                {isLoadingStock && deliveries.length > 0 && <InfiniteScrollLoader style={{ padding: "12px" }} />}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StockTable;

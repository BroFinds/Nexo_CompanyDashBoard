import React, { useRef } from "react";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Filter, Package, Truck, List } from "lucide-react";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const HEADERS = ["Product", "Total", "Delivered", "Remaining", "Vehicle", "Loaded Date", "Actions"];

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: "var(--bg-body)",
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "0.8rem",
  color: "var(--color-text-subtle)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  boxShadow: "0 1px 0 var(--border-subtle)",
};

const QtyBadge = ({ value, color }) => (
  <span
    style={{
      display: "inline-block",
      fontWeight: "700",
      fontFamily: "monospace",
      fontSize: "0.9rem",
      color,
    }}
  >
    {value}
  </span>
);

const StockTable = ({
  showResults,
  stock,
  visibleStock,
  stockLoaded,
  isLoadingStock,
  stockHasMore,
  onLoadMore,
  onEditEntry,
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
      {!showResults ? (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--bg-body)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Filter size={24} style={{ color: "var(--color-text-subtle)" }} />
          </div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              letterSpacing: "-0.01em",
            }}
          >
            Pick a filter to load stock
          </h3>
          <p
            style={{
              color: "var(--color-text-subtle)",
              fontSize: "0.9rem",
              maxWidth: "420px",
            }}
          >
            Choose a <strong>product</strong>, <strong>vehicle</strong>, or{" "}
            <strong>date</strong> above to load matching stock entries. Nothing
            is loaded by default.
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "calc(100vh - 340px)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-body)",
                }}
              >
                {HEADERS.map((h) => (
                  <th key={h} style={headerStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!stockLoaded &&
                isLoadingStock &&
                [1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <Skeleton
                          width={j === 1 ? "130px" : "70px"}
                          height="16px"
                        />
                      </td>
                    ))}
                  </tr>
                ))}

              {stockLoaded &&
                visibleStock.map((entry) => {
                  const total = entry.quantity || 0;
                  const delivered = entry.delivered_quantity || 0;
                  const remaining = entry.remaining_quantity ?? total - delivered;
                  const deliveredColor =
                    delivered > 0 ? "var(--color-success, #16a34a)" : "var(--color-text-subtle)";
                  const remainingColor =
                    remaining === 0
                      ? "var(--color-error, #dc2626)"
                      : remaining < total * 0.2
                      ? "var(--color-warning, #d97706)"
                      : "var(--color-text)";

                  return (
                    <tr
                      key={entry.stock_uid}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "var(--bg-body)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Package
                            size={16}
                            style={{
                              color: "var(--color-primary)",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontWeight: "600" }}>
                            {entry.product_name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <QtyBadge value={total} color="var(--color-text)" />
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <QtyBadge value={delivered} color={deliveredColor} />
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <QtyBadge value={remaining} color={remainingColor} />
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Truck
                            size={14}
                            style={{ color: "var(--color-text-subtle)" }}
                          />
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.85rem",
                            }}
                          >
                            {entry.vehicle_number}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        {entry.loaded_date}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            onClick={() => onEditEntry(entry)}
                            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => onViewLogs(entry)}
                            style={{
                              padding: "6px 10px",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <List size={13} /> Logs
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {stockLoaded && !isLoadingStock && visibleStock.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    No stock entries match the current filters.
                  </td>
                </tr>
              )}

              <tr>
                <td colSpan={7} style={{ padding: 0, border: "none" }}>
                  <div ref={sentinelRef} style={{ height: "1px" }} />
                  {isLoadingStock && stock.length > 0 && (
                    <InfiniteScrollLoader style={{ padding: "12px" }} />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default StockTable;

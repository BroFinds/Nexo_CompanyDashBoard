import React, { useRef } from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Filter, Eye, Wallet } from "lucide-react";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";
import {
  formatMoney,
  formatSaleDate,
  paymentStatusVariant,
} from "../utils/salesFormat";

const HEADERS = [
  "Invoice",
  "Shop Owner",
  "Vehicle",
  "Grand Total (₹)",
  "Date",
  "Payment",
  "Mode",
  "",
];

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

const SalesTable = ({
  showResults,
  sales,
  visibleSales,
  salesLoaded,
  isLoadingSales,
  salesHasMore,
  onLoadMore,
  onViewSale,
  onCollectPayment,
}) => {
  const scrollContainerRef = useRef(null);
  const sentinelRef = useInfiniteScroll({
    hasMore: salesHasMore,
    isLoading: isLoadingSales,
    onLoadMore,
    root: scrollContainerRef,
  });

  return (
    <Card padding="none">
      {!showResults ? (
        /* Loading skeleton shown while initial fetch is in progress */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-body)" }}>
                {["Invoice", "Shop / Owner", "Vehicle", "Grand Total", "Date", "Status", "Mode", ""].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontWeight: "600", fontSize: "0.8rem", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {[120, 140, 90, 70, 80, 60, 60, 50].map((w, j) => (
                    <td key={j} style={{ padding: "14px 16px" }}>
                      <Skeleton width={`${w}px`} height="16px" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "calc(100vh - 380px)",
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
                {HEADERS.map((h, i) => (
                  <th key={h || `col-${i}`} style={headerStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!salesLoaded &&
                isLoadingSales &&
                [1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <Skeleton
                          width={j === 2 ? "120px" : "70px"}
                          height="16px"
                        />
                      </td>
                    ))}
                  </tr>
                ))}

              {salesLoaded &&
                visibleSales.map((sale) => (
                  <tr
                    key={sale.sale_uid}
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
                    <td
                      style={{
                        padding: "14px 16px",
                        fontFamily: "monospace",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      {sale.invoice_no}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: "600" }}>
                      {sale.shop_owner_name}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {sale.vehicle_number}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontWeight: "700",
                        fontFamily: "monospace",
                      }}
                    >
                      ₹{formatMoney(sale.grand_total)}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {formatSaleDate(sale.sale_date)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge
                        variant={paymentStatusVariant(sale.payment_status_text)}
                      >
                        {sale.payment_status_text || "—"}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {sale.payment_mode_text || "—"}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        {(sale.payment_status_text || "").toUpperCase() !== "PAID" && (
                          <Button
                            onClick={() => onCollectPayment(sale)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.8rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "#f59e0b",
                              color: "#fff",
                              border: "none",
                            }}
                            title="Collect payment for this sale"
                          >
                            <Wallet size={14} /> Collect
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => onViewSale(sale.sale_uid)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="View sale details (read-only)"
                        >
                          <Eye size={14} /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

              {salesLoaded && !isLoadingSales && visibleSales.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    No sales match the current filters.
                  </td>
                </tr>
              )}

              <tr>
                <td colSpan={8} style={{ padding: 0, border: "none" }}>
                  <div ref={sentinelRef} style={{ height: "1px" }} />
                  {isLoadingSales && sales.length > 0 && (
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

export default SalesTable;

import React from "react";
import { Wallet } from "lucide-react";
import Card from "@shared/components/ui/Card";
import { formatMoney } from "../utils/salesFormat";

const StatCard = ({ label, value, count, color, delayClass, showResults }) => (
  <Card padding="lg" className={`animate-in${delayClass ? ` ${delayClass}` : ""}`}>
    <p
      style={{
        fontSize: "0.8rem",
        color: "var(--color-text-subtle)",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: "8px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: "1.6rem",
        fontWeight: "800",
        letterSpacing: "-0.02em",
        color,
        display: "flex",
        alignItems: "center",
        gap: "2px",
      }}
    >
      {showResults ? (
        <>
          <Wallet size={20} /> {formatMoney(value)}
        </>
      ) : (
        "—"
      )}
    </p>
    <p
      style={{
        fontSize: "0.7rem",
        color: "var(--color-text-subtle)",
        marginTop: "4px",
      }}
    >
      {showResults ? `${count} invoice${count === 1 ? "" : "s"}` : ""}
    </p>
  </Card>
);

const SalesStats = ({
  showResults,
  totalRevenue,
  paidRevenue,
  pendingRevenue,
  creditRevenue,
  totalOrders,
  paidCount,
  pendingCount,
  creditCount,
  hasMore,
}) => (
  <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "var(--spacing-lg)",
        marginBottom: "var(--spacing-xl)",
      }}
    >
      <StatCard
        label="Total Revenue"
        value={totalRevenue}
        count={totalOrders}
        showResults={showResults}
      />
      <StatCard
        label="Paid"
        value={paidRevenue}
        count={paidCount}
        color="#059669"
        delayClass="delay-100"
        showResults={showResults}
      />
      <StatCard
        label="Pending"
        value={pendingRevenue}
        count={pendingCount}
        color="#b45309"
        delayClass="delay-200"
        showResults={showResults}
      />
      <StatCard
        label="Credit"
        value={creditRevenue}
        count={creditCount}
        color="#7c3aed"
        delayClass="delay-300"
        showResults={showResults}
      />
    </div>
    {showResults && hasMore && (
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-subtle)",
          marginTop: "-12px",
          marginBottom: "var(--spacing-md)",
          fontStyle: "italic",
        }}
      >
        Stats reflect loaded results. Scroll the table to load more matching
        sales.
      </p>
    )}
  </>
);

export default SalesStats;

import React from "react";
import Card from "@shared/components/ui/Card";

const StockStats = ({ showResults, entryCount, totalLoaded }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "var(--spacing-lg)",
      marginBottom: "var(--spacing-xl)",
    }}
  >
    <Card padding="lg" className="animate-in">
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
        Matching Entries
      </p>
      <p
        style={{
          fontSize: "1.75rem",
          fontWeight: "800",
          letterSpacing: "-0.02em",
        }}
      >
        {showResults ? entryCount : "—"}
      </p>
    </Card>
    <Card padding="lg" className="animate-in delay-100">
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
        Total Loaded
      </p>
      <p
        style={{
          fontSize: "1.75rem",
          fontWeight: "800",
          letterSpacing: "-0.02em",
          color: "var(--color-primary)",
        }}
      >
        {showResults ? `${totalLoaded} units` : "—"}
      </p>
    </Card>
  </div>
);

export default StockStats;

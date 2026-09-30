import React from "react";
import Card from "@shared/components/ui/Card";
import { Truck, Clock, CheckCircle2 } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <Card padding="lg" className="animate-in">
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </p>
      <div style={{ width: 32, height: 32, borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <p style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em", color: color || "var(--color-text)" }}>
      {value}
    </p>
  </Card>
);

const StockStats = ({ showResults, entryCount, inProgressCount, doneCount }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
    <StatCard
      label="Total Deliveries"
      value={showResults ? entryCount : "—"}
      icon={Truck}
      color="var(--color-primary)"
      bg="var(--color-primary-subtle)"
    />
    <StatCard
      label="In Progress"
      value={showResults ? inProgressCount : "—"}
      icon={Clock}
      color="#d97706"
      bg="#fffbeb"
    />
    <StatCard
      label="Completed"
      value={showResults ? doneCount : "—"}
      icon={CheckCircle2}
      color="#16a34a"
      bg="#f0fdf4"
    />
  </div>
);

export default StockStats;

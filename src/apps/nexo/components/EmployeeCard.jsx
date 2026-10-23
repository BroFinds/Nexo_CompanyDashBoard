import React from "react";
import Badge from "@shared/components/ui/Badge";
import EntityCard, { EntityIcon } from "@shared/components/ui/EntityCard";
import { Phone } from "lucide-react";

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

const formatJoined = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const EmployeeCard = ({ employee, isActive, onCardClick }) => (
  <EntityCard
    onClick={onCardClick}
    muted={!isActive}
    leading={
      <EntityIcon
        round
        background={isActive ? "linear-gradient(135deg, #e0e7ff, #c7d2fe)" : "linear-gradient(135deg, #f1f5f9, #e2e8f0)"}
        color={isActive ? "var(--color-primary)" : "var(--color-text-subtle)"}
      >
        {initials(employee.name)}
      </EntityIcon>
    }
    title={employee.name}
    subtitle={
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <Phone size={12} />
        {employee.contact_number || "—"}
      </span>
    }
    badge={<Badge variant={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</Badge>}
    meta={[
      { label: "Joined", value: formatJoined(employee.date_of_joining) },
      { label: "UPI", value: employee.upi_id || "—" },
    ]}
  />
);

export default EmployeeCard;

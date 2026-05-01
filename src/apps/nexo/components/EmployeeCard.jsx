import React from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import { Phone } from "lucide-react";

const EmployeeCard = ({ employee, isActive, onCardClick }) => {
  return (
    <Card
      hoverable
      padding="lg"
      onClick={onCardClick}
      style={{
        cursor: "pointer",
        height: "100%",
        opacity: isActive ? 1 : 0.75,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: isActive
              ? "linear-gradient(135deg, #e0e7ff, #c7d2fe)"
              : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "700",
            color: isActive ? "var(--color-primary)" : "var(--color-text-subtle)",
          }}
        >
          {employee.name.charAt(0)}
        </div>
        <Badge variant={isActive ? "success" : "neutral"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "8px",
          color: isActive ? "var(--color-text)" : "var(--color-text-subtle)",
        }}
      >
        {employee.name}
      </h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: "var(--color-text-subtle)",
          fontSize: "0.85rem",
        }}
      >
        <Phone size={14} style={{ marginRight: "6px" }} />
        <span>{employee.contact_number}</span>
      </div>
    </Card>
  );
};

export default EmployeeCard;

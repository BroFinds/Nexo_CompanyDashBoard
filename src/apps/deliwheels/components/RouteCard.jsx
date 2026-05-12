import React from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";

const getStatusVariant = (s) =>
  s === "active" ? "success" : s === "paused" ? "warning" : "danger";

const RouteCard = ({ route, onClick }) => {
  return (
    <Card
      hoverable
      padding="lg"
      onClick={onClick}
      style={{
        cursor: "pointer",
        height: "100%",
        opacity: route.status === "inactive" ? 0.7 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            flex: 1,
            marginRight: "8px",
          }}
        >
          {route.origin} → {route.destination}
        </h3>
        <Badge variant={getStatusVariant(route.status)}>
          {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
        </Badge>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px",
          backgroundColor: "var(--bg-body)",
          borderRadius: "10px",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
            }}
          ></div>
          <div
            style={{
              width: "2px",
              height: "24px",
              backgroundColor: "var(--border-subtle)",
            }}
          ></div>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              border: "2px solid var(--color-primary)",
              backgroundColor: "white",
            }}
          ></div>
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            {route.origin}
          </p>
          <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>
            {route.destination}
          </p>
        </div>
      </div>
    </Card>
  );
};

export { getStatusVariant };
export default RouteCard;

import React from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import { Store, Phone, Route, User } from "lucide-react";

const ShopCard = ({ shop, routeLabel, onClick }) => {
  const isActive = shop.status === "active";

  return (
    <Card
      hoverable
      padding="lg"
      onClick={onClick}
      style={{ cursor: "pointer", height: "100%", opacity: isActive ? 1 : 0.7 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "var(--color-primary-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-primary)",
            flexShrink: 0,
          }}
        >
          <Store size={24} />
        </div>
        <Badge variant={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <h3
        style={{
          fontWeight: "700",
          fontSize: "1rem",
          marginBottom: "2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {shop.shop_name || shop.shop_owner_name}
      </h3>

      {shop.shop_name && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--color-text-subtle)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "4px",
          }}
        >
          {shop.shop_owner_name}
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "var(--spacing-md)",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-text-subtle)",
            fontSize: "0.82rem",
          }}
        >
          <Phone size={13} />
          <span>{shop.shop_contact_number}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-primary)",
            fontSize: "0.82rem",
            fontWeight: "600",
          }}
        >
          <Route size={13} />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {routeLabel || "No route assigned"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ShopCard;

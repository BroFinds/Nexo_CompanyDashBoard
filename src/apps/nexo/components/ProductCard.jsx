import React from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import { Package } from "lucide-react";

const ProductCard = ({ product, isActive, onCardClick }) => {
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
            borderRadius: "12px",
            background: isActive
              ? "linear-gradient(135deg, #ffedd5, #fdba74)"
              : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isActive ? "#c2410c" : "var(--color-text-subtle)",
          }}
        >
          <Package size={24} />
        </div>
        <Badge variant={isActive ? "success" : "neutral"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "4px",
          lineHeight: 1.3,
          color: isActive ? "var(--color-text)" : "var(--color-text-subtle)",
        }}
      >
        {product.product_name}
      </h3>
      <p
        style={{
          color: "var(--color-text-subtle)",
          fontSize: "0.85rem",
          marginBottom: "var(--spacing-md)",
          fontFamily: "monospace",
        }}
      >
        {product.product_code}
      </p>
    </Card>
  );
};

export default ProductCard;

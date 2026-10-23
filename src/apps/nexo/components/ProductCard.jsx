import React from "react";
import Badge from "@shared/components/ui/Badge";
import EntityCard, { EntityIcon } from "@shared/components/ui/EntityCard";
import { Package } from "lucide-react";

// "Litre (Ltr)" -> "Ltr"
const unitShort = (text) => text.match(/\(([^)]+)\)/)?.[1] || text;

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const ProductCard = ({ product, isActive, onCardClick }) => {
  const size = product.measurement_text
    ? `${product.measurement_value} ${unitShort(product.measurement_text)}`
    : "";
  return (
    <EntityCard
      onClick={onCardClick}
      muted={!isActive}
      leading={
        <EntityIcon
          background={isActive ? "linear-gradient(135deg, #ffedd5, #fdba74)" : "linear-gradient(135deg, #f1f5f9, #e2e8f0)"}
          color={isActive ? "#c2410c" : "var(--color-text-subtle)"}
        >
          <Package size={20} />
        </EntityIcon>
      }
      title={product.product_name}
      subtitle={
        <>
          <span style={{ fontFamily: "monospace" }}>{product.product_code}</span>
          {size && ` · ${size}`}
        </>
      }
      badge={<Badge variant={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</Badge>}
      meta={[
        { label: "Price", value: formatPrice(product.general_price) },
        { label: "Wholesale", value: formatPrice(product.wholesale_price) },
      ]}
    />
  );
};

export default ProductCard;

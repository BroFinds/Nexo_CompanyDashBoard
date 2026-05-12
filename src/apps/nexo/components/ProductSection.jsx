import React from "react";
import ProductCard from "./ProductCard";

const ProductSection = ({
  title,
  products,
  emptyMessage,
  onCardClick,
  isFreshProduct,
  style,
}) => {
  let freshIdx = 0;

  return (
    <div style={style}>
      <h3
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: "600",
          marginBottom: "var(--spacing-md)",
          color: "var(--color-text)",
        }}
      >
        {title}
        <span
          style={{
            marginLeft: "8px",
            fontSize: "var(--text-sm)",
            fontWeight: "500",
            color: "var(--color-text-subtle)",
          }}
        >
          ({products.length})
        </span>
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--spacing-lg)",
        }}
      >
        {products.map((product, index) => {
          const fresh = isFreshProduct
            ? isFreshProduct(product.product_uid)
            : false;
          const localFreshIdx = fresh ? freshIdx++ : 0;
          const className = fresh
            ? `animate-fresh delay-${(localFreshIdx % 4) * 100}`
            : `animate-in delay-${(index % 3) * 100}`;
          return (
            <div key={product.product_uid} className={className}>
              <ProductCard
                product={product}
                isActive={product.is_active}
                onCardClick={() => onCardClick(product)}
              />
            </div>
          );
        })}
        {products.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
              color: "var(--color-text-subtle)",
            }}
          >
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSection;

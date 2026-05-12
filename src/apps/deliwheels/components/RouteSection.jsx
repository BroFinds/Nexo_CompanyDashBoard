import React from "react";
import RouteCard from "./RouteCard";

const RouteSection = ({
  title,
  routes,
  emptyMessage,
  onCardClick,
  style,
}) => {
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
          ({routes.length})
        </span>
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "var(--spacing-lg)",
        }}
      >
        {routes.map((route, index) => (
          <div
            key={route.route_uid}
            className={`animate-in delay-${(index % 3) * 100}`}
          >
            <RouteCard route={route} onClick={() => onCardClick(route)} />
          </div>
        ))}
        {routes.length === 0 && (
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

export default RouteSection;

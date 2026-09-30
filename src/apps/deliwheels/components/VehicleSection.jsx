import React from "react";
import VehicleCard from "./VehicleCard";

const VehicleSection = ({
  title,
  vehicles,
  emptyMessage,
  onCardClick,
  getDriverName,
  deliveryStatusMap,
  onCompleteDelivery,
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
          ({vehicles.length})
        </span>
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--spacing-lg)",
        }}
      >
        {vehicles.map((v, i) => (
          <div
            key={v.vehicle_uid}
            className={`animate-in delay-${(i % 3) * 100}`}
          >
            <VehicleCard
              vehicle={v}
              driverName={getDriverName(v)}
              onClick={() => onCardClick(v)}
              deliveryStatus={deliveryStatusMap?.[v.vehicle_uid]}
              onCompleteDelivery={onCompleteDelivery}
            />
          </div>
        ))}
        {vehicles.length === 0 && (
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

export default VehicleSection;

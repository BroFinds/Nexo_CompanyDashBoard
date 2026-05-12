import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import { Truck } from "lucide-react";

const VehicleDetailModal = ({
  vehicle,
  onClose,
  onEdit,
  onDisable,
  getDriverName,
  getRouteLabel,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!vehicle) {
      setConfirmingDelete(false);
      setDeleteError("");
    }
  }, [vehicle]);

  const handleDisable = async () => {
    setDeleteError("");
    try {
      await onDisable(vehicle.vehicle_uid);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete. Try again.",
      );
    }
  };

  const tiles = vehicle
    ? [
        { l: "Status", v: vehicle.status },
        { l: "Driver", v: getDriverName(vehicle) },
        { l: "Assigned Route", v: getRouteLabel(vehicle), span: true },
      ]
    : [];

  return (
    <Modal isOpen={!!vehicle} onClose={onClose} title="Vehicle Details">
      {vehicle && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-md)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "var(--color-primary-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
              }}
            >
              <Truck size={32} />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                }}
              >
                {vehicle.registration || "—"}
              </h3>
              <p style={{ color: "var(--color-text-subtle)" }}>
                {vehicle.model || "Unnamed"}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "var(--spacing-md)",
            }}
          >
            {tiles.map((i) => (
              <div
                key={i.l}
                style={{
                  padding: "12px",
                  background: "var(--bg-body)",
                  borderRadius: "8px",
                  gridColumn: i.span ? "1 / -1" : "auto",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.8rem",
                    marginBottom: "4px",
                  }}
                >
                  {i.l}
                </p>
                <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{i.v}</p>
              </div>
            ))}
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border-subtle)",
              margin: "var(--spacing-md) 0",
            }}
          />
          {deleteError && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.85rem",
                background: "#fee2e2",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              {deleteError}
            </p>
          )}
          {!confirmingDelete ? (
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <Button
                fullWidth
                variant="primary"
                onClick={() => onEdit(vehicle)}
              >
                Edit Vehicle
              </Button>
              {vehicle.status !== "inactive" && (
                <Button
                  variant="danger"
                  onClick={() => setConfirmingDelete(true)}
                  style={{ padding: "0 20px" }}
                >
                  Disable
                </Button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
                padding: "12px",
                background: "#fee2e2",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#dc2626",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                Disable {vehicle.registration}? It will be marked inactive.
              </p>
              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button fullWidth variant="danger" onClick={handleDisable}>
                  Confirm Disable
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default VehicleDetailModal;

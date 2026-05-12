import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import { MapPin } from "lucide-react";
import { getStatusVariant } from "../../../components/RouteCard";

const RouteDetailModal = ({ route, onClose, onEdit, onDisable }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!route) {
      setConfirmingDelete(false);
      setDeleteError("");
    }
  }, [route]);

  const handleDisable = async () => {
    setDeleteError("");
    try {
      await onDisable(route.route_uid);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete. Try again.",
      );
    }
  };

  return (
    <Modal isOpen={!!route} onClose={onClose} title="Route Details">
      {route && (
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
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
              {route.origin} → {route.destination}
            </h3>
            <Badge variant={getStatusVariant(route.status)}>
              {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
            </Badge>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--bg-body)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-primary-subtle)",
                  color: "var(--color-primary)",
                }}
              >
                <MapPin size={18} />
              </div>
              <span style={{ fontWeight: "600" }}>{route.origin}</span>
            </div>
            <div
              style={{
                marginLeft: "18px",
                borderLeft: "2px dashed var(--border-subtle)",
                height: "32px",
              }}
            ></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                }}
              >
                <MapPin size={18} />
              </div>
              <span style={{ fontWeight: "600" }}>{route.destination}</span>
            </div>
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
              <Button fullWidth variant="primary" onClick={() => onEdit(route)}>
                Edit Route
              </Button>
              {route.status !== "inactive" && (
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
                Disable "{route.origin} to {route.destination}"? It will be
                moved to the Inactive list.
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

export default RouteDetailModal;

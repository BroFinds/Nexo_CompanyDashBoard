import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";

const EMPTY_ROUTE = {
  name: "",
  origin: "",
  destination: "",
  status: "active",
  is_active: true,
  is_bidirectional: false,
};

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid var(--border-subtle)",
  outline: "none",
  fontSize: "0.9rem",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: "600",
  marginBottom: "6px",
};

const RouteFormModal = ({
  isOpen,
  onClose,
  initialRoute,
  onAdd,
  onUpdate,
  onSetStatus,
}) => {
  const isEditMode = !!initialRoute;
  const [formData, setFormData] = useState({ ...EMPTY_ROUTE });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (initialRoute) {
      setFormData({
        ...initialRoute,
        is_active: initialRoute.status !== "inactive",
        is_bidirectional: initialRoute.is_bidirectional ?? false,
      });
    } else {
      setFormData({ ...EMPTY_ROUTE });
    }
    setFormError("");
  }, [isOpen, initialRoute]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSave = async () => {
    if (!formData.origin || !formData.destination) {
      setFormError("Origin and destination are required.");
      return;
    }
    const routeName =
      formData.name || `${formData.origin} → ${formData.destination}`;

    try {
      if (isEditMode) {
        await onUpdate({ ...formData, name: routeName, isBidirectional: !!formData.is_bidirectional });
        const wasActive = formData.status !== "inactive";
        if (formData.is_active !== wasActive) {
          await onSetStatus(formData.route_uid, !!formData.is_active);
        }
      } else {
        await onAdd({ ...formData, name: routeName, isBidirectional: !!formData.is_bidirectional });
      }
      onClose();
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to save route. Try again.",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Route" : "Add New Route"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>Origin *</label>
            <input
              name="origin"
              value={formData.origin}
              onChange={handleFormChange}
              placeholder="Starting point"
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Destination *</label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleFormChange}
              placeholder="End point"
              style={fieldStyle}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="routeIsActive"
              checked={!!formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: "20px", height: "20px", accentColor: "var(--color-primary)" }}
            />
            <label htmlFor="routeIsActive" style={{ fontSize: "0.9rem", fontWeight: "500" }}>
              Is Active Route
            </label>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "10px" }}>
            <input
              type="checkbox"
              id="routeBidirectional"
              checked={!!formData.is_bidirectional}
              onChange={(e) => setFormData({ ...formData, is_bidirectional: e.target.checked })}
              style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: "var(--color-primary)" }}
            />
            <div>
              <label htmlFor="routeBidirectional" style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                Bidirectional Route (A ↔ B)
              </label>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginTop: "2px" }}>
                Shops on this route are visible to drivers going in either direction (e.g. Kundapur ↔ Mangalore).
              </p>
            </div>
          </div>
        </div>
        {formError && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "0.85rem",
              background: "#fee2e2",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            {formError}
          </p>
        )}
        <Button onClick={handleSave} fullWidth size="lg">
          {isEditMode ? "Save Changes" : "Add Route"}
        </Button>
      </div>
    </Modal>
  );
};

export default RouteFormModal;

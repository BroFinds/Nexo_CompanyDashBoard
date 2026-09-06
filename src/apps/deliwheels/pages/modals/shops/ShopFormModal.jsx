import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";

const EMPTY_SHOP = {
  shop_name: "",
  shop_owner_name: "",
  shop_contact_number: "",
  route_uid: "",
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

const ShopFormModal = ({ isOpen, onClose, initialShop, routes, onAdd, onUpdate }) => {
  const isEditMode = !!initialShop;
  const [formData, setFormData] = useState({ ...EMPTY_SHOP });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFormData(initialShop ? { ...initialShop } : { ...EMPTY_SHOP });
    setFormError("");
  }, [isOpen, initialShop]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSave = async () => {
    if (!formData.shop_name.trim()) {
      setFormError("Shop name is required.");
      return;
    }
    if (!formData.shop_owner_name.trim()) {
      setFormError("Shop owner name is required.");
      return;
    }
    if (!formData.shop_contact_number.trim()) {
      setFormError("Contact number is required.");
      return;
    }
    if (!formData.route_uid) {
      setFormError("Please assign a route to this shop.");
      return;
    }
    try {
      if (isEditMode) {
        await onUpdate(formData);
      } else {
        await onAdd(formData);
      }
      onClose();
    } catch (e) {
      setFormError(e.response?.data?.message || "Failed to save shop. Try again.");
    }
  };

  const activeRoutes = (routes || []).filter((r) => r.status === "active");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Shop" : "Add New Shop"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Shop Name *</label>
          <input
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            placeholder="e.g. Ravi Stores"
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Owner Name *</label>
          <input
            name="shop_owner_name"
            value={formData.shop_owner_name}
            onChange={handleChange}
            placeholder="e.g. Ravi Kumar"
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Contact Number *</label>
          <input
            name="shop_contact_number"
            value={formData.shop_contact_number}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Assign Route *</label>
          <select
            name="route_uid"
            value={formData.route_uid}
            onChange={handleChange}
            style={fieldStyle}
          >
            <option value="">— Select a route —</option>
            {activeRoutes.map((r) => (
              <option key={r.route_uid} value={r.route_uid}>
                {r.origin} → {r.destination}
              </option>
            ))}
          </select>
          {activeRoutes.length === 0 && (
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>
              No active routes found. Create a route first.
            </p>
          )}
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
          {isEditMode ? "Save Changes" : "Add Shop"}
        </Button>
      </div>
    </Modal>
  );
};

export default ShopFormModal;

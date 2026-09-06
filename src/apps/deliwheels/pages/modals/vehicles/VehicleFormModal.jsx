import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

const EMPTY_VEHICLE = {
  registration: "",
  model: "",
  status: "active",
  is_active: true,
  driver: "Unassigned",
  employee_uid: "",
  username: "",
  password: "",
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

const VehicleFormModal = ({
  isOpen,
  onClose,
  initialVehicle,
  employees,
  onAdd,
  onUpdate,
  onSetStatus,
}) => {
  const isEditMode = !!initialVehicle;
  const [formData, setFormData] = useState({ ...EMPTY_VEHICLE });
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialVehicle) {
      setFormData({
        ...initialVehicle,
        is_active: initialVehicle.status === "active",
      });
    } else {
      setFormData({ ...EMPTY_VEHICLE });
    }
    setFormError("");
    setShowPassword(false);
  }, [isOpen, initialVehicle]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "employee_uid") {
      const emp = (employees || []).find((em) => em.employee_uid === value);
      setFormData((prev) => ({
        ...prev,
        employee_uid: value,
        driver: emp?.name || "Unassigned",
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formError) setFormError("");
  };

  const handleSave = async () => {
    if (!formData.registration || !formData.model) {
      setFormError("Registration and model are required.");
      return;
    }
    if (!isEditMode && (!formData.username || !formData.password)) {
      setFormError("Vehicle username and password are required.");
      return;
    }
    if (formData.username && formData.username.length < 6) {
      setFormError("Username must be at least 6 characters.");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    try {
      let saved;
      if (isEditMode) {
        saved = await onUpdate(formData);
      } else {
        saved = await onAdd(formData);
      }
      const desiredActive = !!formData.is_active;
      const currentlyActive = (saved?.status || "active") === "active";
      if (desiredActive !== currentlyActive && saved?.vehicle_uid) {
        await onSetStatus(saved.vehicle_uid, desiredActive);
      }
      onClose();
    } catch (e) {
      setFormError(
        e.response?.data?.message || "Failed to save vehicle. Check console.",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
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
            <label style={labelStyle}>Registration *</label>
            <input
              name="registration"
              value={formData.registration}
              onChange={handleFormChange}
              placeholder="e.g. KA-01-XX-1234"
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Model *</label>
            <input
              name="model"
              value={formData.model}
              onChange={handleFormChange}
              placeholder="e.g. Tata Ace"
              style={fieldStyle}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>
              Vehicle Username {!isEditMode && "*"}
            </label>
            <input
              name="username"
              value={formData.username || ""}
              onChange={handleFormChange}
              placeholder="e.g. vehicle_ka01"
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Vehicle Password {!isEditMode && "*"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={handleFormChange}
                style={{ ...fieldStyle, paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--color-text-subtle)",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-subtle)",
                marginTop: "4px",
              }}
            >
              {isEditMode
                ? "Leave blank to keep current password."
                : "Used by the driver to sign in to the mobile app."}
            </p>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Driver</label>
          <select
            name="employee_uid"
            value={formData.employee_uid || ""}
            onChange={handleFormChange}
            style={fieldStyle}
          >
            <option value="">— Unassigned —</option>
            {(employees || [])
              .filter((e) => e.is_active)
              .map((emp) => (
                <option key={emp.employee_uid} value={emp.employee_uid}>
                  {emp.name}
                </option>
              ))}
          </select>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>
            Route is assigned automatically when stock is loaded onto this vehicle.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            id="vehicleActive"
            name="is_active"
            checked={!!formData.is_active}
            onChange={handleFormChange}
            style={{
              width: "20px",
              height: "20px",
              accentColor: "var(--color-primary)",
            }}
          />
          <label
            htmlFor="vehicleActive"
            style={{ fontSize: "0.9rem", fontWeight: "500" }}
          >
            Active Vehicle
          </label>
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
          {isEditMode ? "Save Changes" : "Add Vehicle"}
        </Button>
      </div>
    </Modal>
  );
};

export default VehicleFormModal;

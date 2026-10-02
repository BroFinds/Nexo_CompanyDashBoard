import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import { Eye, EyeOff } from "lucide-react";

const EMPTY_VEHICLE = {
  registration: "",
  model: "",
  status: "active",
  is_active: true,
  driver: "Unassigned",
  employee_uid: "",
  route_uid: "",
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
  routes,
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
      const selectedEmployee = (employees || []).find(
        (emp) => emp.employee_uid === initialVehicle.employee_uid,
      );
      const selectedEmployeeUid = selectedEmployee?.employee_uid || "";
      const selectedEmployeeName = selectedEmployee?.name || initialVehicle.driver || "Unassigned";
      const selectedRouteUid = initialVehicle.route_uid || "";

      setFormData({
        ...EMPTY_VEHICLE,
        ...initialVehicle,
        employee_uid: selectedEmployeeUid,
        route_uid: selectedRouteUid,
        driver: selectedEmployeeName,
        is_active: initialVehicle.status === "active",
      });
    } else {
      const activeRoutes = (routes || []).filter((r) => r.status === "active");
      const activeEmployees = (employees || []).filter((e) => e.is_active);
      const defaultRoute = activeRoutes.length === 1 ? activeRoutes[0].route_uid : "";
      const defaultEmployee = activeEmployees.length === 1 ? activeEmployees[0].employee_uid : "";
      const defaultEmployeeName = activeEmployees.length === 1 ? activeEmployees[0].name : "Unassigned";
      setFormData({
        ...EMPTY_VEHICLE,
        route_uid: defaultRoute,
        employee_uid: defaultEmployee,
        driver: defaultEmployeeName,
      });
    }
    setFormError("");
    setShowPassword(false);
  }, [isOpen, initialVehicle, routes, employees]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formError) setFormError("");
  };

  const handleSelectChange = (name, value) => {
    if (name === "employee_uid") {
      const emp = (employees || []).find((em) => em.employee_uid === value);
      setFormData((prev) => ({
        ...prev,
        employee_uid: value,
        driver: emp?.name || "Unassigned",
      }));
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>Driver</label>
            <SearchableSelect
              options={(employees || [])
                .filter((e) => e.is_active)
                .map((emp) => ({
                  value: emp.employee_uid,
                  label: emp.name,
                  sub: emp.role || "Active employee",
                }))}
              value={formData.employee_uid || ""}
              onChange={(val) => handleSelectChange("employee_uid", val)}
              placeholder="Search driver..."
              noResultsText="No drivers found"
            />
          </div>
          <div>
            <label style={labelStyle}>Assign Route</label>
            <SearchableSelect
              options={(routes || [])
                .filter((r) => r.status === "active")
                .map((r) => ({
                  value: r.route_uid,
                  label: `${r.origin} → ${r.destination}`,
                  sub: r.route_code || "Active route",
                }))}
              value={formData.route_uid || ""}
              onChange={(val) => handleSelectChange("route_uid", val)}
              placeholder="Search route..."
              noResultsText="No routes found"
            />
          </div>
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

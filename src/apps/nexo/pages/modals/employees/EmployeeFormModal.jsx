import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Input from "@shared/components/ui/Input";
import Button from "@shared/components/ui/Button";

const EMPTY_FORM = {
  employee_uid: null,
  name: "",
  contact_number: "+91 ",
  pan_card: "",
  aadhaar: "",
  upi_id: "",
  gender: "Male",
  date_of_joining: "",
  is_active: true,
};

const employeeToForm = (employee) => ({
  employee_uid: employee.employee_uid,
  name: employee.name,
  contact_number: employee.contact_number,
  pan_card: employee.pan_card || "",
  aadhaar: employee.aadhaar || "",
  upi_id: employee.upi_id || "",
  gender: employee.gender || "Male",
  date_of_joining: employee.date_of_joining
    ? new Date(employee.date_of_joining).toISOString().split("T")[0]
    : "",
  is_active: employee.is_active,
});

const EmployeeFormModal = ({
  isOpen,
  onClose,
  initialEmployee,
  onAdd,
  onUpdate,
}) => {
  const isEditMode = !!initialEmployee;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(initialEmployee ? employeeToForm(initialEmployee) : EMPTY_FORM);
      setFormErrors({});
      setSaveError("");
    }
  }, [isOpen, initialEmployee]);

  const validateForm = () => {
    const errors = {};

    if (formData.pan_card && formData.pan_card.length !== 10) {
      errors.pan_card = "PAN must be exactly 10 characters";
    }

    if (formData.aadhaar) {
      const aadhaarClean = formData.aadhaar.replace(/\s/g, "");
      if (!/^\d{12}$/.test(aadhaarClean)) {
        errors.aadhaar = "Aadhaar must be 12 digits (numeric)";
      }
    }

    const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
    if (!phoneRegex.test(formData.contact_number)) {
      errors.contact_number = "Invalid Indian mobile number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      if (isEditMode && formData.employee_uid) {
        await onUpdate(formData);
      } else {
        await onAdd(formData);
      }
      onClose();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Employee" : "Add New Employee"}
    >
      <form onSubmit={handleSubmit}>
        <Input
          id="empName"
          label="Full Name"
          placeholder="e.g. John Doe"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          id="empPhone"
          label="Contact Number"
          placeholder="+91 98765 43210"
          required
          value={formData.contact_number}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9+\s-]/g, "");
            if (val.length <= 15)
              setFormData({ ...formData, contact_number: val });
          }}
          error={formErrors.contact_number}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--spacing-md)",
          }}
        >
          <Input
            id="empPan"
            label="PAN Card"
            placeholder="ABCDE1234F"
            value={formData.pan_card}
            onChange={(e) => {
              const val = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              if (val.length <= 10)
                setFormData({ ...formData, pan_card: val });
            }}
            error={formErrors.pan_card}
          />
          <Input
            id="empAadhaar"
            label="Aadhaar Number"
            placeholder="123456789012"
            value={formData.aadhaar}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 12)
                setFormData({ ...formData, aadhaar: val });
            }}
            error={formErrors.aadhaar}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--spacing-md)",
          }}
        >
          <Input
            id="empUpi"
            label="UPI ID"
            placeholder="user@bank"
            value={formData.upi_id}
            onChange={(e) =>
              setFormData({ ...formData, upi_id: e.target.value })
            }
          />
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <Input
          id="empDOJ"
          label="Date of Joining"
          type="date"
          value={formData.date_of_joining}
          onChange={(e) =>
            setFormData({ ...formData, date_of_joining: e.target.value })
          }
        />

        <div
          className="form-group"
          style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}
        >
          <input
            type="checkbox"
            id="empActive"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            style={{
              width: "20px",
              height: "20px",
              accentColor: "var(--color-primary)",
            }}
          />
          <label
            htmlFor="empActive"
            style={{ fontSize: "0.9rem", fontWeight: "500" }}
          >
            Active Account
          </label>
        </div>

        {saveError && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "0.85rem",
              background: "#fee2e2",
              padding: "8px 12px",
              borderRadius: "8px",
            }}
          >
            {saveError}
          </p>
        )}
        <div
          style={{
            marginTop: "var(--spacing-lg)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--spacing-sm)",
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;

import React, { useState, useEffect } from "react";
import NexoLayout from "../components/NexoLayout";
import EmployeeCard from "../components/EmployeeCard";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Input from "@shared/components/ui/Input";
import Badge from "@shared/components/ui/Badge";
import Modal from "@shared/components/ui/Modal";
import Skeleton from "@shared/components/ui/Skeleton";
import { Plus, Search, Phone } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";

const EmployeesPage = () => {
  const {
    employees,
    isLoadingEmployees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    disableEmployee,
  } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch Data on Load
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Form State
  const [formData, setFormData] = useState({
    employee_uid: null,
    name: "",
    contact_number: "+91 ",
    pan_card: "",
    aadhaar: "",
    upi_id: "",
    gender: "Male",
    date_of_joining: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState({});

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

  const resetForm = () => {
    setFormData({
      employee_uid: null,
      name: "",
      contact_number: "+91 ",
      pan_card: "",
      aadhaar: "",
      upi_id: "",
      gender: "Male",
      date_of_joining: "",
      is_active: true,
    });
    setFormErrors({});
    setSaveError("");
    setIsEditMode(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      if (isEditMode && formData.employee_uid) {
        await updateEmployee(formData);
      } else {
        await addEmployee(formData);
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (employee) => {
    setFormData({
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
    setIsEditMode(true);
    setSelectedEmployee(null);
    setConfirmingDelete(false);
    setIsAddModalOpen(true);
  };

  const handleDisableEmployee = async (uid) => {
    setDeleteError("");
    try {
      await disableEmployee(uid);
      setSelectedEmployee(null);
      setConfirmingDelete(false);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to disable. Try again.",
      );
    }
  };

  const activeEmployees = employees.filter(
    (emp) =>
      emp.is_active &&
      (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.contact_number.includes(searchTerm)),
  );

  const inactiveEmployees = employees.filter(
    (emp) =>
      !emp.is_active &&
      (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.contact_number.includes(searchTerm)),
  );

  return (
    <NexoLayout
      headerTitle="Employees"
      headerSubtitle="Manage team access and contacts"
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            Employees
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Manage team access and contacts.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          Add Employee
        </Button>
      </div>

      {/* Search */}
      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-subtle)",
            }}
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 36px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "var(--text-sm)",
            }}
          />
        </div>
      </Card>

      {/* Employee List Grid */}
      {/* Loading Skeletons */}
      {isLoadingEmployees && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--spacing-lg)",
          }}
        >
          {Array.from({ length: Math.min(employees.length || 6, 6) }).map(
            (_, i) => (
              <Card key={i} padding="lg">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <Skeleton width="48px" height="48px" borderRadius="50%" />
                  <Skeleton width="60px" height="24px" borderRadius="12px" />
                </div>
                <Skeleton
                  width="70%"
                  height="24px"
                  style={{ marginBottom: "8px" }}
                />
                <Skeleton width="50%" height="16px" />
              </Card>
            ),
          )}
        </div>
      )}

      {!isLoadingEmployees && (
        <>
          {/* Active Employees Section */}
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--spacing-md)",
                color: "var(--color-text)",
              }}
            >
              Active Employees
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  color: "var(--color-text-subtle)",
                }}
              >
                ({activeEmployees.length})
              </span>
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "var(--spacing-lg)",
              }}
            >
              {activeEmployees.map((employee, index) => (
                <div
                  key={employee.employee_uid}
                  className={`animate-in delay-${(index % 3) * 100}`}
                >
                  <EmployeeCard
                    employee={employee}
                    isActive={true}
                    onCardClick={() => setSelectedEmployee(employee)}
                  />
                </div>
              ))}
              {activeEmployees.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  No active employees found.
                </div>
              )}
            </div>
          </div>

          {/* Inactive Employees Section */}
          <div>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--spacing-md)",
                color: "var(--color-text)",
              }}
            >
              Inactive Employees
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  color: "var(--color-text-subtle)",
                }}
              >
                ({inactiveEmployees.length})
              </span>
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "var(--spacing-lg)",
              }}
            >
              {inactiveEmployees.map((employee, index) => (
                <div
                  key={employee.employee_uid}
                  className={`animate-in delay-${(index % 3) * 100}`}
                >
                  <EmployeeCard
                    employee={employee}
                    isActive={false}
                    onCardClick={() => setSelectedEmployee(employee)}
                  />
                </div>
              ))}
              {inactiveEmployees.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  No inactive employees.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={isEditMode ? "Edit Employee" : "Add New Employee"}
      >
        <form onSubmit={handleSaveEmployee}>
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
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

      {/* Employee Detail Modal */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => {
          setSelectedEmployee(null);
          setConfirmingDelete(false);
          setDeleteError("");
        }}
        title="Employee Profile"
      >
        {selectedEmployee && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            {/* Header */}
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
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--color-primary), #818cf8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                  {selectedEmployee.name}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--color-text-subtle)",
                    fontSize: "0.9rem",
                  }}
                >
                  <Phone size={14} />
                  {selectedEmployee.contact_number}
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge
                  variant={selectedEmployee.is_active ? "success" : "neutral"}
                >
                  {selectedEmployee.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "var(--spacing-md)",
                fontSize: "0.9rem",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "var(--bg-body)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.8rem",
                    marginBottom: "4px",
                  }}
                >
                  PAN Card
                </p>
                <p style={{ fontWeight: "600" }}>
                  {selectedEmployee.pan_card || "N/A"}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "var(--bg-body)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.8rem",
                    marginBottom: "4px",
                  }}
                >
                  Aadhaar
                </p>
                <p style={{ fontWeight: "600" }}>
                  {selectedEmployee.aadhaar || "N/A"}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "var(--bg-body)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.8rem",
                    marginBottom: "4px",
                  }}
                >
                  UPI ID
                </p>
                <p style={{ fontWeight: "600" }}>
                  {selectedEmployee.upi_id || "N/A"}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "var(--bg-body)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.8rem",
                    marginBottom: "4px",
                  }}
                >
                  Gender
                </p>
                <p style={{ fontWeight: "600" }}>
                  {selectedEmployee.gender || "N/A"}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "var(--bg-body)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.8rem",
                    marginBottom: "4px",
                  }}
                >
                  Joining Date
                </p>
                <p style={{ fontWeight: "600" }}>
                  {selectedEmployee.date_of_joining
                    ? new Date(
                        selectedEmployee.date_of_joining,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--border-subtle)",
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

            {/* Actions */}
            {!confirmingDelete ? (
              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => handleEditClick(selectedEmployee)}
                >
                  Edit Profile
                </Button>
                {selectedEmployee.is_active && (
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
                  Disable {selectedEmployee.name}? They will no longer be able
                  to access the system.
                </p>
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() =>
                      handleDisableEmployee(selectedEmployee.employee_uid)
                    }
                  >
                    Confirm Disable
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </NexoLayout>
  );
};

export default EmployeesPage;

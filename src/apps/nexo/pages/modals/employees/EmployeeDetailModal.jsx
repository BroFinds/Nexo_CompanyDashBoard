import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import { Phone } from "lucide-react";

const InfoTile = ({ label, value }) => (
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
      {label}
    </p>
    <p style={{ fontWeight: "600" }}>{value || "N/A"}</p>
  </div>
);

const EmployeeDetailModal = ({
  employee,
  onClose,
  onEdit,
  onDisable,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!employee) {
      setConfirmingDelete(false);
      setDeleteError("");
    }
  }, [employee]);

  const handleDisable = async () => {
    setDeleteError("");
    try {
      await onDisable(employee.employee_uid);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to disable. Try again.",
      );
    }
  };

  return (
    <Modal isOpen={!!employee} onClose={onClose} title="Employee Profile">
      {employee && (
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
              {employee.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                {employee.name}
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
                {employee.contact_number}
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Badge variant={employee.is_active ? "success" : "neutral"}>
                {employee.is_active ? "Active" : "Inactive"}
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
            <InfoTile label="PAN Card" value={employee.pan_card} />
            <InfoTile label="Aadhaar" value={employee.aadhaar} />
            <InfoTile label="UPI ID" value={employee.upi_id} />
            <InfoTile label="Gender" value={employee.gender} />
            <InfoTile
              label="Joining Date"
              value={
                employee.date_of_joining
                  ? new Date(employee.date_of_joining).toLocaleDateString()
                  : null
              }
            />
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

          {!confirmingDelete ? (
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <Button
                fullWidth
                variant="primary"
                onClick={() => onEdit(employee)}
              >
                Edit Profile
              </Button>
              {employee.is_active && (
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
                Disable {employee.name}? They will no longer be able to access
                the system.
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

export default EmployeeDetailModal;

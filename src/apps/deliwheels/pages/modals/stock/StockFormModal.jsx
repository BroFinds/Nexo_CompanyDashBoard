import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import { Package, Loader2 } from "lucide-react";

const EMPTY_FORM = { product_uid: "", quantity: 1, vehicle_uid: "" };

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

const StockFormModal = ({
  isOpen,
  onClose,
  initialEntry,
  products,
  vehicles,
  onAdd,
  onUpdate,
}) => {
  const isEditMode = !!initialEntry;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(initialEntry ? { ...initialEntry } : EMPTY_FORM);
    setFormError("");
    setSuccessMsg("");
    setIsSubmitting(false);
  }, [isOpen, initialEntry]);

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setFormError("");
    setSuccessMsg("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSave = async () => {
    if (!formData.product_uid) {
      setFormError("Please select a product.");
      return;
    }
    if (!formData.vehicle_uid) {
      setFormError("Please select a vehicle.");
      return;
    }
    if (formData.quantity <= 0) {
      setFormError("Quantity must be at least 1.");
      return;
    }

    const product = products.find(
      (p) => p.product_uid === formData.product_uid,
    );
    const vehicle = vehicles.find(
      (v) => v.vehicle_uid === formData.vehicle_uid,
    );

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await onUpdate(formData);
        setSuccessMsg(`Updated stock entry for "${product?.product_name}".`);
      } else {
        await onAdd(
          formData.product_uid,
          formData.quantity,
          formData.vehicle_uid,
        );
        setSuccessMsg(
          `${formData.quantity} × ${product?.product_name} loaded onto ${(vehicle?.registration || "").toUpperCase()}`,
        );
      }
      setFormError("");
    } catch (e) {
      setFormError(
        e.response?.data?.message || "Failed to save stock. Check console.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Stock Entry" : "Add Stock to Vehicle"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {successMsg ? (
          <>
            <div
              style={{
                padding: "16px",
                borderRadius: "10px",
                background: "#d1fae5",
                color: "#065f46",
                textAlign: "center",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {successMsg}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {!isEditMode && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSuccessMsg("");
                    setFormData((prev) => ({
                      product_uid: "",
                      quantity: 1,
                      vehicle_uid: prev.vehicle_uid,
                    }));
                  }}
                  fullWidth
                >
                  Load Another
                </Button>
              )}
              <Button onClick={handleClose} fullWidth>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>Product *</label>
              <SearchableSelect
                options={products.map((p) => ({
                  value: p.product_uid,
                  label: p.product_name,
                  sub: p.product_code,
                }))}
                value={formData.product_uid}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, product_uid: val }));
                  if (formError) setFormError("");
                }}
                placeholder="Search for a product..."
                noResultsText="No products found"
              />
            </div>
            <div>
              <label style={labelStyle}>Vehicle *</label>
              <select
                value={formData.vehicle_uid}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    vehicle_uid: e.target.value,
                  }));
                  if (formError) setFormError("");
                }}
                style={fieldStyle}
              >
                <option value="">— Select a vehicle —</option>
                {vehicles
                  .filter((v) => v.status === "active")
                  .map((v) => (
                    <option key={v.vehicle_uid} value={v.vehicle_uid}>
                      {v.registration} — {v.model} ({v.driver})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0,
                  }));
                  if (formError) setFormError("");
                }}
                style={fieldStyle}
              />
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
            <Button
              onClick={handleSave}
              fullWidth
              size="lg"
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isSubmitting ? 0.85 : 1,
                cursor: isSubmitting ? "progress" : "pointer",
              }}
            >
              {isSubmitting ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 0.7s linear infinite" }}
                />
              ) : (
                <Package size={16} />
              )}{" "}
              {isSubmitting
                ? "Saving…"
                : isEditMode
                  ? "Save Changes"
                  : "Load to Vehicle"}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default StockFormModal;

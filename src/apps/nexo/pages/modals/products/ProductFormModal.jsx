import React, { useState, useEffect, useMemo, useRef } from "react";
import Modal from "@shared/components/ui/Modal";
import Input from "@shared/components/ui/Input";
import Button from "@shared/components/ui/Button";

const EMPTY_FORM = {
  product_uid: null,
  product_name: "",
  product_code: "",
  measurement_value: "",
  measurement_uid: "",
  product_description: "",
  general_price: "",
  wholesale_price: "",
  is_active: true,
};

const productToForm = (product) => ({
  product_uid: product.product_uid,
  product_name: product.product_name,
  product_code: product.product_code,
  measurement_value: product.measurement_value,
  measurement_uid: product.measurement_uid,
  product_description: product.product_description,
  general_price: product.general_price ?? "",
  wholesale_price: product.wholesale_price ?? "",
  is_active: product.is_active,
});

const ProductFormModal = ({
  isOpen,
  onClose,
  initialProduct,
  measurements,
  onAdd,
  onUpdate,
}) => {
  const isEditMode = !!initialProduct;
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [measurementSearch, setMeasurementSearch] = useState("");
  const [measurementDropdownOpen, setMeasurementDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const measurementBoxRef = useRef(null);
  const highlightedItemRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProduct) {
      setFormData(productToForm(initialProduct));
      const matched = measurements.find(
        (m) => m.measurement_uid === initialProduct.measurement_uid,
      );
      setMeasurementSearch(
        matched?.measurement_text || initialProduct.measurement_text || "",
      );
    } else {
      setFormData(EMPTY_FORM);
      setMeasurementSearch("");
    }
    setMeasurementDropdownOpen(false);
    setSaveError("");
  }, [isOpen, initialProduct, measurements]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        measurementBoxRef.current &&
        !measurementBoxRef.current.contains(e.target)
      ) {
        setMeasurementDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMeasurements = useMemo(() => {
    const q = measurementSearch.trim().toLowerCase();
    if (!q) return measurements;
    return measurements.filter((m) =>
      (m.measurement_text || "").toLowerCase().includes(q),
    );
  }, [measurements, measurementSearch]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [measurementSearch, measurementDropdownOpen]);

  useEffect(() => {
    highlightedItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const selectMeasurement = (m) => {
    setFormData((prev) => ({ ...prev, measurement_uid: m.measurement_uid }));
    setMeasurementSearch(m.measurement_text);
    setMeasurementDropdownOpen(false);
  };

  const handleMeasurementKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!measurementDropdownOpen) {
        setMeasurementDropdownOpen(true);
        return;
      }
      setHighlightedIndex((i) =>
        Math.min(i + 1, Math.max(filteredMeasurements.length - 1, 0)),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (measurementDropdownOpen && filteredMeasurements[highlightedIndex]) {
        e.preventDefault();
        selectMeasurement(filteredMeasurements[highlightedIndex]);
      }
    } else if (e.key === "Tab") {
      if (
        measurementDropdownOpen &&
        !formData.measurement_uid &&
        filteredMeasurements[highlightedIndex]
      ) {
        selectMeasurement(filteredMeasurements[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setMeasurementDropdownOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.measurement_uid) {
      setSaveError("Please select a measurement unit from the list.");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      const payload = {
        ...formData,
        measurement_value: Number(formData.measurement_value),
      };
      if (isEditMode && formData.product_uid) {
        await onUpdate(payload);
      } else {
        await onAdd(payload);
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
      title={isEditMode ? "Edit Product" : "Add New Product"}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="modal-grid-2col"
          style={{ display: "grid", gap: "var(--spacing-md)" }}
        >
          <Input
            id="prodName"
            label="Product Name"
            placeholder="e.g. Wireless Mouse"
            required
            value={formData.product_name}
            onChange={(e) =>
              setFormData({ ...formData, product_name: e.target.value })
            }
          />
          <Input
            id="prodCode"
            label="Product Code"
            placeholder="e.g. WMouse-01"
            required
            value={formData.product_code}
            onChange={(e) =>
              setFormData({ ...formData, product_code: e.target.value })
            }
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
            id="measureVal"
            label="Measurement Value"
            type="number"
            step="0.01"
            required
            value={formData.measurement_value}
            onChange={(e) =>
              setFormData({ ...formData, measurement_value: e.target.value })
            }
          />
          <div
            className="form-group"
            ref={measurementBoxRef}
            style={{ position: "relative" }}
          >
            <label className="form-label" htmlFor="measureUnit">
              Measurement Unit
            </label>
            <input
              id="measureUnit"
              className="form-input"
              type="text"
              placeholder="Search unit (kg, ltr, piece...)"
              autoComplete="off"
              required
              value={measurementSearch}
              onFocus={() => setMeasurementDropdownOpen(true)}
              onKeyDown={handleMeasurementKeyDown}
              role="combobox"
              aria-expanded={measurementDropdownOpen}
              aria-autocomplete="list"
              aria-controls="measurement-listbox"
              aria-activedescendant={
                measurementDropdownOpen &&
                filteredMeasurements[highlightedIndex]
                  ? `measure-opt-${filteredMeasurements[highlightedIndex].measurement_uid}`
                  : undefined
              }
              onChange={(e) => {
                setMeasurementSearch(e.target.value);
                setMeasurementDropdownOpen(true);
                if (formData.measurement_uid) {
                  setFormData((prev) => ({ ...prev, measurement_uid: "" }));
                }
              }}
            />
            {measurementDropdownOpen && filteredMeasurements.length > 0 && (
              <div
                id="measurement-listbox"
                role="listbox"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "4px",
                  background: "var(--color-surface, #fff)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  maxHeight: "220px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {filteredMeasurements.map((m, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  const isSelected =
                    formData.measurement_uid === m.measurement_uid;
                  return (
                    <div
                      key={m.measurement_uid}
                      id={`measure-opt-${m.measurement_uid}`}
                      ref={isHighlighted ? highlightedItemRef : null}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectMeasurement(m);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        background: isHighlighted
                          ? "var(--bg-body)"
                          : isSelected
                            ? "var(--bg-body)"
                            : "transparent",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {m.measurement_text}
                    </div>
                  );
                })}
              </div>
            )}
            {measurementDropdownOpen && filteredMeasurements.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "4px",
                  background: "var(--color-surface, #fff)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 12px",
                  fontSize: "0.85rem",
                  color: "var(--color-text-subtle)",
                  zIndex: 10,
                }}
              >
                No matching units.
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--spacing-md)",
          }}
        >
          <Input
            id="generalPrice"
            label="General Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.general_price}
            onChange={(e) =>
              setFormData({ ...formData, general_price: e.target.value })
            }
          />
          <Input
            id="wholesalePrice"
            label="Wholesale Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.wholesale_price}
            onChange={(e) =>
              setFormData({ ...formData, wholesale_price: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            style={{ height: "80px", paddingTop: "10px", resize: "vertical" }}
            value={formData.product_description || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                product_description: e.target.value,
              })
            }
          />
        </div>

        <div
          className="form-group"
          style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}
        >
          <input
            type="checkbox"
            id="isActive"
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
            htmlFor="isActive"
            style={{ fontSize: "0.9rem", fontWeight: "500" }}
          >
            Is Active Product
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
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;

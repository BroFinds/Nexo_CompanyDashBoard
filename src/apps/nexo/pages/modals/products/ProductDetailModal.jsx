import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import { Package, FileText, Scale } from "lucide-react";

const ProductDetailModal = ({ product, onClose, onEdit, onDisable }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!product) {
      setConfirmingDelete(false);
      setDeleteError("");
    }
  }, [product]);

  const handleDisable = async () => {
    setDeleteError("");
    try {
      await onDisable(product.product_uid);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to disable. Try again.",
      );
    }
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} title="Product Details">
      {product && (
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
                borderRadius: "16px",
                background: "linear-gradient(135deg, #ffedd5, #fdba74)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c2410c",
              }}
            >
              <Package size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                {product.product_name}
              </h3>
              <p
                style={{
                  color: "var(--color-text-subtle)",
                  fontFamily: "monospace",
                }}
              >
                {product.product_code}
              </p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Badge variant={product.is_active ? "success" : "neutral"}>
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border-subtle)",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--spacing-lg)",
            }}
          >
            <div>
              <label className="form-label">Measurement</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <Scale size={18} className="text-slate-400" />
                <span style={{ fontWeight: "500" }}>
                  {product.measurement_value}{" "}
                  {product.measurement_text || product.measurement_uid}
                </span>
              </div>
            </div>
            <div>
              <label className="form-label">General Price</label>
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  marginTop: "4px",
                }}
              >
                ₹{Number(product.general_price).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="form-label">Wholesale Price</label>
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  marginTop: "4px",
                }}
              >
                ₹{Number(product.wholesale_price).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="form-label">Description</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "start",
                  gap: "8px",
                  marginTop: "4px",
                  background: "var(--bg-body)",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <FileText
                  size={18}
                  className="text-slate-400"
                  style={{ marginTop: "2px" }}
                />
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {product.product_description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

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
                onClick={() => onEdit(product)}
              >
                Edit Product
              </Button>
              {product.is_active && (
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
                Disable "{product.product_name}"? It will be moved to the
                Inactive list.
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

export default ProductDetailModal;

import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import Badge from "@shared/components/ui/Badge";
import { Store, Phone, Route, User } from "lucide-react";

const ShopDetailModal = ({ shop, routeLabel, onClose, onEdit, onSetStatus }) => {
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!shop) {
      setConfirming(false);
      setActionError("");
    }
  }, [shop]);

  const handleToggleStatus = async () => {
    setActionError("");
    try {
      await onSetStatus(shop.shop_uid, shop.status === "inactive");
      setConfirming(false);
      onClose();
    } catch (e) {
      setActionError(e.response?.data?.message || "Failed. Try again.");
    }
  };

  const isActive = shop?.status === "active";

  return (
    <Modal isOpen={!!shop} onClose={onClose} title="Shop Details">
      {shop && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--color-primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                }}
              >
                <Store size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", lineHeight: "1.3" }}>
                  {shop.shop_name || shop.shop_owner_name}
                </h3>
                {shop.shop_name && (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", marginTop: "2px" }}>
                    {shop.shop_owner_name}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={isActive ? "success" : "danger"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "16px",
              backgroundColor: "var(--bg-body)",
              borderRadius: "12px",
            }}
          >
            {shop.shop_name && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-primary-subtle)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <User size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginBottom: "2px" }}>Owner Name</p>
                    <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{shop.shop_owner_name}</p>
                  </div>
                </div>
                <div style={{ height: "1px", backgroundColor: "var(--border-subtle)" }} />
              </>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-primary-subtle)",
                  color: "var(--color-primary)",
                }}
              >
                <Phone size={16} />
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginBottom: "2px" }}>Contact Number</p>
                <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{shop.shop_contact_number}</p>
              </div>
            </div>
            <div style={{ height: "1px", backgroundColor: "var(--border-subtle)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-primary-subtle)",
                  color: "var(--color-primary)",
                }}
              >
                <Route size={16} />
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginBottom: "2px" }}>Route</p>
                <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                  {routeLabel || "No route assigned"}
                </p>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />

          {actionError && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px" }}>
              {actionError}
            </p>
          )}

          {!confirming ? (
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <Button fullWidth variant="primary" onClick={() => { onEdit(shop); onClose(); }}>
                Edit Shop
              </Button>
              <Button
                variant={isActive ? "danger" : "secondary"}
                onClick={() => setConfirming(true)}
                style={{ padding: "0 20px" }}
              >
                {isActive ? "Disable" : "Enable"}
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
                padding: "12px",
                background: isActive ? "#fee2e2" : "#d1fae5",
                borderRadius: "8px",
              }}
            >
              <p style={{ fontSize: "0.9rem", color: isActive ? "#dc2626" : "#065f46", fontWeight: "600", margin: 0 }}>
                {isActive
                  ? `Disable "${shop.shop_name || shop.shop_owner_name}"? It will be hidden from driver routes.`
                  : `Re-enable "${shop.shop_name || shop.shop_owner_name}"?`}
              </p>
              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <Button fullWidth variant="secondary" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button fullWidth variant={isActive ? "danger" : "primary"} onClick={handleToggleStatus}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ShopDetailModal;

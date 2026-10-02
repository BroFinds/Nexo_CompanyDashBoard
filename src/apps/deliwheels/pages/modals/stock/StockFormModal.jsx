import React, { useState, useEffect } from "react";
import Modal from "@shared/components/ui/Modal";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import { Package, Plus, Trash2, Loader2 } from "lucide-react";

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

const EMPTY_EDIT_FORM = { product_uid: "", quantity: 1, route_uid: "", vehicle_uid: "" };

const StockFormModal = ({
  isOpen,
  onClose,
  initialEntry,
  products,
  vehicles,
  routes,
  onAdd,
  onUpdate,
  onAssignRoute,
}) => {
  const isEditMode = !!initialEntry;

  // ── Edit mode state ───────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  // ── Add mode state ────────────────────────────────────────────────────────
  const [vehicleUid, setVehicleUid] = useState("");
  const [routeUid, setRouteUid] = useState("");
  // list of { id, product_uid, quantity }
  const [items, setItems] = useState([]);
  // current picker row
  const [pickerProduct, setPickerProduct] = useState("");
  const [pickerQty, setPickerQty] = useState("");

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialEntry) {
      const vehicle = vehicles.find((v) => v.vehicle_uid === initialEntry.vehicle_uid);
      setEditForm({ ...initialEntry, route_uid: vehicle?.route_uid || "" });
    } else {
      setEditForm(EMPTY_EDIT_FORM);
      setVehicleUid("");
      setRouteUid("");
      setItems([]);
      setPickerProduct("");
      setPickerQty(1);
    }
    setFormError("");
    setSuccessMsg("");
    setIsSubmitting(false);
  }, [isOpen, initialEntry]);

  const handleClose = () => {
    setFormError("");
    setSuccessMsg("");
    setIsSubmitting(false);
    onClose();
  };

  const activeRoutes = (routes || []).filter((r) => r.status === "active");
  const activeVehicles = vehicles.filter((v) => v.status === "active");
  const selectedVehicle = vehicles.find((v) => v.vehicle_uid === vehicleUid);
  const vehicleNeedsRoute = !!vehicleUid && !selectedVehicle?.route_uid;

  const handleVehicleChange = (e) => {
    const uid = e.target.value;
    const v = vehicles.find((veh) => veh.vehicle_uid === uid);
    setVehicleUid(uid);
    setRouteUid(v?.route_uid || "");
    if (formError) setFormError("");
  };

  // ── Add a product row to the list ─────────────────────────────────────────
  const handleAddItem = () => {
    if (!pickerProduct) { setFormError("Please select a product to add."); return; }
    const qty = parseInt(pickerQty, 10);
    if (!pickerQty || isNaN(qty) || qty <= 0) { setFormError("Quantity must be at least 1."); return; }
    if (items.some((i) => i.product_uid === pickerProduct)) {
      setFormError("This product is already in the list. Remove it first to change the quantity.");
      return;
    }
    setItems((prev) => [...prev, { id: Date.now(), product_uid: pickerProduct, quantity: qty }]);
    setPickerProduct("");
    setPickerQty("");
    setFormError("");
  };

  const handleRemoveItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (isEditMode) {
      if (!editForm.product_uid) { setFormError("Please select a product."); return; }
      if (!editForm.vehicle_uid) { setFormError("Please select a vehicle."); return; }
      if (editForm.quantity <= 0) { setFormError("Quantity must be at least 1."); return; }
      setIsSubmitting(true);
      try {
        await onUpdate(editForm);
        const product = products.find((p) => p.product_uid === editForm.product_uid);
        setSuccessMsg(`Updated stock entry for "${product?.product_name}".`);
      } catch (e) {
        setFormError(e.response?.data?.message || "Failed to update stock.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Add mode
    if (!vehicleUid) { setFormError("Please select a vehicle."); return; }
    if (vehicleNeedsRoute && !routeUid) {
      setFormError("This vehicle has no route yet. Please select a route to assign.");
      return;
    }
    if (items.length === 0) { setFormError("Add at least one product to the list."); return; }
    const invalidItem = items.find((i) => !i.quantity || isNaN(parseInt(i.quantity, 10)) || parseInt(i.quantity, 10) <= 0);
    if (invalidItem) {
      const p = products.find((pr) => pr.product_uid === invalidItem.product_uid);
      setFormError(`Quantity for "${p?.product_name || "a product"}" must be at least 1.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (vehicleNeedsRoute && routeUid && onAssignRoute) {
        await onAssignRoute(vehicleUid, routeUid);
      }
      for (const item of items) {
        await onAdd(item.product_uid, parseInt(item.quantity, 10), vehicleUid);
      }
      const vehicle = vehicles.find((v) => v.vehicle_uid === vehicleUid);
      setSuccessMsg(
        `${items.length} product${items.length > 1 ? "s" : ""} loaded onto ${(vehicle?.registration || "").toUpperCase()}`
      );
      setFormError("");
    } catch (e) {
      setFormError(e.response?.data?.message || "Failed to save stock. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadAnother = () => {
    setSuccessMsg("");
    setItems([]);
    setPickerProduct("");
    setPickerQty("");
    setFormError("");
  };

  // product options excluding already-added ones (for picker)
  const availableProducts = products.filter(
    (p) => !items.some((i) => i.product_uid === p.product_uid)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Stock Entry" : "Add Stock to Vehicle"}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {successMsg ? (
          <>
            <div style={{ padding: "16px", borderRadius: "10px", background: "#d1fae5", color: "#065f46", textAlign: "center", fontWeight: "600", fontSize: "0.9rem" }}>
              {successMsg}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {!isEditMode && (
                <Button variant="secondary" onClick={handleLoadAnother} fullWidth>
                  Load Another Vehicle
                </Button>
              )}
              <Button onClick={handleClose} fullWidth>Done</Button>
            </div>
          </>
        ) : isEditMode ? (
          // ── Edit mode — single product ──────────────────────────────────
          <>
            <div>
              <label style={labelStyle}>Product *</label>
              <SearchableSelect
                options={products.map((p) => ({ value: p.product_uid, label: p.product_name, sub: p.product_code }))}
                value={editForm.product_uid}
                onChange={(val) => { setEditForm((prev) => ({ ...prev, product_uid: val })); setFormError(""); }}
                placeholder="Search for a product..."
                noResultsText="No products found"
              />
            </div>
            <div>
              <label style={labelStyle}>Quantity *</label>
              <input
                type="number"
                min="1"
                value={editForm.quantity}
                onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                style={fieldStyle}
              />
            </div>
            {formError && <p style={{ color: "#ef4444", fontSize: "0.85rem", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px" }}>{formError}</p>}
            <Button onClick={handleSave} fullWidth size="lg" disabled={isSubmitting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {isSubmitting ? <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> : <Package size={16} />}
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </>
        ) : (
          // ── Add mode — multi-product ────────────────────────────────────
          <>
            {/* Vehicle */}
            <div>
              <label style={labelStyle}>Vehicle *</label>
              <select value={vehicleUid} onChange={handleVehicleChange} style={fieldStyle}>
                <option value="">— Select a vehicle —</option>
                {activeVehicles.map((v) => (
                  <option key={v.vehicle_uid} value={v.vehicle_uid}>
                    {v.registration} — {v.model}{!v.route_uid ? " (no route)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Route assignment if vehicle has none */}
            {vehicleNeedsRoute && (
              <div>
                <label style={labelStyle}>Assign Route *</label>
                <select value={routeUid} onChange={(e) => { setRouteUid(e.target.value); setFormError(""); }} style={fieldStyle}>
                  <option value="">— Select a route —</option>
                  {activeRoutes.map((r) => (
                    <option key={r.route_uid} value={r.route_uid}>{r.origin} → {r.destination}</option>
                  ))}
                </select>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>
                  This vehicle has no route assigned. Select one now — it will be saved to the vehicle.
                </p>
              </div>
            )}

            {/* Added products list */}
            {items.length > 0 && (
              <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "var(--bg-body)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                  Products to Load ({items.length})
                </div>
                {items.map((item) => {
                  const p = products.find((pr) => pr.product_uid === item.product_uid);
                  return (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "600", fontSize: "0.88rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p?.product_name || "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>{p?.product_code}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: e.target.value } : i))}
                          style={{ ...fieldStyle, width: "80px", padding: "6px 8px", textAlign: "center" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: "4px" }}
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Product picker row */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{items.length === 0 ? "Product *" : "Add Another Product"}</label>
                <SearchableSelect
                  options={availableProducts.map((p) => ({ value: p.product_uid, label: p.product_name, sub: p.product_code }))}
                  value={pickerProduct}
                  onChange={(val) => { setPickerProduct(val); if (formError) setFormError(""); }}
                  placeholder="Search for a product..."
                  noResultsText="No products found"
                />
              </div>
              <div style={{ width: "90px", flexShrink: 0 }}>
                <label style={labelStyle}>Qty</label>
                <input
                  type="number"
                  min="1"
                  value={pickerQty}
                  onChange={(e) => setPickerQty(e.target.value)}
                  style={{ ...fieldStyle, textAlign: "center" }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                style={{ flexShrink: 0, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-primary)", background: "var(--color-primary-subtle)", color: "var(--color-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", fontSize: "0.85rem", marginBottom: "0px" }}
              >
                <Plus size={15} /> Add
              </button>
            </div>

            {formError && (
              <p style={{ color: "#ef4444", fontSize: "0.85rem", background: "#fee2e2", padding: "8px 12px", borderRadius: "8px" }}>
                {formError}
              </p>
            )}

            <Button
              onClick={handleSave}
              fullWidth
              size="lg"
              disabled={isSubmitting || items.length === 0}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: (isSubmitting || items.length === 0) ? 0.6 : 1, cursor: (isSubmitting || items.length === 0) ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? (
                <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />
              ) : (
                <Package size={16} />
              )}
              {isSubmitting ? `Loading ${items.length} product${items.length > 1 ? "s" : ""}…` : `Load ${items.length > 0 ? items.length + " Product" + (items.length > 1 ? "s" : "") : "Products"} to Vehicle`}
            </Button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
};

export default StockFormModal;

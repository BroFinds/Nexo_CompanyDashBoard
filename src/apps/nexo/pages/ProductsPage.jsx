import React, { useState, useEffect, useMemo, useRef } from "react";
import NexoLayout from "../components/NexoLayout";
import ProductCard from "../components/ProductCard";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Input from "@shared/components/ui/Input";
import Badge from "@shared/components/ui/Badge";
import Modal from "@shared/components/ui/Modal";
import Skeleton from "@shared/components/ui/Skeleton";
import { Plus, Search, Package, FileText, Scale } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";

const ProductsPage = () => {
  const {
    products,
    isLoadingProducts,
    productsHasMore,
    productsLoaded,
    fetchProducts,
    addProduct,
    updateProduct,
    disableProduct,
    measurements,
    fetchMeasurements,
  } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch first page on load (only if not already loaded — context persists across navigation)
  useEffect(() => {
    if (!productsLoaded) fetchProducts();
    fetchMeasurements();
  }, [productsLoaded, fetchProducts, fetchMeasurements]);

  const sentinelRef = useInfiniteScroll({
    hasMore: productsHasMore,
    isLoading: isLoadingProducts,
    onLoadMore: fetchProducts,
  });

  // Measurement search state
  const [measurementSearch, setMeasurementSearch] = useState("");
  const [measurementDropdownOpen, setMeasurementDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const measurementBoxRef = useRef(null);
  const highlightedItemRef = useRef(null);

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

  // Reset highlight when the filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [measurementSearch, measurementDropdownOpen]);

  // Keep highlighted option scrolled into view
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
      // Auto-pick highlighted match on Tab so the keyboard flow continues naturally
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

  // Form State
  const [formData, setFormData] = useState({
    product_uid: null,
    product_name: "",
    product_code: "",
    measurement_value: "",
    measurement_uid: "",
    product_description: "",
    general_price: "",
    wholesale_price: "",
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      product_uid: null,
      product_name: "",
      product_code: "",
      measurement_value: "",
      measurement_uid: "",
      product_description: "",
      general_price: "",
      wholesale_price: "",
      is_active: true,
    });
    setMeasurementSearch("");
    setMeasurementDropdownOpen(false);
    setSaveError("");
    setIsEditMode(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.measurement_uid) {
      setSaveError("Please select a measurement unit from the list.");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      if (isEditMode && formData.product_uid) {
        await updateProduct({
          ...formData,
          measurement_value: Number(formData.measurement_value),
        });
      } else {
        await addProduct({
          ...formData,
          measurement_value: Number(formData.measurement_value),
        });
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (product) => {
    setFormData({
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
    const matched = measurements.find(
      (m) => m.measurement_uid === product.measurement_uid,
    );
    setMeasurementSearch(
      matched?.measurement_text || product.measurement_text || "",
    );
    setMeasurementDropdownOpen(false);
    setIsEditMode(true);
    setSelectedProduct(null);
    setConfirmingDelete(false);
    setIsAddModalOpen(true);
  };

  const handleDisableProduct = async (uid) => {
    setDeleteError("");
    try {
      await disableProduct(uid);
      setSelectedProduct(null);
      setConfirmingDelete(false);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to disable. Try again.",
      );
    }
  };

  const matchesSearch = (p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_code.toLowerCase().includes(searchTerm.toLowerCase());

  const activeProducts = products.filter(
    (p) => p.is_active && matchesSearch(p),
  );
  const inactiveProducts = products.filter(
    (p) => !p.is_active && matchesSearch(p),
  );

  return (
    <NexoLayout
      headerTitle="Products"
      headerSubtitle="Manage product catalog and specifications"
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
            Products
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Manage product catalog and specifications.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
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
            placeholder="Search by name or code..."
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

      {/* Loading Skeletons (only on initial load) */}
      {isLoadingProducts && products.length === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--spacing-lg)",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="lg">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <Skeleton width="48px" height="48px" borderRadius="12px" />
                <Skeleton width="60px" height="24px" borderRadius="12px" />
              </div>
              <Skeleton
                width="70%"
                height="24px"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton
                width="50%"
                height="16px"
                style={{ marginBottom: "16px" }}
              />
              <Skeleton width="30%" height="16px" />
            </Card>
          ))}
        </div>
      )}

      {!(isLoadingProducts && products.length === 0) && (
        <>
          {[
            {
              title: "Active Products",
              list: activeProducts,
              empty: "No active products found.",
            },
            {
              title: "Inactive Products",
              list: inactiveProducts,
              empty: "No inactive products.",
            },
          ].map((section) => (
            <div
              key={section.title}
              style={{ marginBottom: "var(--spacing-xl)" }}
            >
              <h3
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: "600",
                  marginBottom: "var(--spacing-md)",
                  color: "var(--color-text)",
                }}
              >
                {section.title}
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "var(--text-sm)",
                    fontWeight: "500",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  ({section.list.length})
                </span>
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "var(--spacing-lg)",
                }}
              >
                {section.list.map((product, index) => (
                  <div
                    key={product.product_uid}
                    className={`animate-in delay-${(index % 3) * 100}`}
                  >
                    <ProductCard
                      product={product}
                      isActive={product.is_active}
                      onCardClick={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
                {section.list.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--color-text-subtle)",
                    }}
                  >
                    {section.empty}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Infinite scroll sentinel + loading indicator */}
          <div ref={sentinelRef} style={{ height: "1px" }} />
          {isLoadingProducts && products.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                color: "var(--color-text-subtle)",
                fontSize: "0.85rem",
              }}
            >
              Loading more...
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditMode ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSaveProduct}>
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
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

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setConfirmingDelete(false);
          setDeleteError("");
        }}
        title="Product Details"
      >
        {selectedProduct && (
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
                  {selectedProduct.product_name}
                </h3>
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedProduct.product_code}
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge
                  variant={selectedProduct.is_active ? "success" : "neutral"}
                >
                  {selectedProduct.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--border-subtle)",
              }}
            />

            {/* Stats */}
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
                    {selectedProduct.measurement_value}{" "}
                    {selectedProduct.measurement_text ||
                      selectedProduct.measurement_uid}
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
                  ₹{Number(selectedProduct.general_price).toFixed(2)}
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
                  ₹{Number(selectedProduct.wholesale_price).toFixed(2)}
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
                    {selectedProduct.product_description ||
                      "No description provided."}
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

            {/* Actions */}
            {!confirmingDelete ? (
              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => handleEditClick(selectedProduct)}
                >
                  Edit Product
                </Button>
                {selectedProduct.is_active && (
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
                  Disable "{selectedProduct.product_name}"? It will be moved to
                  the Inactive list.
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
                      handleDisableProduct(selectedProduct.product_uid)
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

export default ProductsPage;

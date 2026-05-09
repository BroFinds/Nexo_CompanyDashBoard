import React, { useEffect, useState, useRef } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import Modal from "@shared/components/ui/Modal";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import { Search, Package, Plus, Truck, Filter, X, Loader2 } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const StockPage = () => {
  const {
    stock,
    vehicles,
    isLoadingStock,
    stockHasMore,
    stockLoaded,
    vehiclesLoaded,
    fetchStock,
    searchStock,
    fetchVehicles,
    addStockLoading,
    updateStock,
  } = useDeliwheels();
  const { products } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    product_uid: "",
    quantity: 1,
    vehicle_uid: "",
  });
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    // Stock is intentionally NOT fetched on mount — the user applies a filter
    // first so we never load the full table by default.
  }, [vehiclesLoaded, fetchVehicles]);

  // Re-query the backend whenever the server-side filters change.
  // A date range is only "complete" when both ends are set — a half-filled
  // range is treated as no date filter, so we don't fire a search until the
  // user picks the matching end (or clears the start).
  const hasCompleteDateRange = !!filterFromDate && !!filterToDate;
  const hasServerFilter =
    filterVehicle !== "all" || !!filterProduct || hasCompleteDateRange;
  useEffect(() => {
    if (!hasServerFilter) return;
    const filters = {};
    if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
    if (filterProduct) filters.productUid = filterProduct;
    if (hasCompleteDateRange) {
      filters.fromDate = filterFromDate;
      filters.toDate = filterToDate;
    }
    searchStock(filters);
  }, [hasServerFilter, hasCompleteDateRange, filterVehicle, filterProduct, filterFromDate, filterToDate, searchStock]);

  const scrollContainerRef = useRef(null);
  const sentinelRef = useInfiniteScroll({
    hasMore: stockHasMore,
    isLoading: isLoadingStock,
    onLoadMore: fetchStock,
    root: scrollContainerRef,
  });

  // Free-text search runs client-side over the loaded page; vehicle/product/date
  // are already applied server-side via searchStock above.
  const filteredStock = stock.filter((s) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (s.product_name || "").toLowerCase().includes(term);
  });

  const hasActiveFilter =
    searchTerm ||
    filterVehicle !== "all" ||
    filterProduct ||
    filterFromDate ||
    filterToDate;
  const showResults = hasServerFilter;
  const visibleStock = showResults ? filteredStock : [];
  const totalLoaded = visibleStock.reduce((sum, s) => sum + s.quantity, 0);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVehicle("all");
    setFilterProduct("");
    setFilterFromDate("");
    setFilterToDate("");
  };

  const handleSaveStock = async () => {
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
        await updateStock(formData);
        setSuccessMsg(`Updated stock entry for "${product?.product_name}".`);
        setIsEditMode(false);
      } else {
        await addStockLoading(
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

  const handleEditClick = (entry) => {
    setFormData(entry);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ product_uid: "", quantity: 1, vehicle_uid: "" });
    setFormError("");
    setSuccessMsg("");
    setIsEditMode(false);
    setIsSubmitting(false);
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

  return (
    <DeliwheelsLayout
      headerTitle="Stock"
      headerSubtitle="Load products to vehicles"
    >
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
            Stock
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Load Nexo products onto delivery vehicles.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddModal(true);
            setIsEditMode(false);
            setFormData({ product_uid: "", quantity: 1, vehicle_uid: "" });
          }}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Add Stock
        </Button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--spacing-lg)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <Card padding="lg" className="animate-in">
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-subtle)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "8px",
            }}
          >
            Matching Entries
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: "800",
              letterSpacing: "-0.02em",
            }}
          >
            {showResults ? visibleStock.length : "—"}
          </p>
        </Card>
        <Card padding="lg" className="animate-in delay-100">
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-subtle)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "8px",
            }}
          >
            Total Loaded
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              color: "var(--color-primary)",
            }}
          >
            {showResults ? `${totalLoaded} units` : "—"}
          </p>
        </Card>
      </div>

      {/* Search & Filter (always visible) */}
      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} style={{ color: "var(--color-text-subtle)" }} />
          <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
            Search & Filter
          </span>
          {hasActiveFilter && (
            <Badge variant="primary" style={{ fontSize: "0.7rem" }}>
              Active
            </Badge>
          )}
        </div>

        <div
          style={{
            marginTop: "var(--spacing-md)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--spacing-md)",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
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
              placeholder="Search product name..."
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

          <SearchableSelect
            options={[
              { value: "", label: "All Products" },
              ...products.map((p) => ({
                value: p.product_uid,
                label: p.product_name,
                sub: p.product_code,
              })),
            ]}
            value={filterProduct}
            onChange={setFilterProduct}
            placeholder="All Products"
            noResultsText="No products found"
          />

          <SearchableSelect
            options={[
              { value: "all", label: "All Vehicles" },
              ...vehicles.map((v) => ({
                value: v.vehicle_uid,
                label: v.registration,
                sub: `${v.model}${v.driver ? ` (${v.driver})` : ""}`,
              })),
            ]}
            value={filterVehicle}
            onChange={setFilterVehicle}
            placeholder="All Vehicles"
            noResultsText="No vehicles found"
          />

          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            placeholder="From date"
            title="From date"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "var(--text-sm)",
              fontWeight: filterFromDate ? "600" : "400",
              color: filterFromDate ? "var(--color-primary)" : "inherit",
            }}
          />

          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            placeholder="To date"
            title="To date"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "var(--text-sm)",
              fontWeight: filterToDate ? "600" : "400",
              color: filterToDate ? "var(--color-primary)" : "inherit",
            }}
          />

          {hasActiveFilter && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <X size={14} /> Clear filters
            </Button>
          )}
        </div>
      </Card>

      {/* Stock Table */}
      <Card padding="none">
        {!showResults ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--bg-body)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Filter size={24} style={{ color: "var(--color-text-subtle)" }} />
            </div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                letterSpacing: "-0.01em",
              }}
            >
              Pick a filter to load stock
            </h3>
            <p
              style={{
                color: "var(--color-text-subtle)",
                fontSize: "0.9rem",
                maxWidth: "420px",
              }}
            >
              Choose a <strong>product</strong>, <strong>vehicle</strong>, or{" "}
              <strong>date</strong> above to load matching stock entries.
              Nothing is loaded by default.
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "calc(100vh - 340px)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-body)",
                  }}
                >
                  {["Product", "Qty", "Vehicle", "Loaded Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          backgroundColor: "var(--bg-body)",
                          padding: "14px 16px",
                          textAlign: "left",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          color: "var(--color-text-subtle)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          boxShadow: "0 1px 0 var(--border-subtle)",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {!stockLoaded &&
                  isLoadingStock &&
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <Skeleton
                            width={j === 1 ? "130px" : "70px"}
                            height="16px"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}

                {stockLoaded &&
                  visibleStock.map((entry) => (
                    <tr
                      key={entry.stock_uid}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-body)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Package
                            size={16}
                            style={{
                              color: "var(--color-primary)",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontWeight: "600" }}>
                            {entry.product_name}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontWeight: "700",
                          fontFamily: "monospace",
                        }}
                      >
                        {entry.quantity}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Truck
                            size={14}
                            style={{ color: "var(--color-text-subtle)" }}
                          />
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.85rem",
                            }}
                          >
                            {entry.vehicle_number}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        {entry.loaded_date}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            onClick={() => handleEditClick(entry)}
                            style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {stockLoaded &&
                  !isLoadingStock &&
                  visibleStock.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        No stock entries match the current filters.
                      </td>
                    </tr>
                  )}

                <tr>
                  <td colSpan={5} style={{ padding: 0, border: "none" }}>
                    <div ref={sentinelRef} style={{ height: "1px" }} />
                    {isLoadingStock && stock.length > 0 && (
                      <InfiniteScrollLoader style={{ padding: "12px" }} />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Stock Modal — Pick product, qty, vehicle */}
      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
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
                <Button onClick={closeAddModal} fullWidth>
                  Done
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  Product *
                </label>
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
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  Vehicle *
                </label>
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
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  Quantity *
                </label>
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
                onClick={handleSaveStock}
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
    </DeliwheelsLayout>
  );
};

export default StockPage;

import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import StockStats from "../components/StockStats";
import StockFilterBar from "../components/StockFilterBar";
import StockTable from "../components/StockTable";
import StockFormModal from "./modals/stock/StockFormModal";
import Button from "@shared/components/ui/Button";
import { Plus } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";

const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

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
  const [filterFromDate, setFilterFromDate] = useState(todayISO);
  const [filterToDate, setFilterToDate] = useState(todayISO);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    // Stock is intentionally NOT fetched on mount — the user applies a filter
    // first so we never load the full table by default.
  }, [vehiclesLoaded, fetchVehicles]);

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
  }, [
    hasServerFilter,
    hasCompleteDateRange,
    filterVehicle,
    filterProduct,
    filterFromDate,
    filterToDate,
    searchStock,
  ]);

  const filteredStock = stock.filter((s) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (s.product_name || "").toLowerCase().includes(term);
  });

  const hasActiveFilter =
    !!searchTerm ||
    filterVehicle !== "all" ||
    !!filterProduct ||
    !!filterFromDate ||
    !!filterToDate;
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

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
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
          onClick={handleOpenAdd}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Add Stock
        </Button>
      </div>

      <StockStats
        showResults={showResults}
        entryCount={visibleStock.length}
        totalLoaded={totalLoaded}
      />

      <StockFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterProduct={filterProduct}
        setFilterProduct={setFilterProduct}
        filterVehicle={filterVehicle}
        setFilterVehicle={setFilterVehicle}
        filterFromDate={filterFromDate}
        setFilterFromDate={setFilterFromDate}
        filterToDate={filterToDate}
        setFilterToDate={setFilterToDate}
        products={products}
        vehicles={vehicles}
        hasActiveFilter={hasActiveFilter}
        onClear={clearFilters}
      />

      <StockTable
        showResults={showResults}
        stock={stock}
        visibleStock={visibleStock}
        stockLoaded={stockLoaded}
        isLoadingStock={isLoadingStock}
        stockHasMore={stockHasMore}
        onLoadMore={fetchStock}
        onEditEntry={handleEditClick}
      />

      <StockFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialEntry={editingEntry}
        products={products}
        vehicles={vehicles}
        onAdd={addStockLoading}
        onUpdate={updateStock}
      />
    </DeliwheelsLayout>
  );
};

export default StockPage;

import React, { useCallback, useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import StockStats from "../components/StockStats";
import StockFilterBar from "../components/StockFilterBar";
import StockTable from "../components/StockTable";
import StockFormModal from "./modals/stock/StockFormModal";
import StockDetailsModal from "./modals/stock/StockDetailsModal";
import Button from "@shared/components/ui/Button";
import { Plus } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";

const StockPage = () => {
  const {
    stock,
    vehicles,
    routes,
    isLoadingStock,
    stockHasMore,
    stockLoaded,
    vehiclesLoaded,
    routesLoaded,
    fetchStock,
    searchStock,
    fetchVehicles,
    fetchRoutes,
    addStockLoading,
    updateStock,
    assignRoute,
    fetchStockLogs,
  } = useDeliwheels();
  const { products } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Logs modal state
  const [logsEntry, setLogsEntry] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    if (!routesLoaded) fetchRoutes();
    if (!stockLoaded) searchStock({});
  }, [vehiclesLoaded, routesLoaded, fetchVehicles, fetchRoutes, stockLoaded, searchStock]);

  const hasCompleteDateRange = !!filterFromDate && !!filterToDate;
  const hasServerFilter =
    filterVehicle !== "all" || !!filterProduct || hasCompleteDateRange;

  useEffect(() => {
    if (!stockLoaded) return;
    const filters = {};
    if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
    if (filterProduct) filters.productUid = filterProduct;
    if (hasCompleteDateRange) {
      filters.fromDate = filterFromDate;
      filters.toDate = filterToDate;
    }
    searchStock(filters);
  }, [
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
  const showResults = stockLoaded;
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

  const handleViewLogs = useCallback(
    async (entry) => {
      setLogsEntry(entry);
      setLogs([]);
      setLogsError(null);
      setIsLoadingLogs(true);
      try {
        const data = await fetchStockLogs(entry.stock_uid);
        setLogs(data || []);
      } catch (e) {
        setLogsError("Failed to load delivery logs. Please try again.");
      } finally {
        setIsLoadingLogs(false);
      }
    },
    [fetchStockLogs],
  );

  const handleCloseLogs = () => {
    setLogsEntry(null);
    setLogs([]);
    setLogsError(null);
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
        onViewLogs={handleViewLogs}
      />

      <StockFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialEntry={editingEntry}
        products={products}
        vehicles={vehicles}
        routes={routes}
        onAdd={addStockLoading}
        onUpdate={updateStock}
        onAssignRoute={assignRoute}
      />

      <StockDetailsModal
        entry={logsEntry}
        logs={logs}
        loading={isLoadingLogs}
        error={logsError}
        onClose={handleCloseLogs}
      />
    </DeliwheelsLayout>
  );
};

export default StockPage;

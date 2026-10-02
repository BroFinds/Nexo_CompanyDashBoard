import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import api from "@/services/api";

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
    deleteStockEntry,
  } = useDeliwheels();
  const { products } = useGlobal();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterFromDate, setFilterFromDate] = useState(todayISO);
  const [filterToDate, setFilterToDate] = useState(todayISO);
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
    filterVehicle !== "all" || hasCompleteDateRange;

  useEffect(() => {
    if (!stockLoaded) return;
    const filters = {};
    if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
    if (hasCompleteDateRange) {
      filters.fromDate = filterFromDate;
      filters.toDate = filterToDate;
    }
    searchStock(filters);
  }, [
    hasCompleteDateRange,
    filterVehicle,
    filterFromDate,
    filterToDate,
    searchStock,
  ]);

  const filteredStock = stock.filter((s) => {
    if (filterStatus === "in_progress") return !s.is_delivery_complete;
    if (filterStatus === "done") return !!s.is_delivery_complete;
    return true;
  });

  // Group individual stock entries by vehicle + date → one row per delivery day
  const groupedDeliveries = useMemo(() => {
    const groups = new Map();
    filteredStock.forEach((s) => {
      const key = `${s.vehicle_uid}__${s.loaded_date}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          vehicle_uid: s.vehicle_uid,
          vehicle_number: s.vehicle_number,
          loaded_date: s.loaded_date,
          is_delivery_complete: true,
          entries: [],
          totalQty: 0,
          deliveredQty: 0,
          remainingQty: 0,
        });
      }
      const g = groups.get(key);
      g.entries.push(s);
      const qty = s.quantity || 0;
      const rem = s.remaining_quantity ?? qty;
      g.totalQty += qty;
      g.remainingQty += rem;
      g.deliveredQty += Math.max(0, qty - rem);
      if (!s.is_delivery_complete) g.is_delivery_complete = false;
    });
    return Array.from(groups.values())
      .sort((a, b) => b.loaded_date.localeCompare(a.loaded_date));
  }, [filteredStock]);

  const hasActiveFilter =
    filterStatus !== "all" ||
    filterVehicle !== "all" ||
    !!filterFromDate ||
    !!filterToDate;
  const showResults = stockLoaded;
  const visibleStock = showResults ? filteredStock : [];

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterVehicle("all");
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
    async (delivery) => {
      setLogsEntry(delivery);
      setLogs([]);
      setLogsError(null);
      setIsLoadingLogs(true);
      try {
        const allLogsArrays = await Promise.all(
          delivery.entries.map((entry) =>
            fetchStockLogs(entry.stock_uid)
              .then((data) =>
                (data || []).map((log) => ({ ...log, product_name: entry.product_name }))
              )
              .catch(() => [])
          )
        );
        const combined = allLogsArrays
          .flat()
          .sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0));
        setLogs(combined);
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

  const handleDeleteDelivery = async (delivery) => {
    for (const entry of delivery.entries) {
      await deleteStockEntry(entry.stock_uid);
    }
    handleCloseLogs();
    const filters = {};
    if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
    if (filterFromDate && filterToDate) { filters.fromDate = filterFromDate; filters.toDate = filterToDate; }
    await searchStock(filters);
  };

  const handleCompleteDelivery = async (vehicleUid) => {
    try {
      await api.put(`/api/v1/deliwheels/stock-added/vehicle/${vehicleUid}/complete-delivery`);
      // Refresh stock so grouped rows update their status
      const filters = {};
      if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
      if (filterFromDate && filterToDate) {
        filters.fromDate = filterFromDate;
        filters.toDate = filterToDate;
      }
      await searchStock(filters);
      handleCloseLogs();
    } catch (e) {
      alert("Failed to complete delivery: " + (e?.response?.data?.message ?? e?.message ?? "Unknown error"));
    }
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
        entryCount={groupedDeliveries.length}
        inProgressCount={groupedDeliveries.filter((d) => !d.is_delivery_complete).length}
        doneCount={groupedDeliveries.filter((d) => d.is_delivery_complete).length}
      />

      <StockFilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterVehicle={filterVehicle}
        setFilterVehicle={setFilterVehicle}
        filterFromDate={filterFromDate}
        setFilterFromDate={setFilterFromDate}
        filterToDate={filterToDate}
        setFilterToDate={setFilterToDate}
        vehicles={vehicles}
        hasActiveFilter={hasActiveFilter}
        onClear={clearFilters}
      />

      <StockTable
        showResults={showResults}
        deliveries={groupedDeliveries}
        stockLoaded={stockLoaded}
        isLoadingStock={isLoadingStock}
        stockHasMore={stockHasMore}
        onLoadMore={fetchStock}
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
        delivery={logsEntry}
        logs={logs}
        loading={isLoadingLogs}
        error={logsError}
        onClose={handleCloseLogs}
        products={products}
        onCompleteDelivery={handleCompleteDelivery}
        onDeleteDelivery={handleDeleteDelivery}
      />
    </DeliwheelsLayout>
  );
};

export default StockPage;

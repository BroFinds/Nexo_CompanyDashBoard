import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import SalesStats from "../components/SalesStats";
import SalesFilterBar from "../components/SalesFilterBar";
import SalesTable from "../components/SalesTable";
import SaleDetailModal from "./modals/sales/SaleDetailModal";
import { useDeliwheels } from "../context/DeliwheelsContext";

const SalesPage = () => {
  const {
    sales,
    vehicles,
    isLoadingSales,
    salesHasMore,
    salesLoaded,
    vehiclesLoaded,
    fetchVehicles,
    fetchSales,
    searchSales,
    getSale,
  } = useDeliwheels();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const [detailSale, setDetailSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    // Sales is intentionally NOT fetched on mount — user applies a filter
    // first so we never load the full table by default.
  }, [vehiclesLoaded, fetchVehicles]);

  const hasCompleteDateRange = !!filterFromDate && !!filterToDate;
  const hasServerFilter = filterVehicle !== "all" || hasCompleteDateRange;

  useEffect(() => {
    if (!hasServerFilter) return;
    const handle = setTimeout(() => {
      const filters = {};
      if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
      if (hasCompleteDateRange) {
        filters.fromDate = filterFromDate;
        filters.toDate = filterToDate;
      }
      searchSales(filters);
    }, 250);
    return () => clearTimeout(handle);
  }, [
    hasServerFilter,
    hasCompleteDateRange,
    filterVehicle,
    filterFromDate,
    filterToDate,
    searchSales,
  ]);

  const openDetails = async (saleUid) => {
    setDetailSale({ sale_uid: saleUid });
    setDetailLoading(true);
    setDetailError("");
    try {
      const full = await getSale(saleUid);
      setDetailSale(full);
    } catch (e) {
      console.error("getSale:", e);
      setDetailError("Could not load sale details. Try again.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailSale(null);
    setDetailError("");
    setDetailLoading(false);
  };

  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (s.invoice_no || "").toLowerCase().includes(term) ||
      (s.shop_owner_name || "").toLowerCase().includes(term)
    );
  });

  const hasActiveFilter =
    !!searchTerm ||
    filterVehicle !== "all" ||
    !!filterFromDate ||
    !!filterToDate;
  const showResults = hasServerFilter;
  const visibleSales = showResults ? filteredSales : [];

  const isPaid = (s) => (s.payment_status_text || "").toUpperCase() === "PAID";
  const paidRevenue = visibleSales.reduce(
    (sum, s) => (isPaid(s) ? sum + Number(s.grand_total || 0) : sum),
    0,
  );
  const pendingRevenue = visibleSales.reduce(
    (sum, s) => (!isPaid(s) ? sum + Number(s.grand_total || 0) : sum),
    0,
  );
  const totalRevenue = paidRevenue + pendingRevenue;
  const totalOrders = visibleSales.length;
  const paidCount = visibleSales.filter(isPaid).length;
  const pendingCount = totalOrders - paidCount;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVehicle("all");
    setFilterFromDate("");
    setFilterToDate("");
  };

  return (
    <DeliwheelsLayout
      headerTitle="Sales"
      headerSubtitle="Track invoices and revenue"
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
            Sales
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Track invoices, payments, and revenue.
          </p>
        </div>
      </div>

      <SalesStats
        showResults={showResults}
        totalRevenue={totalRevenue}
        paidRevenue={paidRevenue}
        pendingRevenue={pendingRevenue}
        totalOrders={totalOrders}
        paidCount={paidCount}
        pendingCount={pendingCount}
        hasMore={salesHasMore}
      />

      <SalesFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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

      <SalesTable
        showResults={showResults}
        sales={sales}
        visibleSales={visibleSales}
        salesLoaded={salesLoaded}
        isLoadingSales={isLoadingSales}
        salesHasMore={salesHasMore}
        onLoadMore={fetchSales}
        onViewSale={openDetails}
      />

      <SaleDetailModal
        sale={detailSale}
        loading={detailLoading}
        error={detailError}
        onClose={closeDetails}
      />
    </DeliwheelsLayout>
  );
};

export default SalesPage;

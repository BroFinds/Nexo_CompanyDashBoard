import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import SalesStats from "../components/SalesStats";
import SalesFilterBar from "../components/SalesFilterBar";
import SalesTable from "../components/SalesTable";
import SaleDetailModal from "./modals/sales/SaleDetailModal";
import { useDeliwheels } from "../context/DeliwheelsContext";

const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

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
  const [filterFromDate, setFilterFromDate] = useState(todayISO);
  const [filterToDate, setFilterToDate] = useState(todayISO);

  const [detailSale, setDetailSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    if (!salesLoaded) searchSales({ fromDate: filterFromDate, toDate: filterToDate });
  }, [vehiclesLoaded, fetchVehicles, salesLoaded, searchSales]);

  const hasCompleteDateRange = !!filterFromDate && !!filterToDate;
  const hasServerFilter = filterVehicle !== "all" || hasCompleteDateRange;

  useEffect(() => {
    if (!salesLoaded) return;
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
  const showResults = salesLoaded;
  const visibleSales = showResults ? filteredSales : [];

  // Money from each sale's split: cash + UPI is taken in at the shop, credit stays owed by the shop. A sale
  // without split amounts counts whole under its payment mode.
  const hasSplit = (s) => Number(s.cash_amount || 0) + Number(s.upi_amount || 0) + Number(s.credit_amount || 0) > 0;
  const creditOf = (s) => hasSplit(s)
    ? Number(s.credit_amount || 0)
    : ((s.payment_mode_text || "").toUpperCase().includes("CREDIT") ? Number(s.grand_total || 0) : 0);
  const pendingRevenue = visibleSales.reduce((sum, s) => sum + creditOf(s), 0);
  const totalRevenue = visibleSales.reduce((sum, s) => sum + Number(s.grand_total || 0), 0);
  const paidRevenue = totalRevenue - pendingRevenue;
  const totalOrders = visibleSales.length;
  const pendingCount = visibleSales.filter((s) => creditOf(s) > 0).length;
  const paidCount = totalOrders - pendingCount;

  const isCredit = (s) => (s.payment_mode_text || '').toUpperCase().includes('CREDIT');
  const creditRevenue = visibleSales.reduce(
    (sum, s) => (isCredit(s) ? sum + Number(s.grand_total || 0) : sum),
    0,
  );
  const creditCount = visibleSales.filter(isCredit).length;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVehicle("all");
    setFilterFromDate("");
    setFilterToDate("");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const filters = {};
      if (filterVehicle !== "all") filters.vehicleUid = filterVehicle;
      if (filterFromDate) filters.fromDate = filterFromDate;
      if (filterToDate) filters.toDate = filterToDate;
      await searchSales(filters);
    } finally {
      setIsRefreshing(false);
    }
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
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoadingSales}
          title="Refresh sales"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            fontSize: "var(--text-sm)",
            fontWeight: "500",
            cursor: isRefreshing || isLoadingSales ? "not-allowed" : "pointer",
            opacity: isRefreshing || isLoadingSales ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          <span
            style={{
              display: "inline-block",
              animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
            }}
          >
            ↻
          </span>
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <SalesStats
        showResults={showResults}
        totalRevenue={totalRevenue}
        paidRevenue={paidRevenue}
        pendingRevenue={pendingRevenue}
        creditRevenue={creditRevenue}
        totalOrders={totalOrders}
        paidCount={paidCount}
        pendingCount={pendingCount}
        creditCount={creditCount}
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

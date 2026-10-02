import React, { useEffect, useMemo, useRef, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { RotateCcw, Package, Truck, Search } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import SearchableSelect from "@shared/components/ui/SearchableSelect";

const HEADERS = ["Product", "Qty Returned", "Vehicle", "Date", "Reason"];

const headerStyle = {
  position: "sticky", top: 0, zIndex: 10,
  backgroundColor: "var(--bg-body)", padding: "14px 16px",
  textAlign: "left", fontWeight: "600", fontSize: "0.8rem",
  color: "var(--color-text-subtle)", textTransform: "uppercase",
  letterSpacing: "0.04em", boxShadow: "0 1px 0 var(--border-subtle)",
};

const ReturnsPage = () => {
  const {
    fetchAllReturns,
    vehicles, vehiclesLoaded, fetchVehicles,
  } = useDeliwheels();
  const { products } = useGlobal();

  const [returnedStock, setReturnedStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const hasCompleteDateRange = !!filterFromDate && !!filterToDate;
  const prevFiltersRef = useRef(null);
  const fetchInitiatedRef = useRef(false);

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
  }, [vehiclesLoaded, fetchVehicles]);

  useEffect(() => {
    const filters = {};
    if (hasCompleteDateRange) {
      filters.fromDate = filterFromDate;
      filters.toDate = filterToDate;
    }

    const key = JSON.stringify(filters);
    if (fetchInitiatedRef.current && prevFiltersRef.current === key) return;
    fetchInitiatedRef.current = true;
    prevFiltersRef.current = key;

    let cancelled = false;
    setIsLoading(true);
    fetchAllReturns(filters)
      .then((data) => { if (!cancelled) setReturnedStock(data || []); })
      .catch((e) => { if (!cancelled) console.error("fetchAllReturns:", e); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; fetchInitiatedRef.current = false; };
  }, [fetchAllReturns, filterFromDate, filterToDate, hasCompleteDateRange]);

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.product_uid || p.productUid, p));
    return map;
  }, [products]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => map.set(v.vehicle_uid || v.vehicleUid, v));
    return map;
  }, [vehicles]);

  const filtered = useMemo(() => {
    let rows = returnedStock;

    if (filterVehicle !== "all") {
      rows = rows.filter((r) => r.vehicle_uid === filterVehicle);
    }

    const t = searchTerm.toLowerCase().trim();
    if (!t) return rows;
    return rows.filter((r) => {
      const p = productMap.get(r.product_uid);
      const v = vehicleMap.get(r.vehicle_uid);
      const name = (r.product_name || p?.product_name || p?.productName || "").toLowerCase();
      const code = (p?.product_code || p?.productCode || "").toLowerCase();
      const reg = (v?.registration || v?.vehicle_number || r.vehicle_number || "").toLowerCase();
      return name.includes(t) || code.includes(t) || reg.includes(t);
    });
  }, [returnedStock, searchTerm, filterVehicle, productMap, vehicleMap]);

  const totalUnits = returnedStock.reduce((s, r) => s + r.returned_qty, 0);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVehicle("all");
    setFilterFromDate("");
    setFilterToDate("");
  };
  const hasActiveFilter = !!searchTerm || filterVehicle !== "all" || !!filterFromDate || !!filterToDate;

  return (
    <DeliwheelsLayout headerTitle="Returns" headerSubtitle="Returned stock from shops">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-xl)" }}>
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>Returns</h2>
          <p style={{ color: "var(--color-text-subtle)" }}>Products returned by shops to the driver.</p>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
          <Card padding="lg">
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Total Returns</p>
            <p style={{ fontSize: "1.6rem", fontWeight: "800" }}>{returnedStock.length}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>entries</p>
          </Card>
          <Card padding="lg">
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Units Returned</p>
            <p style={{ fontSize: "1.6rem", fontWeight: "800", color: "#dc2626" }}>{totalUnits}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>total qty</p>
          </Card>
        </div>
      )}

      {/* Filter bar */}
      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "160px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-subtle)" }} />
            <input
              type="text"
              placeholder="Search by product name, code or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 8px 8px 30px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.875rem", outline: "none" }}
            />
          </div>
          {/* Vehicle filter */}
          <SearchableSelect
            placeholder="All Vehicles"
            value={filterVehicle}
            onChange={setFilterVehicle}
            options={[
              { value: "all", label: "All Vehicles" },
              ...vehicles.filter((v) => v.status === "active").map((v) => ({ value: v.vehicle_uid, label: v.registration || v.vehicle_uid })),
            ]}
            style={{ minWidth: "160px" }}
          />
          {/* Date range */}
          <input type="date" value={filterFromDate} onChange={(e) => setFilterFromDate(e.target.value)}
            style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.875rem" }} />
          <input type="date" value={filterToDate} onChange={(e) => setFilterToDate(e.target.value)}
            style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.875rem" }} />
          {hasActiveFilter && (
            <Button variant="ghost" onClick={clearFilters} style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 380px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {HEADERS.map((h) => <th key={h} style={headerStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {/* Loading skeletons */}
              {isLoading && [1,2,3,4,5].map((i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {[130, 70, 90, 80, 80].map((w, j) => (
                    <td key={j} style={{ padding: "14px 16px" }}><Skeleton width={`${w}px`} height="16px" /></td>
                  ))}
                </tr>
              ))}

              {/* Rows */}
              {!isLoading && filtered.map((entry) => {
                const product = productMap.get(entry.product_uid);
                const productName = entry.product_name || product?.productName || product?.product_name || entry.product_uid;
                const vehicle = vehicleMap.get(entry.vehicle_uid);
                const vehicleReg = entry.vehicle_number || vehicle?.registration || vehicle?.vehicle_number || "—";
                return (
                  <tr
                    key={entry.returned_stock_uid}
                    style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-body)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Package size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
                        <span style={{ fontWeight: "600" }}>{productName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "700", fontSize: "1rem", color: "#dc2626" }}>
                        {entry.returned_qty}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Truck size={14} style={{ color: "var(--color-text-subtle)" }} />
                        <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {vehicleReg}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--color-text-subtle)" }}>
                      {entry.stock_added_date || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
                        Returned
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Empty */}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "var(--color-text-subtle)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <RotateCcw size={28} style={{ opacity: 0.3 }} />
                      <p style={{ fontWeight: "600" }}>No returns found</p>
                      <p style={{ fontSize: "0.85rem" }}>
                        {hasActiveFilter ? "Try adjusting your filters." : "No products have been returned yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </Card>
    </DeliwheelsLayout>
  );
};

export default ReturnsPage;

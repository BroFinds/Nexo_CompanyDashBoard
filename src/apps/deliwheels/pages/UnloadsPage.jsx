import React, { useEffect, useMemo, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { PackageMinus, Package, Truck, Search } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import DateRangeBar from "../components/DateRangeBar";
import { fetchCompanyUnloads, fetchReasons } from "../context/dayCloseApi";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const HEADERS = ["Product", "Qty Unloaded", "Vehicle", "Date", "Reason", "Note"];

const headerStyle = {
  position: "sticky", top: 0, zIndex: 10,
  backgroundColor: "var(--bg-body)", padding: "14px 16px",
  textAlign: "left", fontWeight: "600", fontSize: "0.8rem",
  color: "var(--color-text-subtle)", textTransform: "uppercase",
  letterSpacing: "0.04em", boxShadow: "0 1px 0 var(--border-subtle)",
};

const cell = { padding: "14px 16px" };

const qty = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 3 });

// Stock the drivers took off their vehicles (to the warehouse or as waste). Read only: drivers make unloads
// in the app, and changes go through Fix → Approvals.
const UnloadsPage = () => {
  const { vehicles, vehiclesLoaded, fetchVehicles } = useDeliwheels();
  const { products } = useGlobal();

  const [unloads, setUnloads] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState(todayISO);
  const [filterToDate, setFilterToDate] = useState(todayISO);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
  }, [vehiclesLoaded, fetchVehicles]);

  useEffect(() => {
    fetchReasons().then(setReasons).catch((e) => console.error("fetchReasons:", e));
  }, []);

  // A half-picked custom range waits until both ends are set
  const hasCompleteDateRange = !!filterFromDate === !!filterToDate;

  useEffect(() => {
    if (!hasCompleteDateRange) return undefined;
    let cancelled = false;
    setIsLoading(true);
    setLoadError("");
    fetchCompanyUnloads({
      vehicleUid: filterVehicle !== "all" ? filterVehicle : undefined,
      fromDate: filterFromDate || undefined,
      toDate: filterToDate || undefined,
    })
      .then((data) => { if (!cancelled) setUnloads(data); })
      .catch((e) => {
        if (cancelled) return;
        console.error("fetchCompanyUnloads:", e);
        setUnloads([]);
        setLoadError(e.response?.data?.message || "Could not load unloads.");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [filterVehicle, filterFromDate, filterToDate, hasCompleteDateRange]);

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

  const reasonMap = useMemo(() => new Map(reasons.map((r) => [r.uid, r.name])), [reasons]);

  const productName = (uid) => {
    const p = productMap.get(uid);
    return p?.product_name || p?.productName || uid;
  };
  const vehicleReg = (uid) => {
    const v = vehicleMap.get(uid);
    return v?.registration || v?.vehicle_number || "—";
  };

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase().trim();
    if (!t) return unloads;
    return unloads.filter((u) => {
      const p = productMap.get(u.productUid);
      const v = vehicleMap.get(u.vehicleUid);
      const name = (p?.product_name || p?.productName || "").toLowerCase();
      const code = (p?.product_code || p?.productCode || "").toLowerCase();
      const reg = (v?.registration || v?.vehicle_number || "").toLowerCase();
      const reason = (reasonMap.get(u.reasonUid) || "").toLowerCase();
      return name.includes(t) || code.includes(t) || reg.includes(t) || reason.includes(t);
    });
  }, [unloads, searchTerm, productMap, vehicleMap, reasonMap]);

  const totalUnits = unloads.reduce((s, u) => s + Number(u.quantity || 0), 0);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVehicle("all");
    setFilterFromDate(todayISO());
    setFilterToDate(todayISO());
  };
  const hasActiveFilter =
    !!searchTerm || filterVehicle !== "all" || filterFromDate !== todayISO() || filterToDate !== todayISO();

  return (
    <DeliwheelsLayout headerTitle="Unloads" headerSubtitle="Stock taken off vehicles">
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>Unloads</h2>
        <p style={{ color: "var(--color-text-subtle)" }}>
          Stock drivers took off their vehicles, with the reason. Drivers record these in the app.
        </p>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-xl)" }}>
          <Card padding="lg">
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Total Unloads</p>
            <p style={{ fontSize: "1.6rem", fontWeight: "800" }}>{unloads.length}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>entries</p>
          </Card>
          <Card padding="lg">
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Units Unloaded</p>
            <p style={{ fontSize: "1.6rem", fontWeight: "800", color: "#d97706" }}>{qty(totalUnits)}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "4px" }}>total qty</p>
          </Card>
        </div>
      )}

      {/* Filter bar */}
      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "160px" }}>
              <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-subtle)" }} />
              <input
                type="text"
                placeholder="Search by product, code, vehicle or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "8px 8px 8px 30px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.875rem", outline: "none" }}
              />
            </div>
            <SearchableSelect
              placeholder="All Vehicles"
              value={filterVehicle}
              onChange={setFilterVehicle}
              options={[
                { value: "all", label: "All Vehicles" },
                ...vehicles.map((v) => ({ value: v.vehicle_uid, label: v.registration || v.vehicle_uid })),
              ]}
              style={{ minWidth: "160px" }}
            />
            {hasActiveFilter && (
              <Button variant="ghost" onClick={clearFilters} style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                Clear
              </Button>
            )}
          </div>
          <DateRangeBar
            fromDate={filterFromDate}
            setFromDate={setFilterFromDate}
            toDate={filterToDate}
            setToDate={setFilterToDate}
          />
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
              {isLoading && [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {[130, 70, 90, 80, 80, 120].map((w, j) => (
                    <td key={j} style={cell}><Skeleton width={`${w}px`} height="16px" /></td>
                  ))}
                </tr>
              ))}

              {!isLoading && filtered.map((u) => (
                <tr
                  key={u.unloadedStockUid}
                  style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-body)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={cell}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Package size={15} style={{ color: "#d97706", flexShrink: 0 }} />
                      <span style={{ fontWeight: "600" }}>{productName(u.productUid)}</span>
                    </div>
                  </td>
                  <td style={cell}>
                    <span style={{ fontFamily: "monospace", fontWeight: "700", fontSize: "1rem", color: "#d97706" }}>
                      {qty(u.quantity)}
                    </span>
                  </td>
                  <td style={cell}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Truck size={14} style={{ color: "var(--color-text-subtle)" }} />
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{vehicleReg(u.vehicleUid)}</span>
                    </div>
                  </td>
                  <td style={{ ...cell, color: "var(--color-text-subtle)" }}>{u.businessDate || "—"}</td>
                  <td style={cell}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600", background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
                      {reasonMap.get(u.reasonUid) || "—"}
                    </span>
                  </td>
                  <td style={{ ...cell, color: "var(--color-text-subtle)", maxWidth: "260px" }}>{u.reasonNote || "—"}</td>
                </tr>
              ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={HEADERS.length} style={{ textAlign: "center", padding: "48px", color: "var(--color-text-subtle)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <PackageMinus size={28} style={{ opacity: 0.3 }} />
                      <p style={{ fontWeight: "600" }}>{loadError || "No unloads found"}</p>
                      {!loadError && (
                        <p style={{ fontSize: "0.85rem" }}>
                          {hasActiveFilter ? "Try adjusting your filters." : "No stock was unloaded today."}
                        </p>
                      )}
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

export default UnloadsPage;

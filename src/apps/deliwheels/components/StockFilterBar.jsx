import React from "react";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import { X } from "lucide-react";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const thisMonthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const DATE_PRESETS = [
  { label: "Today", getRange: () => ({ from: todayISO(), to: todayISO() }) },
  { label: "This Month", getRange: () => ({ from: thisMonthStart(), to: todayISO() }) },
  { label: "All Time", getRange: () => ({ from: "", to: "" }) },
];

const StockFilterBar = ({
  filterStatus,
  setFilterStatus,
  filterVehicle,
  setFilterVehicle,
  filterFromDate,
  setFilterFromDate,
  filterToDate,
  setFilterToDate,
  vehicles,
  hasActiveFilter,
  onClear,
}) => {
  const isPresetActive = (preset) => {
    const { from, to } = preset.getRange();
    return filterFromDate === from && filterToDate === to;
  };

  return (
    <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Row 1: status tabs + vehicle + clear */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Status tabs */}
          <div style={{ display: "inline-flex", gap: "4px", padding: "4px", backgroundColor: "var(--bg-body)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                style={{
                  padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  border: "none", borderRadius: "7px",
                  background: filterStatus === tab.value ? "var(--color-surface, white)" : "transparent",
                  color: filterStatus === tab.value ? "var(--color-text)" : "var(--color-text-subtle)",
                  boxShadow: filterStatus === tab.value ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Vehicle filter */}
          <div style={{ flex: "1", minWidth: "180px" }}>
            <SearchableSelect
              options={[
                { value: "all", label: "All Vehicles" },
                ...vehicles.map((v) => ({
                  value: v.vehicle_uid,
                  label: v.registration,
                  sub: `${v.model || ""}${v.driver ? ` · ${v.driver}` : ""}`,
                })),
              ]}
              value={filterVehicle}
              onChange={setFilterVehicle}
              placeholder="All Vehicles"
              noResultsText="No vehicles found"
            />
          </div>

          {hasActiveFilter && (
            <Button
              variant="secondary"
              onClick={onClear}
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
            >
              <X size={14} /> Clear
            </Button>
          )}
        </div>

        {/* Row 2: date presets + date range inputs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Quick date presets */}
          <div style={{ display: "inline-flex", gap: "4px", padding: "3px", backgroundColor: "var(--bg-body)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const { from, to } = preset.getRange();
                  setFilterFromDate(from);
                  setFilterToDate(to);
                }}
                style={{
                  padding: "5px 12px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  border: "none", borderRadius: "6px",
                  background: isPresetActive(preset) ? "var(--color-primary, #6366f1)" : "transparent",
                  color: isPresetActive(preset) ? "#fff" : "var(--color-text-subtle)",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", padding: "0 2px" }}>or</span>

          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            title="From date"
            style={{
              padding: "8px 12px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)", outline: "none",
              fontSize: "var(--text-sm)",
              fontWeight: filterFromDate ? "600" : "400",
              color: filterFromDate ? "var(--color-primary)" : "inherit",
            }}
          />
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>to</span>
          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            title="To date"
            style={{
              padding: "8px 12px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)", outline: "none",
              fontSize: "var(--text-sm)",
              fontWeight: filterToDate ? "600" : "400",
              color: filterToDate ? "var(--color-primary)" : "inherit",
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default StockFilterBar;

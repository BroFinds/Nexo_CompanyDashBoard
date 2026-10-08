import React from "react";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import DateRangeBar from "./DateRangeBar";
import { X } from "lucide-react";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
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
}) => (
  <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Row 1: status tabs + vehicle + clear */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* Status tabs */}
        <div
          style={{
            display: "inline-flex", gap: "4px", padding: "4px",
            backgroundColor: "var(--bg-body)", borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
          }}
        >
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
                transition: "all 0.15s ease", whiteSpace: "nowrap",
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

      {/* Row 2: date presets (Today, This Month, This Year, All Time) + custom inputs */}
      <DateRangeBar
        fromDate={filterFromDate}
        setFromDate={setFilterFromDate}
        toDate={filterToDate}
        setToDate={setFilterToDate}
      />
    </div>
  </Card>
);

export default StockFilterBar;

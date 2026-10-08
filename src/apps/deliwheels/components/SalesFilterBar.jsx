import React from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import DateRangeBar from "./DateRangeBar";
import { Search, Filter, X } from "lucide-react";

const SalesFilterBar = ({
  searchTerm,
  setSearchTerm,
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
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Filter size={16} style={{ color: "var(--color-text-subtle)" }} />
      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>Search & Filter</span>
      {hasActiveFilter && (
        <Badge variant="primary" style={{ fontSize: "0.7rem" }}>Active</Badge>
      )}
    </div>

    {/* Row 1: search + vehicle + clear */}
    <div
      style={{
        marginTop: "var(--spacing-md)",
        display: "flex",
        gap: "var(--spacing-md)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
        <Search
          size={16}
          style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "var(--color-text-subtle)",
          }}
        />
        <input
          type="text"
          placeholder="Search invoice or shop owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: "10px 10px 10px 36px",
            borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)",
            outline: "none", fontSize: "var(--text-sm)",
          }}
        />
      </div>

      <div style={{ minWidth: "180px" }}>
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
      </div>

      {hasActiveFilter && (
        <Button
          variant="secondary"
          onClick={onClear}
          style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
        >
          <X size={14} /> Clear filters
        </Button>
      )}
    </div>

    {/* Row 2: date range presets + custom inputs */}
    <div style={{ marginTop: "10px" }}>
      <DateRangeBar
        fromDate={filterFromDate}
        setFromDate={setFilterFromDate}
        toDate={filterToDate}
        setToDate={setFilterToDate}
      />
    </div>
  </Card>
);

export default SalesFilterBar;

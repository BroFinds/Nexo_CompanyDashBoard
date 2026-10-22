import React from "react";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
import DateRangeBar from "./DateRangeBar";
import { X } from "lucide-react";

const StockFilterBar = ({
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
      {/* Row 1: vehicle + clear */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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

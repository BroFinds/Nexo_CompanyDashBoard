import React from "react";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import SearchableSelect from "@shared/components/ui/SearchableSelect";
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
      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
        Search & Filter
      </span>
      {hasActiveFilter && (
        <Badge variant="primary" style={{ fontSize: "0.7rem" }}>
          Active
        </Badge>
      )}
    </div>

    <div
      style={{
        marginTop: "var(--spacing-md)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "var(--spacing-md)",
      }}
    >
      <div style={{ position: "relative" }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-subtle)",
          }}
        />
        <input
          type="text"
          placeholder="Search invoice or shop owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 10px 10px 36px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
            outline: "none",
            fontSize: "var(--text-sm)",
          }}
        />
      </div>

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

      <input
        type="date"
        value={filterFromDate}
        onChange={(e) => setFilterFromDate(e.target.value)}
        placeholder="From date"
        title="From date"
        style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          outline: "none",
          fontSize: "var(--text-sm)",
          fontWeight: filterFromDate ? "600" : "400",
          color: filterFromDate ? "var(--color-primary)" : "inherit",
        }}
      />

      <input
        type="date"
        value={filterToDate}
        onChange={(e) => setFilterToDate(e.target.value)}
        placeholder="To date"
        title="To date"
        style={{
          padding: "10px 12px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          outline: "none",
          fontSize: "var(--text-sm)",
          fontWeight: filterToDate ? "600" : "400",
          color: filterToDate ? "var(--color-primary)" : "inherit",
        }}
      />

      {hasActiveFilter && (
        <Button
          variant="secondary"
          onClick={onClear}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <X size={14} /> Clear filters
        </Button>
      )}
    </div>
  </Card>
);

export default SalesFilterBar;

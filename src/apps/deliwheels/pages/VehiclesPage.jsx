import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import VehicleSection from "../components/VehicleSection";
import VehicleFormModal from "./modals/vehicles/VehicleFormModal";
import VehicleDetailModal from "./modals/vehicles/VehicleDetailModal";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Search, Plus } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const VehiclesPage = () => {
  const {
    vehicles,
    routes,
    isLoadingVehicles,
    vehiclesHasMore,
    vehiclesLoaded,
    routesLoaded,
    fetchVehicles,
    fetchRoutes,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicleStatus,
  } = useDeliwheels();
  const { employees, employeesLoaded, fetchEmployees } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    if (!routesLoaded) fetchRoutes();
    if (!employeesLoaded) fetchEmployees();
  }, [
    vehiclesLoaded,
    routesLoaded,
    employeesLoaded,
    fetchVehicles,
    fetchRoutes,
    fetchEmployees,
  ]);

  const sentinelRef = useInfiniteScroll({
    hasMore: vehiclesHasMore,
    isLoading: isLoadingVehicles,
    onLoadMore: fetchVehicles,
  });

  const formatRoute = (r) => (r ? `${r.origin} → ${r.destination}` : "");

  const getRouteLabel = (v) => {
    if (v.route_origin || v.route_destination) {
      return formatRoute({
        origin: v.route_origin,
        destination: v.route_destination,
      });
    }
    if (!v.route_uid) return "Unassigned";
    const r = routes.find((r) => r.route_uid === v.route_uid);
    return r ? formatRoute(r) : "Unassigned";
  };

  const getDriverName = (v) => {
    if (v.employee_uid) {
      const emp = (employees || []).find(
        (e) => e.employee_uid === v.employee_uid,
      );
      if (emp?.name) return emp.name;
    }
    if (v.driver && v.driver !== "Unassigned" && v.driver !== "")
      return v.driver;
    return "Unassigned";
  };

  const term = searchTerm.toLowerCase();
  const matchesSearch = (v) =>
    (v.registration || "").toLowerCase().includes(term) ||
    (v.model || "").toLowerCase().includes(term) ||
    (getDriverName(v) || "").toLowerCase().includes(term);
  const activeVehicles = vehicles.filter(
    (v) => v.status === "active" && matchesSearch(v),
  );
  const inactiveVehicles = vehicles.filter(
    (v) => v.status !== "active" && matchesSearch(v),
  );

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleDisable = async (uid) => {
    await deleteVehicle(uid);
    setSelectedVehicle(null);
  };

  return (
    <DeliwheelsLayout
      headerTitle="Vehicles"
      headerSubtitle="Manage your delivery fleet"
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
            Vehicles
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Manage fleet and delivery vehicles.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Add Vehicle
        </Button>
      </div>

      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
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
            placeholder="Search by registration, model, or driver..."
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
      </Card>

      {isLoadingVehicles && vehicles.length === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "var(--spacing-lg)",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton
                width="80%"
                height="20px"
                style={{ marginBottom: "12px" }}
              />
              <Skeleton
                width="100%"
                height="40px"
                style={{ marginBottom: "12px" }}
              />
              <Skeleton width="50%" height="16px" />
            </Card>
          ))}
        </div>
      )}

      {!(isLoadingVehicles && vehicles.length === 0) && (
        <>
          <VehicleSection
            title="Active Vehicles"
            vehicles={activeVehicles}
            emptyMessage="No active vehicles found."
            onCardClick={setSelectedVehicle}
            getDriverName={getDriverName}
            getRouteLabel={getRouteLabel}
            style={{ marginBottom: "var(--spacing-xl)" }}
          />

          <VehicleSection
            title="Inactive Vehicles"
            vehicles={inactiveVehicles}
            emptyMessage="No inactive vehicles."
            onCardClick={setSelectedVehicle}
            getDriverName={getDriverName}
            getRouteLabel={getRouteLabel}
          />

          <div ref={sentinelRef} style={{ height: "1px" }} />
          {isLoadingVehicles && vehicles.length > 0 && <InfiniteScrollLoader />}
        </>
      )}

      <VehicleDetailModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onEdit={handleEditClick}
        onDisable={handleDisable}
        getDriverName={getDriverName}
        getRouteLabel={getRouteLabel}
      />

      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialVehicle={editingVehicle}
        employees={employees}
        routes={routes}
        onAdd={addVehicle}
        onUpdate={updateVehicle}
        onSetStatus={setVehicleStatus}
      />
    </DeliwheelsLayout>
  );
};

export default VehiclesPage;

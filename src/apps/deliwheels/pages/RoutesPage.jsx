import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import RouteSection from "../components/RouteSection";
import RouteFormModal from "./modals/routes/RouteFormModal";
import RouteDetailModal from "./modals/routes/RouteDetailModal";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Search, Plus } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const RoutesPage = () => {
  const {
    routes,
    isLoadingRoutes,
    routesHasMore,
    routesLoaded,
    fetchRoutes,
    addRoute,
    updateRoute,
    deleteRoute,
    setRouteStatus,
  } = useDeliwheels();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  useEffect(() => {
    if (!routesLoaded) fetchRoutes();
  }, [routesLoaded, fetchRoutes]);

  const sentinelRef = useInfiniteScroll({
    hasMore: routesHasMore,
    isLoading: isLoadingRoutes,
    onLoadMore: fetchRoutes,
  });

  const matchesSearch = (r) =>
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase());

  const activeRoutes = routes.filter(
    (r) => r.status !== "inactive" && matchesSearch(r),
  );
  const inactiveRoutes = routes.filter(
    (r) => r.status === "inactive" && matchesSearch(r),
  );

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (route) => {
    setEditingRoute(route);
    setSelectedRoute(null);
    setIsFormOpen(true);
  };

  const handleDisable = async (uid) => {
    await deleteRoute(uid);
    setSelectedRoute(null);
  };

  return (
    <DeliwheelsLayout
      headerTitle="Routes"
      headerSubtitle="Manage delivery routes and schedules"
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
            Routes
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Manage delivery routes and schedules.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Add Route
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
            placeholder="Search by route name, origin, or destination..."
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

      {isLoadingRoutes && routes.length === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
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
                height="60px"
                style={{ marginBottom: "12px" }}
              />
              <Skeleton width="50%" height="16px" />
            </Card>
          ))}
        </div>
      )}

      {!(isLoadingRoutes && routes.length === 0) && (
        <>
          <RouteSection
            title="Active Routes"
            routes={activeRoutes}
            emptyMessage="No active routes found."
            onCardClick={setSelectedRoute}
            style={{ marginBottom: "var(--spacing-xl)" }}
          />
          <RouteSection
            title="Inactive Routes"
            routes={inactiveRoutes}
            emptyMessage="No inactive routes."
            onCardClick={setSelectedRoute}
            style={{ marginBottom: "var(--spacing-xl)" }}
          />

          <div ref={sentinelRef} style={{ height: "1px" }} />
          {isLoadingRoutes && routes.length > 0 && <InfiniteScrollLoader />}
        </>
      )}

      <RouteDetailModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onEdit={handleEditClick}
        onDisable={handleDisable}
      />

      <RouteFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialRoute={editingRoute}
        onAdd={addRoute}
        onUpdate={updateRoute}
        onSetStatus={setRouteStatus}
      />
    </DeliwheelsLayout>
  );
};

export default RoutesPage;

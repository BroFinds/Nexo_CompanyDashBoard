import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import Card from "@shared/components/ui/Card";
import Badge from "@shared/components/ui/Badge";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import Modal from "@shared/components/ui/Modal";
import { Search, MapPin, Clock, Navigation, Plus } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const EMPTY_ROUTE = {
  name: "",
  origin: "",
  destination: "",
  status: "active",
  is_active: true,
};

const RoutesPage = () => {
  const {
    routes,
    vehicles,
    isLoadingRoutes,
    routesHasMore,
    routesLoaded,
    fetchRoutes,
    fetchVehicles,
    addRoute,
    updateRoute,
    deleteRoute,
    setRouteStatus,
  } = useDeliwheels();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_ROUTE });
  const [formError, setFormError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const getStatusVariant = (s) =>
    s === "active" ? "success" : s === "paused" ? "warning" : "danger";

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stops" ? parseInt(value) || 0 : value,
    }));
    if (formError) setFormError("");
  };

  const handleSaveRoute = async () => {
    if (!formData.origin || !formData.destination) {
      setFormError("Origin and destination are required.");
      return;
    }
    const routeName =
      formData.name || `${formData.origin} → ${formData.destination}`;

    try {
      if (isEditMode) {
        await updateRoute({ ...formData, name: routeName });
        const wasActive = formData.status !== "inactive";
        if (formData.is_active !== wasActive) {
          await setRouteStatus(formData.route_uid, !!formData.is_active);
        }
      } else {
        await addRoute({ ...formData, name: routeName });
      }
      setShowAddModal(false);
      setFormData({ ...EMPTY_ROUTE });
      setFormError("");
      setIsEditMode(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to save route. Try again.",
      );
    }
  };

  const handleEditClick = (route) => {
    setFormData({ ...route, is_active: route.status !== "inactive" });
    setIsEditMode(true);
    setSelectedRoute(null);
    setConfirmingDelete(false);
    setShowAddModal(true);
  };

  const handleDeleteRoute = async (uid) => {
    setDeleteError("");
    try {
      await deleteRoute(uid);
      setSelectedRoute(null);
      setConfirmingDelete(false);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete. Try again.",
      );
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-subtle)",
    outline: "none",
    fontSize: "0.9rem",
    fontFamily: "inherit",
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
          onClick={() => {
            setShowAddModal(true);
            setIsEditMode(false);
            setFormData({ ...EMPTY_ROUTE });
          }}
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

      {!(isLoadingRoutes && routes.length === 0) &&
        [
          {
            title: "Active Routes",
            list: activeRoutes,
            empty: "No active routes found.",
          },
          {
            title: "Inactive Routes",
            list: inactiveRoutes,
            empty: "No inactive routes.",
          },
        ].map((section) => (
          <div
            key={section.title}
            style={{ marginBottom: "var(--spacing-xl)" }}
          >
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--spacing-md)",
                color: "var(--color-text)",
              }}
            >
              {section.title}
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  color: "var(--color-text-subtle)",
                }}
              >
                ({section.list.length})
              </span>
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "var(--spacing-lg)",
              }}
            >
              {section.list.map((route, index) => (
                <div
                  key={route.route_uid}
                  className={`animate-in delay-${(index % 3) * 100}`}
                >
                  <Card
                    hoverable
                    padding="lg"
                    onClick={() => setSelectedRoute(route)}
                    style={{
                      cursor: "pointer",
                      height: "100%",
                      opacity: route.status === "inactive" ? 0.7 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: "700",
                          flex: 1,
                          marginRight: "8px",
                        }}
                      >
                        {route.origin} → {route.destination}
                      </h3>
                      <Badge variant={getStatusVariant(route.status)}>
                        {route.status.charAt(0).toUpperCase() +
                          route.status.slice(1)}
                      </Badge>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "14px",
                        backgroundColor: "var(--bg-body)",
                        borderRadius: "10px",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-primary)",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "2px",
                            height: "24px",
                            backgroundColor: "var(--border-subtle)",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            border: "2px solid var(--color-primary)",
                            backgroundColor: "white",
                          }}
                        ></div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            marginBottom: "16px",
                          }}
                        >
                          {route.origin}
                        </p>
                        <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                          {route.destination}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
              {section.list.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {section.empty}
                </div>
              )}
            </div>
          </div>
        ))}

      {/* Infinite scroll sentinel + loading indicator */}
      {!(isLoadingRoutes && routes.length === 0) && (
        <>
          <div ref={sentinelRef} style={{ height: "1px" }} />
          {isLoadingRoutes && routes.length > 0 && (
            <InfiniteScrollLoader />
          )}
        </>
      )}

      {/* Route Detail Modal */}
      <Modal
        isOpen={!!selectedRoute}
        onClose={() => {
          setSelectedRoute(null);
          setConfirmingDelete(false);
          setDeleteError("");
        }}
        title="Route Details"
      >
        {selectedRoute && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                {selectedRoute.origin} → {selectedRoute.destination}
              </h3>
              <Badge variant={getStatusVariant(selectedRoute.status)}>
                {selectedRoute.status.charAt(0).toUpperCase() +
                  selectedRoute.status.slice(1)}
              </Badge>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-body)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-primary-subtle)",
                    color: "var(--color-primary)",
                  }}
                >
                  <MapPin size={18} />
                </div>
                <span style={{ fontWeight: "600" }}>
                  {selectedRoute.origin}
                </span>
              </div>
              <div
                style={{
                  marginLeft: "18px",
                  borderLeft: "2px dashed var(--border-subtle)",
                  height: "32px",
                }}
              ></div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                  }}
                >
                  <MapPin size={18} />
                </div>
                <span style={{ fontWeight: "600" }}>
                  {selectedRoute.destination}
                </span>
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--border-subtle)",
                margin: "var(--spacing-md) 0",
              }}
            />
            {deleteError && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  background: "#fee2e2",
                  padding: "8px 12px",
                  borderRadius: "8px",
                }}
              >
                {deleteError}
              </p>
            )}
            {!confirmingDelete ? (
              <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => handleEditClick(selectedRoute)}
                >
                  Edit Route
                </Button>
                {selectedRoute.status !== "inactive" && (
                  <Button
                    variant="danger"
                    onClick={() => setConfirmingDelete(true)}
                    style={{ padding: "0 20px" }}
                  >
                    Disable
                  </Button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-sm)",
                  padding: "12px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#dc2626",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  Disable "{selectedRoute.origin} to {selectedRoute.destination}
                  "? It will be moved to the Inactive list.
                </p>
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() => handleDeleteRoute(selectedRoute.route_uid)}
                  >
                    Confirm Disable
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Route Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormError("");
          setIsEditMode(false);
          setFormData({ ...EMPTY_ROUTE });
        }}
        title={isEditMode ? "Edit Route" : "Add New Route"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Origin *
              </label>
              <input
                name="origin"
                value={formData.origin}
                onChange={handleFormChange}
                placeholder="Starting point"
                style={fieldStyle}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Destination *
              </label>
              <input
                name="destination"
                value={formData.destination}
                onChange={handleFormChange}
                placeholder="End point"
                style={fieldStyle}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              id="routeIsActive"
              checked={!!formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              style={{
                width: "20px",
                height: "20px",
                accentColor: "var(--color-primary)",
              }}
            />
            <label
              htmlFor="routeIsActive"
              style={{ fontSize: "0.9rem", fontWeight: "500" }}
            >
              Is Active Route
            </label>
          </div>
          {formError && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.85rem",
                background: "#fee2e2",
                padding: "8px 12px",
                borderRadius: "8px",
              }}
            >
              {formError}
            </p>
          )}
          <Button onClick={handleSaveRoute} fullWidth size="lg">
            {isEditMode ? "Save Changes" : "Add Route"}
          </Button>
        </div>
      </Modal>
    </DeliwheelsLayout>
  );
};

export default RoutesPage;

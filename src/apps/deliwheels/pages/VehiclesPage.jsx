import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import VehicleCard from "../components/VehicleCard";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import Modal from "@shared/components/ui/Modal";
import { Search, Truck, Plus, Eye, EyeOff } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";
import { useGlobal } from "../../nexo/context/GlobalContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const EMPTY_VEHICLE = {
  registration: "",
  model: "",
  status: "active",
  is_active: true,
  driver: "Unassigned",
  employee_uid: "",
  route_uid: "",
  username: "",
  password: "",
};

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_VEHICLE });
  const [formError, setFormError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "employee_uid") {
      const emp = (employees || []).find((em) => em.employee_uid === value);
      setFormData((prev) => ({
        ...prev,
        employee_uid: value,
        driver: emp?.name || "Unassigned",
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formError) setFormError("");
  };

  const handleSaveVehicle = async () => {
    if (!formData.registration || !formData.model) {
      setFormError("Registration and model are required.");
      return;
    }
    if (!isEditMode && (!formData.username || !formData.password)) {
      setFormError("Vehicle username and password are required.");
      return;
    }
    if (formData.username && formData.username.length < 6) {
      setFormError("Username must be at least 6 characters.");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    try {
      let saved;
      if (isEditMode) {
        saved = await updateVehicle(formData);
      } else {
        saved = await addVehicle(formData);
      }
      const desiredActive = !!formData.is_active;
      const currentlyActive = (saved?.status || "active") === "active";
      if (desiredActive !== currentlyActive && saved?.vehicle_uid) {
        await setVehicleStatus(saved.vehicle_uid, desiredActive);
      }
      setShowAddModal(false);
      setFormData({ ...EMPTY_VEHICLE });
      setFormError("");
      setIsEditMode(false);
      setShowPassword(false);
    } catch (e) {
      setFormError(
        e.response?.data?.message || "Failed to save vehicle. Check console.",
      );
    }
  };

  const handleEditClick = (vehicle) => {
    setFormData({ ...vehicle, is_active: vehicle.status === "active" });
    setIsEditMode(true);
    setSelectedVehicle(null);
    setConfirmingDelete(false);
    setShowAddModal(true);
  };

  const handleDeleteVehicle = async (uid) => {
    setDeleteError("");
    try {
      await deleteVehicle(uid);
      setSelectedVehicle(null);
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
          onClick={() => {
            setShowAddModal(true);
            setIsEditMode(false);
            setFormData({ ...EMPTY_VEHICLE });
            setShowPassword(false);
          }}
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
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--spacing-md)",
                color: "var(--color-text)",
              }}
            >
              Active Vehicles
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  color: "var(--color-text-subtle)",
                }}
              >
                ({activeVehicles.length})
              </span>
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--spacing-lg)",
              }}
            >
              {activeVehicles.map((v, i) => (
                <div
                  key={v.vehicle_uid}
                  className={`animate-in delay-${(i % 3) * 100}`}
                >
                  <VehicleCard
                    vehicle={v}
                    driverName={getDriverName(v)}
                    routeLabel={getRouteLabel(v)}
                    onClick={() => setSelectedVehicle(v)}
                  />
                </div>
              ))}
              {activeVehicles.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  No active vehicles found.
                </div>
              )}
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "600",
                marginBottom: "var(--spacing-md)",
                color: "var(--color-text)",
              }}
            >
              Inactive Vehicles
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  color: "var(--color-text-subtle)",
                }}
              >
                ({inactiveVehicles.length})
              </span>
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--spacing-lg)",
              }}
            >
              {inactiveVehicles.map((v, i) => (
                <div
                  key={v.vehicle_uid}
                  className={`animate-in delay-${(i % 3) * 100}`}
                >
                  <VehicleCard
                    vehicle={v}
                    driverName={getDriverName(v)}
                    routeLabel={getRouteLabel(v)}
                    onClick={() => setSelectedVehicle(v)}
                  />
                </div>
              ))}
              {inactiveVehicles.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  No inactive vehicles.
                </div>
              )}
            </div>
          </div>

          {/* Infinite scroll sentinel + loading indicator */}
          <div ref={sentinelRef} style={{ height: "1px" }} />
          {isLoadingVehicles && vehicles.length > 0 && <InfiniteScrollLoader />}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedVehicle}
        onClose={() => {
          setSelectedVehicle(null);
          setConfirmingDelete(false);
          setDeleteError("");
        }}
        title="Vehicle Details"
      >
        {selectedVehicle && (
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
                alignItems: "center",
                gap: "var(--spacing-md)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "var(--color-primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                }}
              >
                <Truck size={32} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                  }}
                >
                  {selectedVehicle.registration || "—"}
                </h3>
                <p style={{ color: "var(--color-text-subtle)" }}>
                  {selectedVehicle.model || "Unnamed"}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "var(--spacing-md)",
              }}
            >
              {[
                { l: "Status", v: selectedVehicle.status },
                { l: "Driver", v: getDriverName(selectedVehicle) },
                {
                  l: "Assigned Route",
                  v: getRouteLabel(selectedVehicle),
                  span: true,
                },
              ].map((i) => (
                <div
                  key={i.l}
                  style={{
                    padding: "12px",
                    background: "var(--bg-body)",
                    borderRadius: "8px",
                    gridColumn: i.span ? "1 / -1" : "auto",
                  }}
                >
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: "0.8rem",
                      marginBottom: "4px",
                    }}
                  >
                    {i.l}
                  </p>
                  <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{i.v}</p>
                </div>
              ))}
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
                  onClick={() => handleEditClick(selectedVehicle)}
                >
                  Edit Vehicle
                </Button>
                {selectedVehicle.status !== "inactive" && (
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
                  Disable {selectedVehicle.registration}? It will be marked
                  inactive.
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
                    onClick={() =>
                      handleDeleteVehicle(selectedVehicle.vehicle_uid)
                    }
                  >
                    Confirm Disable
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormError("");
          setIsEditMode(false);
          setFormData({ ...EMPTY_VEHICLE });
          setShowPassword(false);
        }}
        title={isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
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
                Registration *
              </label>
              <input
                name="registration"
                value={formData.registration}
                onChange={handleFormChange}
                placeholder="e.g. KA-01-XX-1234"
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
                Model *
              </label>
              <input
                name="model"
                value={formData.model}
                onChange={handleFormChange}
                placeholder="e.g. Tata Ace"
                style={fieldStyle}
              />
            </div>
          </div>
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
                Vehicle Username {!isEditMode && "*"}
              </label>
              <input
                name="username"
                value={formData.username || ""}
                onChange={handleFormChange}
                placeholder="e.g. vehicle_ka01"
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
                Vehicle Password {!isEditMode && "*"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={handleFormChange}
                  style={{ ...fieldStyle, paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-subtle)",
                  marginTop: "4px",
                }}
              >
                {isEditMode
                  ? "Leave blank to keep current password."
                  : "Used by the driver to sign in to the mobile app."}
              </p>
            </div>
          </div>
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
                Driver
              </label>
              <select
                name="employee_uid"
                value={formData.employee_uid || ""}
                onChange={handleFormChange}
                style={fieldStyle}
              >
                {(employees || [])
                  .filter((e) => e.is_active)
                  .map((emp) => (
                    <option key={emp.employee_uid} value={emp.employee_uid}>
                      {emp.name}
                    </option>
                  ))}
              </select>
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
                Assign Route
              </label>
              <select
                name="route_uid"
                value={formData.route_uid || ""}
                onChange={handleFormChange}
                style={fieldStyle}
              >
                {routes
                  .filter((r) => r.status === "active")
                  .map((r) => (
                    <option key={r.route_uid} value={r.route_uid}>
                      {r.origin} → {r.destination}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="vehicleActive"
              name="is_active"
              checked={!!formData.is_active}
              onChange={handleFormChange}
              style={{
                width: "20px",
                height: "20px",
                accentColor: "var(--color-primary)",
              }}
            />
            <label
              htmlFor="vehicleActive"
              style={{ fontSize: "0.9rem", fontWeight: "500" }}
            >
              Active Vehicle
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
          <Button onClick={handleSaveVehicle} fullWidth size="lg">
            {isEditMode ? "Save Changes" : "Add Vehicle"}
          </Button>
        </div>
      </Modal>
    </DeliwheelsLayout>
  );
};

export default VehiclesPage;

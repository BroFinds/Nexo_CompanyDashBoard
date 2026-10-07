import React, { useEffect, useState } from "react";
import DeliwheelsLayout from "../components/DeliwheelsLayout";
import ShopCard from "../components/ShopCard";
import ShopFormModal from "./modals/shops/ShopFormModal";
import ShopDetailModal from "./modals/shops/ShopDetailModal";
import Card from "@shared/components/ui/Card";
import Skeleton from "@shared/components/ui/Skeleton";
import { Search, Store } from "lucide-react";
import { useDeliwheels } from "../context/DeliwheelsContext";

const ShopsPage = () => {
  const {
    shops,
    isLoadingShops,
    shopsHasMore,
    shopsLoaded,
    fetchAllShops,
    addShop,
    updateShop,
    setShopStatus,
    routes,
    routesLoaded,
    fetchRoutes,
  } = useDeliwheels();

  const [searchTerm, setSearchTerm] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);

  useEffect(() => {
    if (!shopsLoaded) fetchAllShops();
    if (!routesLoaded) fetchRoutes();
  }, [shopsLoaded, routesLoaded, fetchAllShops, fetchRoutes]);

  const getRouteLabel = (shop) => {
    const r = routes.find((r) => r.route_uid === shop.route_uid);
    if (r) return `${r.origin} ${r.is_bidirectional ? "↔" : "→"} ${r.destination}`;
    if (shop.route_origin && shop.route_destination) {
      return `${shop.route_origin} → ${shop.route_destination}`;
    }
    return "—";
  };

  const term = searchTerm.toLowerCase();
  const filtered = shops.filter((s) => {
    const matchesSearch =
      (s.shop_name || "").toLowerCase().includes(term) ||
      s.shop_owner_name.toLowerCase().includes(term) ||
      s.shop_contact_number.toLowerCase().includes(term);
    const matchesRoute = !routeFilter || s.route_uid === routeFilter;
    return matchesSearch && matchesRoute;
  });

  const activeShops = filtered.filter((s) => s.status === "active");
  const inactiveShops = filtered.filter((s) => s.status !== "active");

  const handleOpenAdd = () => {
    setEditingShop(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (shop) => {
    setEditingShop(shop);
    setSelectedShop(null);
    setIsFormOpen(true);
  };

  return (
    <DeliwheelsLayout headerTitle="Shops" headerSubtitle="Manage delivery stops on each route">
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "700", letterSpacing: "-0.02em" }}>
            Shops
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Each shop is a delivery stop on a route.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" }}>
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
              placeholder="Search by shop name, owner or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 10px 10px 36px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                outline: "none",
                fontSize: "var(--text-sm)",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              outline: "none",
              fontSize: "var(--text-sm)",
              fontFamily: "inherit",
              color: routeFilter ? "var(--color-text)" : "var(--color-text-subtle)",
              minWidth: "200px",
            }}
          >
            <option value="">All Routes</option>
            {routes
              .filter((r) => r.status === "active")
              .map((r) => (
                <option key={r.route_uid} value={r.route_uid}>
                  {r.origin} {r.is_bidirectional ? "↔" : "→"} {r.destination}
                </option>
              ))}
          </select>
        </div>
      </Card>

      {/* Skeleton loading */}
      {isLoadingShops && shops.length === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--spacing-lg)",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="lg">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <Skeleton width="48px" height="48px" borderRadius="12px" />
                <Skeleton width="60px" height="22px" borderRadius="20px" />
              </div>
              <Skeleton width="70%" height="18px" style={{ marginBottom: "8px" }} />
              <Skeleton width="50%" height="14px" style={{ marginBottom: "6px" }} />
              <Skeleton width="80%" height="14px" />
            </Card>
          ))}
        </div>
      )}

      {!(isLoadingShops && shops.length === 0) && (
        <>
          {/* Active Shops */}
          <ShopsSection
            title="Active Shops"
            shops={activeShops}
            emptyMessage="No active shops found."
            onCardClick={setSelectedShop}
            getRouteLabel={getRouteLabel}
          />

          {/* Inactive Shops */}
          {inactiveShops.length > 0 && (
            <ShopsSection
              title="Inactive Shops"
              shops={inactiveShops}
              emptyMessage="No inactive shops."
              onCardClick={setSelectedShop}
              getRouteLabel={getRouteLabel}
              style={{ marginTop: "var(--spacing-xl)" }}
            />
          )}

          {/* Empty state when no shops at all */}
          {shops.length === 0 && !isLoadingShops && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 24px",
                color: "var(--color-text-subtle)",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  backgroundColor: "var(--bg-body)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Store size={32} style={{ opacity: 0.4 }} />
              </div>
              <p style={{ fontWeight: "600", fontSize: "1rem" }}>No shops yet</p>
              <p style={{ fontSize: "0.85rem", textAlign: "center", maxWidth: "280px" }}>
                Add shops to define the delivery stops on each route. Drivers will see these as deliveries in the mobile app.
              </p>
              <Button onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={16} /> Add First Shop
              </Button>
            </div>
          )}

          {isLoadingShops && shops.length > 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>
              Loading…
            </div>
          )}
        </>
      )}

      <ShopDetailModal
        shop={selectedShop}
        routeLabel={selectedShop ? getRouteLabel(selectedShop) : ""}
        onClose={() => setSelectedShop(null)}
        onEdit={handleEditClick}
        onSetStatus={setShopStatus}
      />

      <ShopFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialShop={editingShop}
        routes={routes}
        onAdd={addShop}
        onUpdate={updateShop}
      />
    </DeliwheelsLayout>
  );
};

const ShopsSection = ({ title, shops, emptyMessage, onCardClick, getRouteLabel, style }) => (
  <div style={style}>
    <h3
      style={{
        fontSize: "var(--text-lg)",
        fontWeight: "600",
        marginBottom: "var(--spacing-md)",
        color: "var(--color-text)",
      }}
    >
      {title}
      <span
        style={{
          marginLeft: "8px",
          fontSize: "var(--text-sm)",
          fontWeight: "500",
          color: "var(--color-text-subtle)",
        }}
      >
        ({shops.length})
      </span>
    </h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--spacing-lg)",
      }}
    >
      {shops.map((shop, index) => (
        <div key={shop.shop_uid} className={`animate-in delay-${(index % 4) * 100}`}>
          <ShopCard
            shop={shop}
            routeLabel={getRouteLabel(shop)}
            onClick={() => onCardClick(shop)}
          />
        </div>
      ))}
      {shops.length === 0 && (
        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "40px",
            color: "var(--color-text-subtle)",
          }}
        >
          {emptyMessage}
        </div>
      )}
    </div>
  </div>
);

export default ShopsPage;

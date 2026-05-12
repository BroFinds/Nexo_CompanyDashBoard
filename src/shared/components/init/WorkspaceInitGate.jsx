import React, { useEffect } from "react";
import { useGlobal } from "@nexo/context/GlobalContext";
import { useDeliwheels } from "@deliwheels/context/DeliwheelsContext";
import LoadItems from "./LoadItems";

// Single init point for the authenticated app shell. Products and vehicles
// fetch in parallel so total splash time is max(products, vehicles). When
// both lists are already hydrated from localStorage, the gate is satisfied
// immediately and children render with no splash — including for /deliwheels,
// which therefore skips a second initialization step.
const WorkspaceInitGate = ({ children }) => {
  const { productsHasMore, fetchAllProducts } = useGlobal();
  const { vehiclesHasMore, fetchAllVehicles } = useDeliwheels();

  useEffect(() => {
    if (productsHasMore) fetchAllProducts();
    if (vehiclesHasMore) fetchAllVehicles();
  }, [productsHasMore, vehiclesHasMore, fetchAllProducts, fetchAllVehicles]);

  return (
    <LoadItems ready={!productsHasMore && !vehiclesHasMore}>
      {children}
    </LoadItems>
  );
};

export default WorkspaceInitGate;

import React, { createContext, useContext } from "react";
import { useVehicles } from "./useVehicles";
import { useRoutes } from "./useRoutes";
import { useStock } from "./useStock";
import { useSales } from "./useSales";

const DeliwheelsContext = createContext();

export const DeliwheelsProvider = ({ children }) => {
  const vehiclesApi = useVehicles();
  const routesApi = useRoutes();
  const stockApi = useStock();
  const salesApi = useSales();

  return (
    <DeliwheelsContext.Provider
      value={{
        ...vehiclesApi,
        ...routesApi,
        ...stockApi,
        ...salesApi,
      }}
    >
      {children}
    </DeliwheelsContext.Provider>
  );
};

export const useDeliwheels = () => useContext(DeliwheelsContext);

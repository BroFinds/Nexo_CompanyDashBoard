import React, { createContext, useContext } from "react";
import { useVehicles } from "./useVehicles";
import { useRoutes } from "./useRoutes";
import { useStock } from "./useStock";
import { useSales } from "./useSales";
import { useShops } from "./useShops";
import { useReturnedStock } from "./useReturnedStock";

const DeliwheelsContext = createContext();

export const DeliwheelsProvider = ({ children }) => {
  const vehiclesApi = useVehicles();
  const routesApi = useRoutes();
  const stockApi = useStock();
  const salesApi = useSales();
  const shopsApi = useShops();
  const returnsApi = useReturnedStock();

  return (
    <DeliwheelsContext.Provider
      value={{
        ...vehiclesApi,
        ...routesApi,
        ...stockApi,
        ...salesApi,
        ...shopsApi,
        ...returnsApi,
      }}
    >
      {children}
    </DeliwheelsContext.Provider>
  );
};

export const useDeliwheels = () => useContext(DeliwheelsContext);

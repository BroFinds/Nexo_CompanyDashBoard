import React, { createContext, useContext } from "react";
import { useEmployees } from "./useEmployees";
import { useProducts } from "./useProducts";
import { useMeasurements } from "./useMeasurements";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const employeesApi = useEmployees();
  const productsApi = useProducts();
  const measurementsApi = useMeasurements();

  return (
    <GlobalContext.Provider
      value={{
        ...employeesApi,
        ...productsApi,
        ...measurementsApi,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);

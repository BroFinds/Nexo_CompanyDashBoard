import React, { createContext, useContext, useState, useCallback } from "react";
import api, { getSession } from "@/services/api";

const GlobalContext = createContext();

// ── Field mappers (API camelCase → UI snake_case) ────────────────────────────

const mapEmployee = (e) => ({
  employee_uid: e.employeeUid || e.employee_uid,
  name: e.name || "",
  contact_number: e.contactNumber || e.contact_number || "",
  pan_card: e.panCard || e.pan_card || "",
  aadhaar: e.aadhaar || "",
  upi_id: e.upiId || e.upi_id || "",
  gender: e.gender || "Male",
  date_of_joining: e.dateOfJoining || e.date_of_joining || "",
  is_active:
    e.isActive !== undefined
      ? e.isActive
      : e.is_active !== undefined
        ? e.is_active
        : true,
});

const mapMeasurement = (m) => ({
  measurement_uid: m.measurementUid || m.measurement_uid,
  measurement_text: m.measurementText || m.measurement_text || "",
  measurement_code: m.measurementCode || m.measurement_code || "",
});

const mapProduct = (p) => {
  const pricing = p.priceMappings?.[0] ?? {};
  return {
    product_uid: p.productUid || p.product_uid,
    product_name: p.productName || p.product_name || "",
    product_code: p.productCode || p.product_code || "",
    category_uid: p.categoryUid || p.category_uid || "",
    measurement_uid: p.measurementUid || p.measurement_uid || "",
    measurement_text: p.measurement?.measurementText || "",
    measurement_value: p.sizeText ?? p.measurement_value ?? 1,
    is_active: p.isActive !== undefined ? p.isActive : true,
    product_description: p.productDescription || p.product_description || "",
    general_price: pricing.generalPrice ?? p.generalPrice ?? 0,
    wholesale_price: pricing.wholesalePrice ?? p.wholesalePrice ?? 0,
  };
};

// ── API body builders ────────────────────────────────────────────────────────

const buildEmployeeBody = (formData, companyId, userId) => ({
  companyUid: companyId,
  name: formData.name,
  contactNumber: formData.contact_number,
  panCard: formData.pan_card || null,
  aadhaar: formData.aadhaar || null,
  upiId: formData.upi_id || null,
  gender: formData.gender || null,
  dateOfJoining: formData.date_of_joining || null,
  isActive: formData.is_active,
  createdBy: userId,
});

const buildProductBody = (formData, companyId, userId) => ({
  companyUid: companyId,
  sizeText: Number(formData.measurement_value) || 0,
  measurementUid: formData.measurement_uid,
  productCode: formData.product_code,
  productName: formData.product_name,
  productDescription: formData.product_description || "",
  isActive: formData.is_active,
  createdBy: userId,
  generalPrice: formData.general_price ?? 0,
  wholesalePrice: formData.wholesale_price ?? 0,
  appUid: null,
});

// ── Provider ─────────────────────────────────────────────────────────────────

export const GlobalProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);

  const [isEmployeesLoaded, setIsEmployeesLoaded] = useState(false);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isMeasurementsLoaded, setIsMeasurementsLoaded] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (isEmployeesLoaded) return;
    setIsLoadingEmployees(true);
    try {
      const session = getSession();
      const { data } = await api.get(
        `/api/v1/companies/${session.companyId}/employees`,
        {
          params: { page: 0, size: 500 },
        },
      );
      setEmployees((data.content || data).map(mapEmployee));
      setIsEmployeesLoaded(true);
    } catch (e) {
      console.error("fetchEmployees:", e);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [isEmployeesLoaded]);

  const fetchProducts = useCallback(async () => {
    if (isProductsLoaded) return;
    setIsLoadingProducts(true);
    try {
      const session = getSession();
      const { data } = await api.get(
        `/api/v1/companies/${session.companyId}/products`,
        {
          params: { page: 0, size: 500 },
        },
      );
      setProducts((data.content || data).map(mapProduct));
      setIsProductsLoaded(true);
    } catch (e) {
      console.error("fetchProducts:", e);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [isProductsLoaded]);

  const fetchMeasurements = useCallback(async () => {
    if (isMeasurementsLoaded) return;
    setIsLoadingMeasurements(true);
    try {
      const { data } = await api.get(`/api/v1/measurements`);
      setMeasurements((data.content || data).map(mapMeasurement));
      setIsMeasurementsLoaded(true);
    } catch (e) {
      console.error("fetchMeasurements:", e);
    } finally {
      setIsLoadingMeasurements(false);
    }
  }, [isMeasurementsLoaded]);

  const addEmployee = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.post(
        `/api/v1/companies/${session.companyId}/employees`,
        buildEmployeeBody(formData, session.companyId, session.userId),
      );
      const mapped = mapEmployee(data);
      setEmployees((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error("addEmployee:", e);
      throw e;
    }
  }, []);

  const updateEmployee = useCallback(async (updatedEmployee) => {
    const session = getSession();
    const uid = updatedEmployee.employee_uid;
    try {
      await api.put(
        `/api/v1/companies/${session.companyId}/employees/${uid}`,
        {
          ...buildEmployeeBody(updatedEmployee, session.companyId, session.userId),
          modifiedBy: session.userId,
        },
      );
      const mapped = mapEmployee(updatedEmployee);
      setEmployees((prev) =>
        prev.map((e) => (e.employee_uid === uid ? mapped : e)),
      );
      return mapped;
    } catch (e) {
      console.error("updateEmployee:", e);
      throw e;
    }
  }, []);

  const addProduct = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.post(
        `/api/v1/companies/${session.companyId}/products/create`,
        buildProductBody(formData, session.companyId, session.userId),
      );
      const mapped = mapProduct(data);
      setProducts((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error("addProduct:", e);
      throw e;
    }
  }, []);

  const updateProduct = useCallback(async (updatedProduct) => {
    const session = getSession();
    const uid = updatedProduct.product_uid;
    try {
      const { data } = await api.put(
        `/api/v1/companies/${session.companyId}/products/update/${uid}`,
        {
          ...buildProductBody(updatedProduct, session.companyId, session.userId),
          productUid: uid,
          modifiedBy: session.userId,
        },
      );
      const mapped = mapProduct(data);
      setProducts((prev) =>
        prev.map((p) => (p.product_uid === uid ? mapped : p)),
      );
      return mapped;
    } catch (e) {
      console.error("updateProduct:", e);
      throw e;
    }
  }, []);

  const disableEmployee = useCallback(async (uid) => {
    const session = getSession();
    try {
      await api.patch(
        `/api/v1/companies/${session.companyId}/employees/${uid}/status/false`,
      );
      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_uid === uid ? { ...e, is_active: false } : e,
        ),
      );
    } catch (e) {
      console.error("disableEmployee:", e);
      throw e;
    }
  }, []);

  const disableProduct = useCallback(async (uid) => {
    const session = getSession();
    try {
      await api.put(
        `/api/v1/companies/${session.companyId}/products/update/${uid}/status/false`,
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.product_uid === uid ? { ...p, is_active: false } : p,
        ),
      );
    } catch (e) {
      console.error("disableProduct:", e);
      throw e;
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        employees,
        products,
        measurements,
        isLoadingEmployees,
        isLoadingProducts,
        isLoadingMeasurements,
        fetchEmployees,
        fetchProducts,
        fetchMeasurements,
        addEmployee,
        updateEmployee,
        disableEmployee,
        addProduct,
        updateProduct,
        disableProduct,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);

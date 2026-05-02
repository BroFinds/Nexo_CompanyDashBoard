import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import api, { getSession, fetchPage } from "@/services/api";

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

  const [employeesHasMore, setEmployeesHasMore] = useState(true);
  const [productsHasMore, setProductsHasMore] = useState(true);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [isMeasurementsLoaded, setIsMeasurementsLoaded] = useState(false);

  const employeesPageRef = useRef(0);
  const productsPageRef = useRef(0);
  const employeesInFlightRef = useRef(false);
  const productsInFlightRef = useRef(false);
  const employeesHasMoreRef = useRef(true);
  const productsHasMoreRef = useRef(true);

  const fetchEmployees = useCallback(async () => {
    if (employeesInFlightRef.current || !employeesHasMoreRef.current) return;
    employeesInFlightRef.current = true;
    setIsLoadingEmployees(true);
    try {
      const session = getSession();
      const { items, last } = await fetchPage(
        `/api/v1/companies/${session.companyId}/employees`,
        { page: employeesPageRef.current },
      );
      const mapped = items.map(mapEmployee);
      setEmployees((prev) => {
        const seen = new Set(prev.map((e) => e.employee_uid));
        return [...prev, ...mapped.filter((e) => !seen.has(e.employee_uid))];
      });
      employeesPageRef.current += 1;
      employeesHasMoreRef.current = !last;
      setEmployeesHasMore(!last);
      setEmployeesLoaded(true);
    } catch (e) {
      console.error("fetchEmployees:", e);
    } finally {
      employeesInFlightRef.current = false;
      setIsLoadingEmployees(false);
    }
  }, []);

  const refreshEmployees = useCallback(async () => {
    employeesPageRef.current = 0;
    employeesHasMoreRef.current = true;
    setEmployees([]);
    setEmployeesHasMore(true);
    setEmployeesLoaded(false);
    await fetchEmployees();
  }, [fetchEmployees]);

  const fetchProducts = useCallback(async () => {
    if (productsInFlightRef.current || !productsHasMoreRef.current) return;
    productsInFlightRef.current = true;
    setIsLoadingProducts(true);
    try {
      const session = getSession();
      const { items, last } = await fetchPage(
        `/api/v1/companies/${session.companyId}/products`,
        { page: productsPageRef.current },
      );
      const mapped = items.map(mapProduct);
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.product_uid));
        return [...prev, ...mapped.filter((p) => !seen.has(p.product_uid))];
      });
      productsPageRef.current += 1;
      productsHasMoreRef.current = !last;
      setProductsHasMore(!last);
      setProductsLoaded(true);
    } catch (e) {
      console.error("fetchProducts:", e);
    } finally {
      productsInFlightRef.current = false;
      setIsLoadingProducts(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    productsPageRef.current = 0;
    productsHasMoreRef.current = true;
    setProducts([]);
    setProductsHasMore(true);
    setProductsLoaded(false);
    await fetchProducts();
  }, [fetchProducts]);

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
        employeesHasMore,
        productsHasMore,
        employeesLoaded,
        productsLoaded,
        fetchEmployees,
        fetchProducts,
        refreshEmployees,
        refreshProducts,
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

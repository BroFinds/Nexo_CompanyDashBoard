import { useCallback, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";

export const mapEmployee = (e) => ({
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

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [employeesHasMore, setEmployeesHasMore] = useState(true);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  const employeesPageRef = useRef(0);
  const employeesInFlightRef = useRef(false);
  const employeesHasMoreRef = useRef(true);

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

  return {
    employees,
    isLoadingEmployees,
    employeesHasMore,
    employeesLoaded,
    fetchEmployees,
    refreshEmployees,
    addEmployee,
    updateEmployee,
    disableEmployee,
  };
};

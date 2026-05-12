import React, { useState, useEffect } from "react";
import NexoLayout from "../components/NexoLayout";
import EmployeeSection from "../components/EmployeeSection";
import EmployeeFormModal from "./modals/employees/EmployeeFormModal";
import EmployeeDetailModal from "./modals/employees/EmployeeDetailModal";
import Card from "@shared/components/ui/Card";
import Button from "@shared/components/ui/Button";
import Skeleton from "@shared/components/ui/Skeleton";
import { Plus, Search } from "lucide-react";
import { useGlobal } from "../context/GlobalContext";
import useInfiniteScroll from "@shared/hooks/useInfiniteScroll";
import InfiniteScrollLoader from "@shared/components/ui/InfiniteScrollLoader";

const EmployeesPage = () => {
  const {
    employees,
    isLoadingEmployees,
    employeesHasMore,
    employeesLoaded,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    disableEmployee,
  } = useGlobal();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (!employeesLoaded) fetchEmployees();
  }, [employeesLoaded, fetchEmployees]);

  const sentinelRef = useInfiniteScroll({
    hasMore: employeesHasMore,
    isLoading: isLoadingEmployees,
    onLoadMore: fetchEmployees,
  });

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleDisable = async (uid) => {
    await disableEmployee(uid);
    setSelectedEmployee(null);
  };

  const matchesSearch = (emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.contact_number.includes(searchTerm);

  const activeEmployees = employees.filter(
    (emp) => emp.is_active && matchesSearch(emp),
  );
  const inactiveEmployees = employees.filter(
    (emp) => !emp.is_active && matchesSearch(emp),
  );

  return (
    <NexoLayout
      headerTitle="Employees"
      headerSubtitle="Manage team access and contacts"
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
            Employees
          </h2>
          <p style={{ color: "var(--color-text-subtle)" }}>
            Manage team access and contacts.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          Add Employee
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
            placeholder="Search employees..."
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

      {isLoadingEmployees && employees.length === 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--spacing-lg)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="lg">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <Skeleton width="48px" height="48px" borderRadius="50%" />
                <Skeleton width="60px" height="24px" borderRadius="12px" />
              </div>
              <Skeleton
                width="70%"
                height="24px"
                style={{ marginBottom: "8px" }}
              />
              <Skeleton width="50%" height="16px" />
            </Card>
          ))}
        </div>
      )}

      {!(isLoadingEmployees && employees.length === 0) && (
        <>
          <EmployeeSection
            title="Active Employees"
            employees={activeEmployees}
            isActive={true}
            emptyMessage="No active employees found."
            onCardClick={setSelectedEmployee}
            style={{ marginBottom: "var(--spacing-xl)" }}
          />

          <EmployeeSection
            title="Inactive Employees"
            employees={inactiveEmployees}
            isActive={false}
            emptyMessage="No inactive employees."
            onCardClick={setSelectedEmployee}
          />

          <div ref={sentinelRef} style={{ height: "1px" }} />
          {isLoadingEmployees && employees.length > 0 && (
            <InfiniteScrollLoader />
          )}
        </>
      )}

      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialEmployee={editingEmployee}
        onAdd={addEmployee}
        onUpdate={updateEmployee}
      />

      <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onEdit={handleEditClick}
        onDisable={handleDisable}
      />
    </NexoLayout>
  );
};

export default EmployeesPage;

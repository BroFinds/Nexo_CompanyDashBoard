import React from "react";
import EmployeeCard from "./EmployeeCard";

const EmployeeSection = ({
  title,
  employees,
  isActive,
  emptyMessage,
  onCardClick,
  style,
}) => {
  return (
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
          ({employees.length})
        </span>
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--spacing-lg)",
        }}
      >
        {employees.map((employee, index) => (
          <div
            key={employee.employee_uid}
            className={`animate-in delay-${(index % 3) * 100}`}
          >
            <EmployeeCard
              employee={employee}
              isActive={isActive}
              onCardClick={() => onCardClick(employee)}
            />
          </div>
        ))}
        {employees.length === 0 && (
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
};

export default EmployeeSection;

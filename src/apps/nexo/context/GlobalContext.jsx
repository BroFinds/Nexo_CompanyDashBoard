import React, { createContext, useContext, useState, useCallback } from 'react';

const GlobalContext = createContext();

// Mock Initial Data (Moved outside to simulate DB)
const MOCK_EMPLOYEES = [
  { employee_uid: 'emp-001', name: 'Sarah Wilson', contact_number: '+1 (555) 123-4567', pan_card: 'ABCDE1234F', aadhaar: '1234 5678 9012', upi_id: 'sarah@upi', gender: 'Female', date_of_joining: new Date('2023-01-15').toISOString(), is_active: true },
  { employee_uid: 'emp-002', name: 'Michael Chen', contact_number: '+1 (555) 987-6543', pan_card: 'FGHIJ5678K', aadhaar: '9876 5432 1098', upi_id: 'michael@upi', gender: 'Male', date_of_joining: new Date('2023-03-22').toISOString(), is_active: false },
  { employee_uid: 'emp-003', name: 'Emma Rodriguez', contact_number: '+1 (555) 456-7890', pan_card: 'KLMNO9012P', aadhaar: '4567 8901 2345', upi_id: 'emma@upi', gender: 'Female', date_of_joining: new Date('2023-06-10').toISOString(), is_active: true },
  { employee_uid: 'emp-004', name: 'James Thompson', contact_number: '+1 (555) 789-0123', pan_card: 'QRSTU3456V', aadhaar: '8901 2345 6789', upi_id: 'james@upi', gender: 'Male', date_of_joining: new Date('2023-08-05').toISOString(), is_active: true },
  { employee_uid: 'emp-005', name: 'David Kim', contact_number: '+1 (555) 321-6547', pan_card: 'WXYZ7890A', aadhaar: '2345 6789 0123', upi_id: 'david@upi', gender: 'Male', date_of_joining: new Date('2023-11-20').toISOString(), is_active: true },
];

const MOCK_PRODUCTS = [
  { product_uid: 'prod-001', product_name: 'Wireless chipset v5', product_code: 'WCHIP-V5', category_uid: 'cat-001', measurement_value: 1, measurement_uid: 'mes-001', is_active: true, product_description: 'High efficiency wireless chipset.' },
  { product_uid: 'prod-002', product_name: 'Steel Alloy Sheets', product_code: 'STL-ALY-009', category_uid: 'cat-003', measurement_value: 500, measurement_uid: 'mes-002', is_active: true, product_description: 'Industrial grade steel.' },
  { product_uid: 'prod-003', product_name: 'Defective Chair Legs', product_code: 'CHR-LEG-X', category_uid: 'cat-002', measurement_value: 15, measurement_uid: 'mes-001', is_active: false, product_description: 'Batch returned.' },
  { product_uid: 'prod-004', product_name: 'USB-C Cable 2m', product_code: 'ACC-USB-C', category_uid: 'cat-001', measurement_value: 1, measurement_uid: 'mes-001', is_active: true, product_description: 'Braided cable.' },
];

export const GlobalProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Loading States
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Cache Flags
  const [isEmployeesLoaded, setIsEmployeesLoaded] = useState(false);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  // Lazy Fetch Employees
  const fetchEmployees = useCallback(async () => {
    if (isEmployeesLoaded) return; // Return from cache
    
    setIsLoadingEmployees(true);
    // Simulate network delay (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setEmployees(MOCK_EMPLOYEES);
    setIsLoadingEmployees(false);
    setIsEmployeesLoaded(true);
  }, [isEmployeesLoaded]);

  // Lazy Fetch Products
  const fetchProducts = useCallback(async () => {
    if (isProductsLoaded) return; // Return from cache

    setIsLoadingProducts(true);
    // Simulate network delay (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProducts(MOCK_PRODUCTS);
    setIsLoadingProducts(false);
    setIsProductsLoaded(true);
  }, [isProductsLoaded]);

  const addEmployee = (employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const updateEmployee = (updatedEmployee) => {
    setEmployees(prev => prev.map(e => e.employee_uid === updatedEmployee.employee_uid ? updatedEmployee : e));
  };

  const addProduct = (product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.product_uid === updatedProduct.product_uid ? updatedProduct : p));
  };

  return (
    <GlobalContext.Provider value={{
      employees,
      products,
      isLoadingEmployees,
      isLoadingProducts,
      fetchEmployees,
      fetchProducts,
      addEmployee,
      updateEmployee,
      addProduct,
      updateProduct
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);

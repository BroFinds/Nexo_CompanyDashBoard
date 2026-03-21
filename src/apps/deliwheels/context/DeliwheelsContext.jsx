import React, { createContext, useContext, useState, useCallback } from 'react';

const DeliwheelsContext = createContext();

const MOCK_VEHICLES = [
  { vehicle_uid: 'veh-001', registration: 'KA-01-AB-1234', type: 'Mini Truck', model: 'Tata Ace', capacity: '750 kg', fuel: 'Diesel', status: 'active', driver: 'Rajesh Kumar', last_service: '2026-02-15', route_uid: 'rt-001' },
  { vehicle_uid: 'veh-002', registration: 'KA-01-CD-5678', type: 'Van', model: 'Mahindra Supro', capacity: '1000 kg', fuel: 'CNG', status: 'active', driver: 'Suresh Patel', last_service: '2026-01-20', route_uid: 'rt-002' },
  { vehicle_uid: 'veh-003', registration: 'KA-02-EF-9012', type: 'Three Wheeler', model: 'Piaggio Ape', capacity: '500 kg', fuel: 'Petrol', status: 'maintenance', driver: 'Unassigned', last_service: '2026-03-01', route_uid: 'rt-005' },
  { vehicle_uid: 'veh-004', registration: 'KA-03-GH-3456', type: 'Mini Truck', model: 'Ashok Leyland Dost', capacity: '1500 kg', fuel: 'Diesel', status: 'active', driver: 'Mohammed Ali', last_service: '2026-02-28', route_uid: 'rt-003' },
  { vehicle_uid: 'veh-005', registration: 'KA-01-IJ-7890', type: 'Van', model: 'Maruti Eeco', capacity: '600 kg', fuel: 'Petrol', status: 'inactive', driver: 'Unassigned', last_service: '2025-11-10', route_uid: '' },
];

// Nexo products — these come from GlobalContext in a real app via shared API
const NEXO_PRODUCTS = [
  { product_uid: 'prod-001', product_name: 'Wireless chipset v5', product_code: 'WCHIP-V5' },
  { product_uid: 'prod-002', product_name: 'Steel Alloy Sheets', product_code: 'STL-ALY-009' },
  { product_uid: 'prod-003', product_name: 'Defective Chair Legs', product_code: 'CHR-LEG-X' },
  { product_uid: 'prod-004', product_name: 'USB-C Cable 2m', product_code: 'ACC-USB-C' },
];

// Stock = products loaded to vehicles
const MOCK_STOCK = [
  { stock_uid: 'stk-001', product_uid: 'prod-001', product_name: 'Wireless chipset v5', product_code: 'WCHIP-V5', quantity: 20, vehicle_uid: 'veh-001', loaded_date: '2026-03-20', status: 'loaded' },
  { stock_uid: 'stk-002', product_uid: 'prod-002', product_name: 'Steel Alloy Sheets', product_code: 'STL-ALY-009', quantity: 50, vehicle_uid: 'veh-002', loaded_date: '2026-03-20', status: 'loaded' },
  { stock_uid: 'stk-003', product_uid: 'prod-004', product_name: 'USB-C Cable 2m', product_code: 'ACC-USB-C', quantity: 100, vehicle_uid: 'veh-001', loaded_date: '2026-03-19', status: 'loaded' },
  { stock_uid: 'stk-004', product_uid: 'prod-001', product_name: 'Wireless chipset v5', product_code: 'WCHIP-V5', quantity: 15, vehicle_uid: 'veh-004', loaded_date: '2026-03-18', status: 'delivered' },
  { stock_uid: 'stk-005', product_uid: 'prod-004', product_name: 'USB-C Cable 2m', product_code: 'ACC-USB-C', quantity: 30, vehicle_uid: 'veh-002', loaded_date: '2026-03-17', status: 'delivered' },
];

const MOCK_ROUTES = [
  { route_uid: 'rt-001', name: 'Whitefield → Koramangala', origin: 'Whitefield Hub', destination: 'Koramangala Depot', status: 'active' },
  { route_uid: 'rt-002', name: 'Electronic City → MG Road', origin: 'Electronic City Hub', destination: 'MG Road Centre', status: 'active' },
  { route_uid: 'rt-003', name: 'Yelahanka → Jayanagar', origin: 'Yelahanka Warehouse', destination: 'Jayanagar Market', status: 'active' },
  { route_uid: 'rt-004', name: 'HSR Layout → Indiranagar', origin: 'HSR Layout Hub', destination: 'Indiranagar Store', status: 'paused' },
  { route_uid: 'rt-005', name: 'Marathahalli → Banashankari', origin: 'Marathahalli Hub', destination: 'Banashankari Depot', status: 'inactive' },
];

const MOCK_SALES = [
  { sale_uid: 'sl-001', order_id: 'ORD-2026-001', customer: 'Fresh Mart', vehicle_uid: 'veh-001', items: 12, amount: 8450, date: '2026-03-20', status: 'delivered' },
  { sale_uid: 'sl-002', order_id: 'ORD-2026-002', customer: 'Green Grocers', vehicle_uid: 'veh-002', items: 8, amount: 5200, date: '2026-03-20', status: 'in_transit' },
  { sale_uid: 'sl-003', order_id: 'ORD-2026-003', customer: 'City Bakery', vehicle_uid: 'veh-001', items: 5, amount: 3100, date: '2026-03-19', status: 'delivered' },
  { sale_uid: 'sl-004', order_id: 'ORD-2026-004', customer: 'QuickBite Cafe', vehicle_uid: 'veh-004', items: 15, amount: 12800, date: '2026-03-19', status: 'delivered' },
  { sale_uid: 'sl-005', order_id: 'ORD-2026-005', customer: 'Spice Junction', vehicle_uid: 'veh-002', items: 6, amount: 4750, date: '2026-03-18', status: 'delivered' },
  { sale_uid: 'sl-006', order_id: 'ORD-2026-006', customer: 'Metro Superstore', vehicle_uid: 'veh-004', items: 22, amount: 18900, date: '2026-03-18', status: 'delivered' },
  { sale_uid: 'sl-007', order_id: 'ORD-2026-007', customer: 'Daily Needs', vehicle_uid: 'veh-001', items: 9, amount: 6300, date: '2026-03-17', status: 'returned' },
  { sale_uid: 'sl-008', order_id: 'ORD-2026-008', customer: 'Farm Fresh', vehicle_uid: 'veh-003', items: 3, amount: 1850, date: '2026-03-17', status: 'cancelled' },
  { sale_uid: 'sl-009', order_id: 'ORD-2026-009', customer: 'Royal Sweets', vehicle_uid: 'veh-002', items: 18, amount: 14200, date: '2026-03-16', status: 'delivered' },
  { sale_uid: 'sl-010', order_id: 'ORD-2026-010', customer: 'Green Grocers', vehicle_uid: 'veh-004', items: 10, amount: 7600, date: '2026-03-16', status: 'delivered' },
];

export const DeliwheelsProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [stock, setStock] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [sales, setSales] = useState([]);
  const [products] = useState(NEXO_PRODUCTS);

  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);

  const [isVehiclesLoaded, setIsVehiclesLoaded] = useState(false);
  const [isStockLoaded, setIsStockLoaded] = useState(false);
  const [isRoutesLoaded, setIsRoutesLoaded] = useState(false);
  const [isSalesLoaded, setIsSalesLoaded] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (isVehiclesLoaded) return;
    setIsLoadingVehicles(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setVehicles(MOCK_VEHICLES);
    setIsLoadingVehicles(false);
    setIsVehiclesLoaded(true);
  }, [isVehiclesLoaded]);

  const fetchStock = useCallback(async () => {
    if (isStockLoaded) return;
    setIsLoadingStock(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setStock(MOCK_STOCK);
    setIsLoadingStock(false);
    setIsStockLoaded(true);
  }, [isStockLoaded]);

  const fetchRoutes = useCallback(async () => {
    if (isRoutesLoaded) return;
    setIsLoadingRoutes(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRoutes(MOCK_ROUTES);
    setIsLoadingRoutes(false);
    setIsRoutesLoaded(true);
  }, [isRoutesLoaded]);

  const fetchSales = useCallback(async () => {
    if (isSalesLoaded) return;
    setIsLoadingSales(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSales(MOCK_SALES);
    setIsLoadingSales(false);
    setIsSalesLoaded(true);
  }, [isSalesLoaded]);

  // ── CRUD operations ──────────────────────────────

  const addVehicle = useCallback((vehicle) => {
    const newVehicle = { ...vehicle, vehicle_uid: `veh-${Date.now()}` };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  }, []);

  const addRoute = useCallback((route) => {
    const newRoute = { ...route, route_uid: `rt-${Date.now()}` };
    setRoutes(prev => [...prev, newRoute]);
    return newRoute;
  }, []);

  // Add stock = load a Nexo product to a vehicle
  const addStockLoading = useCallback((productUid, quantity, vehicleUid) => {
    const product = NEXO_PRODUCTS.find(p => p.product_uid === productUid);
    if (!product) return null;
    const newEntry = {
      stock_uid: `stk-${Date.now()}`,
      product_uid: productUid,
      product_name: product.product_name,
      product_code: product.product_code,
      quantity,
      vehicle_uid: vehicleUid,
      loaded_date: new Date().toISOString().split('T')[0],
      status: 'loaded',
    };
    setStock(prev => [...prev, newEntry]);
    return newEntry;
  }, []);

  const updateVehicle = useCallback((updatedVehicle) => {
    setVehicles(prev => prev.map(v => v.vehicle_uid === updatedVehicle.vehicle_uid ? updatedVehicle : v));
  }, []);

  const updateRoute = useCallback((updatedRoute) => {
    setRoutes(prev => prev.map(r => r.route_uid === updatedRoute.route_uid ? updatedRoute : r));
  }, []);

  const updateStock = useCallback((updatedEntry) => {
    setStock(prev => prev.map(s => s.stock_uid === updatedEntry.stock_uid ? updatedEntry : s));
  }, []);

  return (
    <DeliwheelsContext.Provider value={{
      vehicles, stock, routes, sales, products,
      isLoadingVehicles, isLoadingStock, isLoadingRoutes, isLoadingSales,
      fetchVehicles, fetchStock, fetchRoutes, fetchSales,
      addVehicle, addRoute, addStockLoading,
      updateVehicle, updateRoute, updateStock,
    }}>
      {children}
    </DeliwheelsContext.Provider>
  );
};

export const useDeliwheels = () => useContext(DeliwheelsContext);

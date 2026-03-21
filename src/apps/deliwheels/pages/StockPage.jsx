import React, { useEffect, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import Modal from '@shared/components/ui/Modal';
import SearchableSelect from '@shared/components/ui/SearchableSelect';
import { Search, Package, Plus, Truck, Filter } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

const StockPage = () => {
  const { stock, vehicles, products, isLoadingStock, isLoadingVehicles, fetchStock, fetchVehicles, addStockLoading, updateStock } = useDeliwheels();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ product_uid: '', quantity: 1, vehicle_uid: '', status: 'loaded' });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchStock(); fetchVehicles(); }, [fetchStock, fetchVehicles]);

  const getVehicleLabel = (vuid) => {
    const v = vehicles.find(v => v.vehicle_uid === vuid);
    return v ? v.registration : vuid;
  };

  const getVehicleDetail = (vuid) => {
    const v = vehicles.find(v => v.vehicle_uid === vuid);
    return v ? `${v.registration} — ${v.model} (${v.driver})` : vuid;
  };

  const filteredStock = stock.filter(s => {
    const matchesSearch = s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = filterVehicle === 'all' || s.vehicle_uid === filterVehicle;
    return matchesSearch && matchesVehicle;
  });

  const totalLoaded = filteredStock.filter(s => s.status === 'loaded').reduce((sum, s) => sum + s.quantity, 0);
  const totalDelivered = filteredStock.filter(s => s.status === 'delivered').reduce((sum, s) => sum + s.quantity, 0);

  const handleSaveStock = () => {
    if (!formData.product_uid) { setFormError('Please select a product.'); return; }
    if (!formData.vehicle_uid) { setFormError('Please select a vehicle.'); return; }
    if (formData.quantity <= 0) { setFormError('Quantity must be at least 1.'); return; }

    const product = products.find(p => p.product_uid === formData.product_uid);
    const vehicle = vehicles.find(v => v.vehicle_uid === formData.vehicle_uid);
    
    if (isEditMode) {
      updateStock({
         ...formData,
         product_name: product?.product_name || formData.product_name,
         product_code: product?.product_code || formData.product_code
      });
      setSuccessMsg(`Updated stock entry for "${product?.product_name}".`);
      setIsEditMode(false);
    } else {
      addStockLoading(formData.product_uid, formData.quantity, formData.vehicle_uid);
      setSuccessMsg(`Loaded ${formData.quantity}× "${product?.product_name}" to ${vehicle?.registration}.`);
    }
    setFormError('');
  };

  const handleEditClick = (entry) => {
    setFormData(entry);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ product_uid: '', quantity: 1, vehicle_uid: '', status: 'loaded' });
    setFormError('');
    setSuccessMsg('');
    setIsEditMode(false);
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border-subtle)', outline: 'none',
    fontSize: '0.9rem', fontFamily: 'inherit',
  };

  return (
    <DeliwheelsLayout headerTitle="Stock" headerSubtitle="Load products to vehicles">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Stock</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Load Nexo products onto delivery vehicles.</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setIsEditMode(false); setFormData({ product_uid: '', quantity: 1, vehicle_uid: '', status: 'loaded' }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Stock
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <Card padding="lg" className="animate-in">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Total Entries</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{filteredStock.length}</p>
        </Card>
        <Card padding="lg" className="animate-in delay-100">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Currently Loaded</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>{totalLoaded} units</p>
        </Card>
        <Card padding="lg" className="animate-in delay-200">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Delivered</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#059669' }}>{totalDelivered} units</p>
        </Card>
      </div>

      {/* Search + Vehicle Filter */}
      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
            <input type="text" placeholder="Search by product name or code..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: 'var(--text-sm)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--color-text-subtle)' }} />
            <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: 'var(--text-sm)', backgroundColor: 'white', cursor: 'pointer', fontWeight: filterVehicle !== 'all' ? '600' : '400', color: filterVehicle !== 'all' ? 'var(--color-primary)' : 'inherit' }}>
              <option value="all">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.vehicle_uid} value={v.vehicle_uid}>{v.registration} — {v.model}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Stock Table */}
      <Card padding="none">
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-body)' }}>
                {['Product', 'Code', 'Qty', 'Vehicle', 'Loaded Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-body)', padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 1px 0 var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isLoadingStock || isLoadingVehicles) && [1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {[1,2,3,4,5,6,7].map(j => (
                    <td key={j} style={{ padding: '14px 16px' }}><Skeleton width={j === 1 ? '130px' : '70px'} height="16px" /></td>
                  ))}
                </tr>
              ))}

              {!isLoadingStock && !isLoadingVehicles && filteredStock.map(entry => (
                <tr key={entry.stock_uid}
                  style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-body)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <span style={{ fontWeight: '600' }}>{entry.product_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>{entry.product_code}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace' }}>{entry.quantity}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={14} style={{ color: 'var(--color-text-subtle)' }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{getVehicleLabel(entry.vehicle_uid)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-subtle)' }}>{entry.loaded_date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={entry.status === 'loaded' ? 'warning' : 'success'}>
                      {entry.status === 'loaded' ? 'Loaded' : 'Delivered'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Button variant="secondary" onClick={() => handleEditClick(entry)} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>Edit</Button>
                  </td>
                </tr>
              ))}

              {!isLoadingStock && filteredStock.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>
                  No stock entries found{filterVehicle !== 'all' ? ' for this vehicle' : ''}.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Stock Modal — Pick product, qty, vehicle */}
      <Modal isOpen={showAddModal} onClose={closeAddModal} title={isEditMode ? "Edit Stock Entry" : "Add Stock to Vehicle"}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {successMsg ? (
            <>
              <div style={{ padding: '16px', borderRadius: '10px', background: '#d1fae5', color: '#065f46', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                ✅ {successMsg}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!isEditMode && <Button variant="secondary" onClick={() => { setSuccessMsg(''); setFormData({ product_uid: '', quantity: 1, vehicle_uid: '', status: 'loaded' }); }} fullWidth>Load Another</Button>}
                <Button onClick={closeAddModal} fullWidth>Done</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Product *</label>
                <SearchableSelect
                  options={products.map(p => ({ value: p.product_uid, label: p.product_name, sub: p.product_code }))}
                  value={formData.product_uid}
                  onChange={(val) => { setFormData(prev => ({ ...prev, product_uid: val })); if (formError) setFormError(''); }}
                  placeholder="Search for a product..."
                  noResultsText="No products found"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Quantity *</label>
                <input
                  type="number" min="1"
                  value={formData.quantity}
                  onChange={(e) => { setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 })); if (formError) setFormError(''); }}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Vehicle *</label>
                <select
                  value={formData.vehicle_uid}
                  onChange={(e) => { setFormData(prev => ({ ...prev, vehicle_uid: e.target.value })); if (formError) setFormError(''); }}
                  style={fieldStyle}
                >
                  <option value="">— Select a vehicle —</option>
                  {vehicles.filter(v => v.status === 'active').map(v => (
                    <option key={v.vehicle_uid} value={v.vehicle_uid}>{v.registration} — {v.model} ({v.driver})</option>
                  ))}
                </select>
              </div>
              {isEditMode && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => { setFormData(prev => ({ ...prev, status: e.target.value })); if (formError) setFormError(''); }}
                    style={fieldStyle}
                  >
                    <option value="loaded">Loaded</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              )}
              {formError && <p style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{formError}</p>}
              <Button onClick={handleSaveStock} fullWidth size="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Package size={16} /> {isEditMode ? 'Save Changes' : 'Load to Vehicle'}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </DeliwheelsLayout>
  );
};

export default StockPage;

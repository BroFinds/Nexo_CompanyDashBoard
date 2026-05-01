import React, { useEffect, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import Modal from '@shared/components/ui/Modal';
import { Search, Truck, Plus, Fuel, Weight } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';
import { useGlobal } from '../../nexo/context/GlobalContext';

const EMPTY_VEHICLE = { registration: '', type: 'Mini Truck', model: '', capacity: '', fuel: 'Diesel', status: 'active', driver: 'Unassigned', employee_uid: '', last_service: '', route_uid: '', username: '', password: '' };

const VehiclesPage = () => {
  const { vehicles, routes, isLoadingVehicles, fetchVehicles, fetchRoutes, addVehicle, updateVehicle, deleteVehicle } = useDeliwheels();
  const { employees, fetchEmployees } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_VEHICLE });
  const [formError, setFormError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { fetchVehicles(); fetchRoutes(); fetchEmployees(); }, [fetchVehicles, fetchRoutes, fetchEmployees]);

  const getRouteLabel = (ruid) => {
    const r = routes.find(r => r.route_uid === ruid);
    return r ? r.name : 'Unassigned';
  };

  const getDriverName = (v) => {
    if (v.driver && v.driver !== 'Unassigned' && v.driver !== '') return v.driver;
    if (v.employee_uid) {
      const emp = (employees || []).find((e) => e.employee_uid === v.employee_uid);
      return emp?.name || 'Unassigned';
    }
    return 'Unassigned';
  };

  const filteredVehicles = vehicles.filter(v =>
    v.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (s) => s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger';

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'employee_uid') {
      const emp = (employees || []).find((em) => em.employee_uid === value);
      setFormData((prev) => ({ ...prev, employee_uid: value, driver: emp?.name || 'Unassigned' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formError) setFormError('');
  };

  const handleSaveVehicle = async () => {
    if (!formData.registration || !formData.model || (isEditMode && !formData.capacity)) {
      setFormError('Registration, model' + (isEditMode ? ', and capacity' : '') + ' are required.');
      return;
    }
    if (!isEditMode && (!formData.username || !formData.password)) {
      setFormError('Driver username and password are required.');
      return;
    }
    try {
      if (isEditMode) {
        await updateVehicle(formData);
      } else {
        await addVehicle(formData);
      }
      setShowAddModal(false);
      setFormData({ ...EMPTY_VEHICLE });
      setFormError('');
      setIsEditMode(false);
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to save vehicle. Check console.');
    }
  };

  const handleEditClick = (vehicle) => {
    setFormData(vehicle);
    setIsEditMode(true);
    setSelectedVehicle(null);
    setConfirmingDelete(false);
    setShowAddModal(true);
  };

  const handleDeleteVehicle = async (uid) => {
    setDeleteError('');
    try {
      await deleteVehicle(uid);
      setSelectedVehicle(null);
      setConfirmingDelete(false);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete. Try again.');
    }
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border-subtle)', outline: 'none',
    fontSize: '0.9rem', fontFamily: 'inherit',
  };

  return (
    <DeliwheelsLayout headerTitle="Vehicles" headerSubtitle="Manage your delivery fleet">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Vehicles</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Manage fleet and delivery vehicles.</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setIsEditMode(false); setFormData({ ...EMPTY_VEHICLE }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Vehicle
        </Button>
      </div>

      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
          <input type="text" placeholder="Search by registration, model, or driver..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: 'var(--text-sm)' }} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {isLoadingVehicles && [1,2,3,4].map(i => (
          <Card key={i} padding="lg"><Skeleton width="80%" height="20px" style={{ marginBottom: '12px' }} /><Skeleton width="100%" height="40px" style={{ marginBottom: '12px' }} /><Skeleton width="50%" height="16px" /></Card>
        ))}

        {!isLoadingVehicles && filteredVehicles.map((v, i) => (
          <div key={v.vehicle_uid} className={`animate-in delay-${(i % 3) * 100}`}>
            <Card hoverable padding="lg" onClick={() => setSelectedVehicle(v)} style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Truck size={24} />
                </div>
                <Badge variant={getStatusVariant(v.status)}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</Badge>
              </div>
              <h3 style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{v.registration}</h3>
              <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>{v.model} — {v.type}</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginBottom: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Fuel size={14} /> {v.fuel}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Weight size={14} /> {v.capacity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.85rem' }}>Driver: <strong>{getDriverName(v)}</strong></p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>Route: {getRouteLabel(v.route_uid)}</p>
              </div>
            </Card>
          </div>
        ))}
        {!isLoadingVehicles && filteredVehicles.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>No vehicles found.</div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedVehicle} onClose={() => { setSelectedVehicle(null); setConfirmingDelete(false); setDeleteError(''); }} title="Vehicle Details">
        {selectedVehicle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Truck size={32} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: '700' }}>{selectedVehicle.registration}</h3>
                <p style={{ color: 'var(--color-text-subtle)' }}>{selectedVehicle.model} — {selectedVehicle.type}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
              {[ { l: 'Status', v: selectedVehicle.status }, { l: 'Fuel', v: selectedVehicle.fuel }, { l: 'Capacity', v: selectedVehicle.capacity }, { l: 'Driver', v: getDriverName(selectedVehicle) }, { l: 'Assigned Route', v: getRouteLabel(selectedVehicle.route_uid) }, { l: 'Last Service', v: selectedVehicle.last_service || 'N/A' } ].map(i => (
                <div key={i.l} style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>{i.l}</p>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{i.v}</p>
                </div>
              ))}
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--spacing-md) 0' }} />
            {deleteError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{deleteError}</p>
            )}
            {!confirmingDelete ? (
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Button fullWidth variant="primary" onClick={() => handleEditClick(selectedVehicle)}>Edit Vehicle</Button>
                <Button variant="danger" onClick={() => setConfirmingDelete(true)} style={{ padding: '0 20px' }}>Delete</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '600', margin: 0 }}>Remove {selectedVehicle.registration}? This cannot be undone.</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <Button fullWidth variant="secondary" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                  <Button fullWidth variant="danger" onClick={() => handleDeleteVehicle(selectedVehicle.vehicle_uid)}>Confirm Delete</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); setIsEditMode(false); setFormData({ ...EMPTY_VEHICLE }); }} title={isEditMode ? "Edit Vehicle" : "Add New Vehicle"}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Registration *</label>
            <input name="registration" value={formData.registration} onChange={handleFormChange} placeholder="e.g. KA-01-XX-1234" style={fieldStyle} />
          </div>
          {isEditMode ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Model *</label>
                  <input name="model" value={formData.model} onChange={handleFormChange} placeholder="e.g. Tata Ace" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Type</label>
                  <select name="type" value={formData.type} onChange={handleFormChange} style={fieldStyle}>
                    <option>Mini Truck</option><option>Van</option><option>Three Wheeler</option><option>Pickup</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Capacity *</label>
                  <input name="capacity" value={formData.capacity} onChange={handleFormChange} placeholder="e.g. 750 kg" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Fuel</label>
                  <select name="fuel" value={formData.fuel} onChange={handleFormChange} style={fieldStyle}>
                    <option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Model *</label>
                <input name="model" value={formData.model} onChange={handleFormChange} placeholder="e.g. Tata Ace" style={fieldStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Driver Username *</label>
                  <input name="username" value={formData.username} onChange={handleFormChange} placeholder="e.g. driver_raj" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Driver Password *</label>
                  <input name="password" type="password" value={formData.password} onChange={handleFormChange} placeholder="Mobile app password" style={fieldStyle} />
                </div>
              </div>
            </>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Driver</label>
              <select name="employee_uid" value={formData.employee_uid || ''} onChange={handleFormChange} style={fieldStyle}>
                <option value="">Unassigned</option>
                {(employees || []).filter(e => e.is_active).map(emp => (
                  <option key={emp.employee_uid} value={emp.employee_uid}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Assign Route</label>
              <select name="route_uid" value={formData.route_uid} onChange={handleFormChange} style={fieldStyle}>
                <option value="">Unassigned</option>
                {routes.filter(r => r.status === 'active').map(r => (
                  <option key={r.route_uid} value={r.route_uid}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{formError}</p>}
          <Button onClick={handleSaveVehicle} fullWidth size="lg">{isEditMode ? 'Save Changes' : 'Add Vehicle'}</Button>
        </div>
      </Modal>
    </DeliwheelsLayout>
  );
};

export default VehiclesPage;

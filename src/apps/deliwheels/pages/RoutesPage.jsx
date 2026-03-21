import React, { useEffect, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import Modal from '@shared/components/ui/Modal';
import { Search, MapPin, Clock, Navigation, Plus } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

const EMPTY_ROUTE = { name: '', origin: '', destination: '', status: 'active' };

const RoutesPage = () => {
  const { routes, vehicles, isLoadingRoutes, fetchRoutes, fetchVehicles, addRoute, updateRoute } = useDeliwheels();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_ROUTE });
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchRoutes(); fetchVehicles(); }, [fetchRoutes, fetchVehicles]);

  const filteredRoutes = routes.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (s) => s === 'active' ? 'success' : s === 'paused' ? 'warning' : 'danger';

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'stops' ? parseInt(value) || 0 : value }));
    if (formError) setFormError('');
  };

  const handleSaveRoute = () => {
    if (!formData.origin || !formData.destination) {
      setFormError('Origin and destination are required.');
      return;
    }
    const routeName = formData.name || `${formData.origin} → ${formData.destination}`;
    
    if (isEditMode) {
      updateRoute({ ...formData, name: routeName });
    } else {
      addRoute({ ...formData, name: routeName });
    }
    
    setShowAddModal(false);
    setFormData({ ...EMPTY_ROUTE });
    setFormError('');
    setIsEditMode(false);
  };

  const handleEditClick = (route) => {
    setFormData(route);
    setIsEditMode(true);
    setSelectedRoute(null);
    setShowAddModal(true);
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border-subtle)', outline: 'none',
    fontSize: '0.9rem', fontFamily: 'inherit',
  };

  return (
    <DeliwheelsLayout headerTitle="Routes" headerSubtitle="Manage delivery routes and schedules">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Routes</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Manage delivery routes and schedules.</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setIsEditMode(false); setFormData({ ...EMPTY_ROUTE }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Route
        </Button>
      </div>

      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
          <input type="text" placeholder="Search by route name, origin, or destination..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: 'var(--text-sm)' }} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {isLoadingRoutes && [1,2,3,4].map(i => (
          <Card key={i} padding="lg"><Skeleton width="80%" height="20px" style={{ marginBottom: '12px' }} /><Skeleton width="100%" height="60px" style={{ marginBottom: '12px' }} /><Skeleton width="50%" height="16px" /></Card>
        ))}

        {!isLoadingRoutes && filteredRoutes.map((route, index) => (
          <div key={route.route_uid} className={`animate-in delay-${(index % 3) * 100}`}>
            <Card hoverable padding="lg" onClick={() => setSelectedRoute(route)} style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', flex: 1, marginRight: '8px' }}>{route.name}</h3>
                <Badge variant={getStatusVariant(route.status)}>
                  {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                </Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px', backgroundColor: 'var(--bg-body)', borderRadius: '10px', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
                  <div style={{ width: '2px', height: '24px', backgroundColor: 'var(--border-subtle)' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--color-primary)', backgroundColor: 'white' }}></div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>{route.origin}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{route.destination}</p>
                </div>
              </div>
            </Card>
          </div>
        ))}
        {!isLoadingRoutes && filteredRoutes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>No routes found.</div>
        )}
      </div>

      {/* Route Detail Modal */}
      <Modal isOpen={!!selectedRoute} onClose={() => setSelectedRoute(null)} title="Route Details">
        {selectedRoute && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{selectedRoute.name}</h3>
              <Badge variant={getStatusVariant(selectedRoute.status)}>{selectedRoute.status.charAt(0).toUpperCase() + selectedRoute.status.slice(1)}</Badge>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-body)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}><MapPin size={18} /></div>
                <span style={{ fontWeight: '600' }}>{selectedRoute.origin}</span>
              </div>
              <div style={{ marginLeft: '18px', borderLeft: '2px dashed var(--border-subtle)', height: '32px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444' }}><MapPin size={18} /></div>
                <span style={{ fontWeight: '600' }}>{selectedRoute.destination}</span>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--spacing-md) 0' }} />
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth variant="primary" onClick={() => handleEditClick(selectedRoute)}>Edit Route</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Route Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); setIsEditMode(false); setFormData({ ...EMPTY_ROUTE }); }} title={isEditMode ? "Edit Route" : "Add New Route"}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Route Name (auto-generated if empty)</label>
            <input name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Whitefield → Koramangala" style={fieldStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Origin *</label>
              <input name="origin" value={formData.origin} onChange={handleFormChange} placeholder="Starting point" style={fieldStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Destination *</label>
              <input name="destination" value={formData.destination} onChange={handleFormChange} placeholder="End point" style={fieldStyle} />
            </div>
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{formError}</p>}
          <Button onClick={handleSaveRoute} fullWidth size="lg">{isEditMode ? 'Save Changes' : 'Add Route'}</Button>
        </div>
      </Modal>
    </DeliwheelsLayout>
  );
};

export default RoutesPage;

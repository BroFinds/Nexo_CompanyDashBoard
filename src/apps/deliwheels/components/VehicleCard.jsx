import React from 'react';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import { Truck } from 'lucide-react';

const getStatusVariant = (s) => s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger';

const VehicleCard = ({ vehicle, driverName, onClick }) => (
  <Card hoverable padding="lg" onClick={onClick} style={{ cursor: 'pointer', height: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Truck size={24} />
      </div>
      <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}</Badge>
    </div>
    <h3 style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{vehicle.registration || '—'}</h3>
    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>{vehicle.model || 'Unnamed'}</p>
    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
      <p style={{ fontSize: '0.85rem' }}>Driver: <strong>{driverName}</strong></p>
    </div>
  </Card>
);

export default VehicleCard;

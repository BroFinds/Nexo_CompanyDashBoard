import React from 'react';
import EntityCard, { EntityIcon } from '@shared/components/ui/EntityCard';
import Badge from '@shared/components/ui/Badge';
import { Truck } from 'lucide-react';

const getStatusVariant = (s) => s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger';

const DeliveryProgress = ({ totalQty, remainingQty }) => {
  if (!totalQty || totalQty === 0) return null;
  const delivered = totalQty - remainingQty;
  const pct = Math.min(100, Math.round((delivered / totalQty) * 100));
  const barColor = pct >= 80 ? '#059669' : pct >= 40 ? '#2563eb' : '#d97706';

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: '600' }}>
          Delivery Progress
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: barColor, fontFamily: 'monospace' }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '999px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: '999px',
          background: barColor,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-subtle)' }}>
          {delivered} delivered
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-subtle)' }}>
          {remainingQty} remaining
        </span>
      </div>
    </div>
  );
};

const VehicleCard = ({ vehicle, driverName, routeLabel, onClick, deliveryStatus }) => (
  <EntityCard
    onClick={onClick}
    muted={vehicle.status !== 'active'}
    leading={
      <EntityIcon background="var(--color-primary-subtle)" color="var(--color-primary)">
        <Truck size={20} />
      </EntityIcon>
    }
    title={vehicle.registration || '—'}
    titleMono
    subtitle={vehicle.model || 'Unnamed'}
    badge={<Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}</Badge>}
    meta={[
      { label: 'Driver', value: driverName },
      { label: 'Route', value: routeLabel || 'Not assigned' },
    ]}
  >
    {deliveryStatus?.hasActiveDelivery && (
      <DeliveryProgress
        totalQty={deliveryStatus.totalQty}
        remainingQty={deliveryStatus.remainingQty}
      />
    )}
  </EntityCard>
);

export default VehicleCard;

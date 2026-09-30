import React from 'react';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import { Truck, CheckCircle2 } from 'lucide-react';

const getStatusVariant = (s) => s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'danger';

const DeliveryProgress = ({ totalQty, remainingQty, isComplete }) => {
  if (!totalQty || totalQty === 0) return null;
  const delivered = totalQty - remainingQty;
  const pct = Math.min(100, Math.round((delivered / totalQty) * 100));
  const barColor = isComplete ? '#16a34a' : pct >= 80 ? '#059669' : pct >= 40 ? '#2563eb' : '#d97706';

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

const VehicleCard = ({ vehicle, driverName, onClick, deliveryStatus, onCompleteDelivery }) => (
  <Card hoverable padding="lg" onClick={onClick} style={{ cursor: 'pointer', height: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Truck size={24} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}</Badge>
        {deliveryStatus?.hasActiveDelivery && (
          deliveryStatus.isComplete ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '600', color: '#16a34a', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '999px', padding: '2px 8px' }}>
              <CheckCircle2 size={11} />
              Completed
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '600', color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '999px', padding: '2px 8px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
              Ongoing
            </span>
          )
        )}
      </div>
    </div>

    <h3 style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{vehicle.registration || '—'}</h3>
    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', marginBottom: 'var(--spacing-sm)' }}>{vehicle.model || 'Unnamed'}</p>

    {/* Delivery progress bar — only when active delivery exists */}
    {deliveryStatus?.hasActiveDelivery && (
      <DeliveryProgress
        totalQty={deliveryStatus.totalQty}
        remainingQty={deliveryStatus.remainingQty}
        isComplete={deliveryStatus.isComplete}
      />
    )}

    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ fontSize: '0.85rem' }}>Driver: <strong>{driverName}</strong></p>
      {deliveryStatus?.hasActiveDelivery && !deliveryStatus.isComplete && (
        <button
          onClick={(e) => { e.stopPropagation(); onCompleteDelivery?.(vehicle); }}
          style={{
            fontSize: '0.75rem', fontWeight: '700', padding: '5px 12px',
            borderRadius: '6px', background: '#dc2626', color: '#fff',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Complete
        </button>
      )}
    </div>
  </Card>
);

export default VehicleCard;

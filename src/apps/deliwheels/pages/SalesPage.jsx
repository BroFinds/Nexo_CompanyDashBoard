import React, { useEffect, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Skeleton from '@shared/components/ui/Skeleton';
import { Search, ShoppingCart, Filter, IndianRupee } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

const SalesPage = () => {
  const { sales, vehicles, isLoadingSales, isLoadingVehicles, fetchSales, fetchVehicles } = useDeliwheels();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  useEffect(() => {
    fetchSales();
    fetchVehicles();
  }, [fetchSales, fetchVehicles]);

  const getVehicleLabel = (vuid) => {
    const v = vehicles.find(v => v.vehicle_uid === vuid);
    return v ? `${v.registration}` : vuid;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'warning';
      case 'returned': return 'danger';
      case 'cancelled': return 'neutral';
      default: return 'neutral';
    }
  };

  const formatStatus = (status) => status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || s.vehicle_uid === selectedVehicle;
    return matchesSearch && matchesVehicle;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => s.status === 'delivered' ? sum + s.amount : sum, 0);
  const totalOrders = filteredSales.length;
  const deliveredCount = filteredSales.filter(s => s.status === 'delivered').length;

  return (
    <DeliwheelsLayout headerTitle="Sales" headerSubtitle="Track orders and revenue">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Sales</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Track orders, deliveries, and revenue.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <Card padding="lg" className="animate-in">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Total Revenue</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IndianRupee size={22} /> {totalRevenue.toLocaleString('en-IN')}
          </p>
        </Card>
        <Card padding="lg" className="animate-in delay-100">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Total Orders</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{totalOrders}</p>
        </Card>
        <Card padding="lg" className="animate-in delay-200">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Delivered</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#059669' }}>{deliveredCount}</p>
        </Card>
      </div>

      {/* Search + Vehicle Filter */}
      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
            <input
              type="text" placeholder="Search by customer or order ID..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: 'var(--text-sm)' }}
            />
          </div>

          {/* Vehicle Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--color-text-subtle)' }} />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              style={{
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)', outline: 'none',
                fontSize: 'var(--text-sm)', backgroundColor: 'white', cursor: 'pointer',
                fontWeight: selectedVehicle !== 'all' ? '600' : '400',
                color: selectedVehicle !== 'all' ? 'var(--color-primary)' : 'inherit'
              }}
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.vehicle_uid} value={v.vehicle_uid}>
                  {v.registration} — {v.model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Sales Table */}
      <Card padding="none">
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-body)' }}>
                {['Order ID', 'Customer', 'Vehicle', 'Items', 'Amount (₹)', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-body)', padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 1px 0 var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isLoadingSales || isLoadingVehicles) && [1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {[1,2,3,4,5,6,7].map(j => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <Skeleton width={j === 2 ? '120px' : '70px'} height="16px" />
                    </td>
                  ))}
                </tr>
              ))}

              {!isLoadingSales && !isLoadingVehicles && filteredSales.map((sale) => (
                <tr key={sale.sale_uid} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-body)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: '600', fontSize: '0.85rem' }}>{sale.order_id}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>{sale.customer}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>{getVehicleLabel(sale.vehicle_uid)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace' }}>{sale.items}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace' }}>₹{sale.amount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-subtle)' }}>{sale.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={getStatusVariant(sale.status)}>
                      {formatStatus(sale.status)}
                    </Badge>
                  </td>
                </tr>
              ))}

              {!isLoadingSales && filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>
                    No sales found{selectedVehicle !== 'all' ? ' for this vehicle' : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DeliwheelsLayout>
  );
};

export default SalesPage;

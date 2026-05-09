import React, { useEffect, useState, useRef } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import Modal from '@shared/components/ui/Modal';
import SearchableSelect from '@shared/components/ui/SearchableSelect';
import { Search, Filter, IndianRupee, X, Eye, Lock, Receipt, Truck, Calendar, User } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';
import useInfiniteScroll from '@shared/hooks/useInfiniteScroll';
import InfiniteScrollLoader from '@shared/components/ui/InfiniteScrollLoader';

const formatMoney = (n) =>
  Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatSaleDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const paymentStatusVariant = (text) => {
  switch ((text || '').toUpperCase()) {
    case 'PAID':
      return 'success';
    case 'PENDING':
    case 'PARTIAL':
      return 'warning';
    case 'FAILED':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'neutral';
  }
};

const SalesPage = () => {
  const {
    sales,
    vehicles,
    isLoadingSales,
    salesHasMore,
    salesLoaded,
    vehiclesLoaded,
    fetchVehicles,
    fetchSales,
    searchSales,
    getSale,
  } = useDeliwheels();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const [detailSale, setDetailSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    if (!vehiclesLoaded) fetchVehicles();
    // Sales is intentionally NOT fetched on mount — user applies a filter
    // first so we never load the full table by default.
  }, [vehiclesLoaded, fetchVehicles]);

  // A date range is only "complete" when both ends are set — a half-filled
  // range is treated as no date filter, so we don't fire a search until the
  // user picks the matching end (or clears the start).
  const hasCompleteDateRange = !!filterFromDate && !!filterToDate;
  const hasServerFilter =
    filterVehicle !== 'all' || hasCompleteDateRange;

  // Debounce filter changes so a user adjusting both date pickers in
  // quick succession only fires one backend search.
  useEffect(() => {
    if (!hasServerFilter) return;
    const handle = setTimeout(() => {
      const filters = {};
      if (filterVehicle !== 'all') filters.vehicleUid = filterVehicle;
      if (hasCompleteDateRange) {
        filters.fromDate = filterFromDate;
        filters.toDate = filterToDate;
      }
      searchSales(filters);
    }, 250);
    return () => clearTimeout(handle);
  }, [hasServerFilter, hasCompleteDateRange, filterVehicle, filterFromDate, filterToDate, searchSales]);

  const openDetails = async (saleUid) => {
    setDetailSale({ sale_uid: saleUid });
    setDetailLoading(true);
    setDetailError('');
    try {
      const full = await getSale(saleUid);
      setDetailSale(full);
    } catch (e) {
      console.error('getSale:', e);
      setDetailError('Could not load sale details. Try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailSale(null);
    setDetailError('');
    setDetailLoading(false);
  };

  const scrollContainerRef = useRef(null);
  const sentinelRef = useInfiniteScroll({
    hasMore: salesHasMore,
    isLoading: isLoadingSales,
    onLoadMore: fetchSales,
    root: scrollContainerRef,
  });

  // Free-text search runs client-side over the loaded page; vehicle/date
  // are already applied server-side via searchSales above.
  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (s.invoice_no || '').toLowerCase().includes(term) ||
      (s.shop_owner_name || '').toLowerCase().includes(term)
    );
  });

  const hasActiveFilter =
    !!searchTerm ||
    filterVehicle !== 'all' ||
    !!filterFromDate ||
    !!filterToDate;
  const showResults = hasServerFilter;
  const visibleSales = showResults ? filteredSales : [];

  const isPaid = (s) => (s.payment_status_text || '').toUpperCase() === 'PAID';
  const paidRevenue = visibleSales.reduce(
    (sum, s) => (isPaid(s) ? sum + Number(s.grand_total || 0) : sum),
    0,
  );
  const pendingRevenue = visibleSales.reduce(
    (sum, s) => (!isPaid(s) ? sum + Number(s.grand_total || 0) : sum),
    0,
  );
  const totalRevenue = paidRevenue + pendingRevenue;
  const totalOrders = visibleSales.length;
  const paidCount = visibleSales.filter(isPaid).length;
  const pendingCount = totalOrders - paidCount;

  const clearFilters = () => {
    setSearchTerm('');
    setFilterVehicle('all');
    setFilterFromDate('');
    setFilterToDate('');
  };

  return (
    <DeliwheelsLayout headerTitle="Sales" headerSubtitle="Track invoices and revenue">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Sales</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Track invoices, payments, and revenue.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <Card padding="lg" className="animate-in">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Total Revenue</p>
          <p style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {showResults ? (
              <>
                <IndianRupee size={20} /> {formatMoney(totalRevenue)}
              </>
            ) : (
              '—'
            )}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            {showResults ? `${totalOrders} invoice${totalOrders === 1 ? '' : 's'}` : ''}
          </p>
        </Card>
        <Card padding="lg" className="animate-in delay-100">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Paid</p>
          <p style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#059669', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {showResults ? (
              <>
                <IndianRupee size={20} /> {formatMoney(paidRevenue)}
              </>
            ) : (
              '—'
            )}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            {showResults ? `${paidCount} invoice${paidCount === 1 ? '' : 's'}` : ''}
          </p>
        </Card>
        <Card padding="lg" className="animate-in delay-200">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Pending</p>
          <p style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#b45309', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {showResults ? (
              <>
                <IndianRupee size={20} /> {formatMoney(pendingRevenue)}
              </>
            ) : (
              '—'
            )}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            {showResults ? `${pendingCount} invoice${pendingCount === 1 ? '' : 's'}` : ''}
          </p>
        </Card>
      </div>
      {showResults && salesHasMore && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '-12px', marginBottom: 'var(--spacing-md)', fontStyle: 'italic' }}>
          Stats reflect loaded results. Scroll the table to load more matching sales.
        </p>
      )}

      {/* Search & Filter (always visible) */}
      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--color-text-subtle)' }} />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Search & Filter</span>
          {hasActiveFilter && (
            <Badge variant="primary" style={{ fontSize: '0.7rem' }}>
              Active
            </Badge>
          )}
        </div>

        <div
          style={{
            marginTop: 'var(--spacing-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-md)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-subtle)',
              }}
            />
            <input
              type="text"
              placeholder="Search invoice or shop owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 36px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                outline: 'none',
                fontSize: 'var(--text-sm)',
              }}
            />
          </div>

          <SearchableSelect
            options={[
              { value: 'all', label: 'All Vehicles' },
              ...vehicles.map((v) => ({
                value: v.vehicle_uid,
                label: v.registration,
                sub: `${v.model}${v.driver ? ` (${v.driver})` : ''}`,
              })),
            ]}
            value={filterVehicle}
            onChange={setFilterVehicle}
            placeholder="All Vehicles"
            noResultsText="No vehicles found"
          />

          <input
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            placeholder="From date"
            title="From date"
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: filterFromDate ? '600' : '400',
              color: filterFromDate ? 'var(--color-primary)' : 'inherit',
            }}
          />

          <input
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            placeholder="To date"
            title="To date"
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: filterToDate ? '600' : '400',
              color: filterToDate ? 'var(--color-primary)' : 'inherit',
            }}
          />

          {hasActiveFilter && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <X size={14} /> Clear filters
            </Button>
          )}
        </div>
      </Card>

      {/* Sales Table */}
      <Card padding="none">
        {!showResults ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--bg-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Filter size={24} style={{ color: 'var(--color-text-subtle)' }} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
              Pick a filter to load sales
            </h3>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.9rem', maxWidth: '420px' }}>
              Choose a <strong>vehicle</strong> or a <strong>date range</strong> above to load
              matching sales. Nothing is loaded by default.
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-body)' }}>
                  {['Invoice', 'Shop Owner', 'Vehicle', 'Grand Total (₹)', 'Date', 'Payment', 'Mode', ''].map((h, i) => (
                    <th key={h || `col-${i}`} style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-body)', padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.8rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', boxShadow: '0 1px 0 var(--border-subtle)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!salesLoaded && isLoadingSales && [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <Skeleton width={j === 2 ? '120px' : '70px'} height="16px" />
                      </td>
                    ))}
                  </tr>
                ))}

                {salesLoaded && visibleSales.map((sale) => (
                  <tr
                    key={sale.sale_uid}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: '600', fontSize: '0.85rem' }}>{sale.invoice_no}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{sale.shop_owner_name}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>{sale.vehicle_number}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', fontFamily: 'monospace' }}>₹{formatMoney(sale.grand_total)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-subtle)' }}>{formatSaleDate(sale.sale_date)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={paymentStatusVariant(sale.payment_status_text)}>
                        {sale.payment_status_text || '—'}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-subtle)' }}>{sale.payment_mode_text || '—'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        onClick={() => openDetails(sale.sale_uid)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        title="View sale details (read-only)"
                      >
                        <Eye size={14} /> View
                      </Button>
                    </td>
                  </tr>
                ))}

                {salesLoaded && !isLoadingSales && visibleSales.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>
                      No sales match the current filters.
                    </td>
                  </tr>
                )}

                <tr>
                  <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                    <div ref={sentinelRef} style={{ height: '1px' }} />
                    {isLoadingSales && sales.length > 0 && (
                      <InfiniteScrollLoader style={{ padding: '12px' }} />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Read-only Sale Details modal */}
      <Modal
        isOpen={!!detailSale}
        onClose={closeDetails}
        title={detailSale?.invoice_no ? `Invoice ${detailSale.invoice_no}` : 'Sale Details'}
        maxWidth="720px"
      >
        {detailLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton width="100%" height="20px" />
            <Skeleton width="80%" height="16px" />
            <Skeleton width="60%" height="16px" />
            <Skeleton width="100%" height="120px" />
          </div>
        ) : detailError ? (
          <div style={{ padding: '14px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontSize: '0.9rem' }}>
            {detailError}
          </div>
        ) : detailSale ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Read-only banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px',
              background: 'var(--bg-body)', border: '1px solid var(--border-subtle)',
              color: 'var(--color-text-subtle)', fontSize: '0.8rem',
            }}>
              <Lock size={14} /> Read-only view. Sales cannot be edited from this page.
            </div>

            {/* Header info grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              <InfoCell icon={<User size={14} />} label="Shop Owner" value={detailSale.shop_owner_name || '—'} />
              <InfoCell icon={<Receipt size={14} />} label="Contact" value={detailSale.shop_contact_number || '—'} />
              <InfoCell icon={<Truck size={14} />} label="Vehicle" value={detailSale.vehicle_number || '—'} mono />
              <InfoCell icon={<Calendar size={14} />} label="Sale Date" value={formatSaleDate(detailSale.sale_date)} />
            </div>

            {/* Payment summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Badge variant={paymentStatusVariant(detailSale.payment_status_text)}>
                {detailSale.payment_status_text || '—'}
              </Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
                Mode: <strong style={{ color: 'var(--color-text)' }}>{detailSale.payment_mode_text || '—'}</strong>
              </span>
            </div>

            {/* Line items */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-subtle)', marginBottom: '10px' }}>
                Products Sold ({detailSale.details?.length || 0})
              </h4>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-body)' }}>
                      {['Product', 'Qty', 'Unit ₹', 'Disc ₹', 'Tax ₹', 'Total ₹'].map((h) => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Product' ? 'left' : 'right', fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(detailSale.details || []).map((d) => (
                      <tr key={d.sale_detail_uid} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '600' }}>{d.product_name || '—'}</div>
                          {d.product_code && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontFamily: 'monospace' }}>{d.product_code}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>{d.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{formatMoney(d.unit_price)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{formatMoney(d.discount)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{formatMoney(d.tax_amount)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700' }}>{formatMoney(d.total_amount)}</td>
                      </tr>
                    ))}
                    {(!detailSale.details || detailSale.details.length === 0) && (
                      <tr>
                        <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-subtle)' }}>
                          No line items recorded for this sale.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <TotalRow label="Subtotal" value={detailSale.total_amount} />
              <TotalRow label="Discount" value={detailSale.discount_amount} negative />
              <TotalRow label="Tax" value={detailSale.tax_amount} />
              <TotalRow label="Grand Total" value={detailSale.grand_total} emphasized />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={closeDetails}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </DeliwheelsLayout>
  );
};

const InfoCell = ({ icon, label, value, mono }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', marginBottom: '4px' }}>
      {icon} {label}
    </div>
    <div style={{ fontWeight: '600', fontSize: '0.95rem', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
  </div>
);

const TotalRow = ({ label, value, negative, emphasized }) => (
  <div style={{
    display: 'flex',
    gap: '24px',
    width: '100%',
    maxWidth: '320px',
    justifyContent: 'space-between',
    fontSize: emphasized ? '1.05rem' : '0.9rem',
    fontWeight: emphasized ? '800' : '500',
    color: emphasized ? 'var(--color-text)' : 'var(--color-text-subtle)',
    paddingTop: emphasized ? '6px' : 0,
    borderTop: emphasized ? '1px dashed var(--border-subtle)' : 'none',
  }}>
    <span>{label}</span>
    <span style={{ fontFamily: 'monospace' }}>
      {negative ? '−' : ''}₹{formatMoney(value)}
    </span>
  </div>
);

export default SalesPage;

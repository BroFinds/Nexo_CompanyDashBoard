import React, { useState, useEffect } from 'react';
import NexoLayout from '../components/NexoLayout';
import Card from '@shared/components/ui/Card';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';
import Badge from '@shared/components/ui/Badge';
import Modal from '@shared/components/ui/Modal';
import Skeleton from '@shared/components/ui/Skeleton';
import { Plus, Search, Package, Tag, FileText, Scale } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

// Mock Metadata
const CATEGORIES = [
  { uid: 'cat-001', name: 'Electronics' },
  { uid: 'cat-002', name: 'Furniture' },
  { uid: 'cat-003', name: 'Raw Materials' }
];

const MEASUREMENTS = [
  { uid: 'mes-001', name: 'Pieces (pcs)' },
  { uid: 'mes-002', name: 'Kilograms (kg)' },
  { uid: 'mes-003', name: 'Liters (l)' }
];

const ProductsPage = () => {
  const { products, isLoadingProducts, fetchProducts, addProduct, updateProduct, deleteProduct } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch Data on Load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Form State
  const [formData, setFormData] = useState({
    product_uid: null,
    product_name: '',
    product_code: '',
    category_uid: '',
    measurement_value: '',
    measurement_uid: '',
    product_description: '',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      product_uid: null,
      product_name: '',
      product_code: '',
      category_uid: CATEGORIES[0].uid,
      measurement_value: '',
      measurement_uid: MEASUREMENTS[0].uid,
      product_description: '',
      is_active: true
    });
    setSaveError('');
    setIsEditMode(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      if (isEditMode && formData.product_uid) {
        await updateProduct({ ...formData, measurement_value: Number(formData.measurement_value) });
      } else {
        await addProduct({ ...formData, measurement_value: Number(formData.measurement_value) });
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (product) => {
      setFormData({
          product_uid: product.product_uid,
          product_name: product.product_name,
          product_code: product.product_code,
          category_uid: product.category_uid,
          measurement_value: product.measurement_value,
          measurement_uid: product.measurement_uid,
          product_description: product.product_description,
          is_active: product.is_active
      });
      setIsEditMode(true);
      setSelectedProduct(null);
      setConfirmingDelete(false);
      setIsAddModalOpen(true);
  };

  const handleDeleteProduct = async (uid) => {
    setDeleteError('');
    try {
      await deleteProduct(uid);
      setSelectedProduct(null);
      setConfirmingDelete(false);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete. Try again.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (uid) => CATEGORIES.find(c => c.uid === uid)?.name || uid;
  const getMeasurementName = (uid) => MEASUREMENTS.find(m => m.uid === uid)?.name || uid;

  return (
    <NexoLayout headerTitle="Products" headerSubtitle="Manage product catalog and specifications">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Products</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Manage product catalog and specifications.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 10px 10px 36px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-subtle)',
              outline: 'none',
              fontSize: 'var(--text-sm)'
            }}
          />
        </div>
      </Card>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
        
         {/* Loading Skeletons */}
         {isLoadingProducts && (
          <>
             {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} padding="lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Skeleton width="48px" height="48px" borderRadius="12px" />
                        <Skeleton width="60px" height="24px" borderRadius="12px" />
                    </div>
                    <Skeleton width="70%" height="24px" style={{ marginBottom: '8px' }} />
                    <Skeleton width="50%" height="16px"  style={{ marginBottom: '16px' }} />
                    <Skeleton width="30%" height="16px" />
                </Card>
             ))}
          </>
        )}

        {!isLoadingProducts && filteredProducts.map((product, index) => (
          <div key={product.product_uid} className={`animate-in delay-${(index % 3) * 100}`}>
            <Card hoverable padding="lg" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #ffedd5, #fdba74)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c2410c'
                }}>
                  <Package size={24} />
                </div>
                <Badge variant={product.is_active ? 'success' : 'neutral'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', lineHeight: 1.3 }}>{product.product_name}</h3>
              <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.85rem', marginBottom: 'var(--spacing-md)', fontFamily: 'monospace' }}>{product.product_code}</p>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
               <span>{getCategoryName(product.category_uid)}</span>
              </div>
            </Card>
          </div>
        ))}
        
        {!isLoadingProducts && filteredProducts.length === 0 && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>
                 No products found.
             </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={isEditMode ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSaveProduct}>
          <Input 
            id="prodName" label="Product Name" placeholder="e.g. Wireless Mouse" required 
            value={formData.product_name} onChange={(e) => setFormData({...formData, product_name: e.target.value})} 
          />
          <div className="modal-grid-2col" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <Input 
                id="prodCode" label="Product Code" placeholder="e.g. WMouse-01" required 
                value={formData.product_code} onChange={(e) => setFormData({...formData, product_code: e.target.value})}
            />
            <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                    className="form-input"
                    value={formData.category_uid}
                    onChange={(e) => setFormData({...formData, category_uid: e.target.value})}
                >
                    {CATEGORIES.map(cat => <option key={cat.uid} value={cat.uid}>{cat.name}</option>)}
                </select>
            </div>
          </div>

          <div className="modal-grid-2col" style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
             <Input 
                 id="measureVal" label="Measurement Value" type="number" step="0.01" required 
                 value={formData.measurement_value} onChange={(e) => setFormData({...formData, measurement_value: e.target.value})}
             />
             <div className="form-group">
                <label className="form-label">Unit</label>
                <select 
                    className="form-input"
                    value={formData.measurement_uid}
                    onChange={(e) => setFormData({...formData, measurement_uid: e.target.value})}
                >
                    {MEASUREMENTS.map(mes => <option key={mes.uid} value={mes.uid}>{mes.name}</option>)}
                </select>
             </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
                className="form-input" 
                style={{ height: '80px', paddingTop: '10px', resize: 'vertical' }}
                value={formData.product_description || ''} 
                onChange={(e) => setFormData({...formData, product_description: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
             <input 
                type="checkbox" 
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
             />
             <label htmlFor="isActive" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Is Active Product</label>
          </div>

          {saveError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{saveError}</p>
          )}
          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Product')}</Button>
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setConfirmingDelete(false); setDeleteError(''); }} title="Product Details">
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '16px', 
                background: 'linear-gradient(135deg, #ffedd5, #fdba74)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#c2410c'
              }}>
                <Package size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{selectedProduct.product_name}</h3>
                <p style={{ color: 'var(--color-text-subtle)', fontFamily: 'monospace' }}>{selectedProduct.product_code}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                  <Badge variant={selectedProduct.is_active ? 'success' : 'neutral'}>
                      {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </Badge>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

            {/* Stats */}
            <div className="modal-grid-2col" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <div>
                 <label className="form-label">Category</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Tag size={18} className="text-slate-400" />
                      <span style={{ fontWeight: '500' }}>{getCategoryName(selectedProduct.category_uid)}</span>
                  </div>
              </div>
              <div>
                 <label className="form-label">Measurement</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Scale size={18} className="text-slate-400" />
                      <span style={{ fontWeight: '500' }}>{selectedProduct.measurement_value} {getMeasurementName(selectedProduct.measurement_uid)}</span>
                  </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginTop: '4px', background: 'var(--bg-body)', padding: '10px', borderRadius: '8px' }}>
                      <FileText size={18} className="text-slate-400" style={{ marginTop: '2px' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-subtle)' }}>{selectedProduct.product_description || 'No description provided.'}</p>
                  </div>
              </div>
            </div>

            {deleteError && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{deleteError}</p>
            )}

            {/* Actions */}
            {!confirmingDelete ? (
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <Button fullWidth variant="primary" onClick={() => handleEditClick(selectedProduct)}>Edit Product</Button>
                <Button variant="danger" onClick={() => setConfirmingDelete(true)} style={{ padding: '0 20px' }}>Delete</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '600', margin: 0 }}>Remove "{selectedProduct.product_name}"? This cannot be undone.</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <Button fullWidth variant="secondary" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                  <Button fullWidth variant="danger" onClick={() => handleDeleteProduct(selectedProduct.product_uid)}>Confirm Delete</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </NexoLayout>
  );
};

export default ProductsPage;

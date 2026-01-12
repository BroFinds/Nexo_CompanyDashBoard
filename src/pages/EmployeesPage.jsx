import React, { useState, useEffect } from 'react';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import Skeleton from '@components/ui/Skeleton';
import { Plus, Search, Phone } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

const EmployeesPage = ({ currentView, onNavigate }) => {
  const { employees, isLoadingEmployees, fetchEmployees, addEmployee, updateEmployee } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch Data on Load
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '+91 ',
    pan_card: '',
    aadhaar: '',
    upi_id: '',
    gender: 'Male', // Default
    date_of_joining: '',
    is_active: true
  });
  
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
      const errors = {};
      
      // PAN: Strictly 10 characters
      if (formData.pan_card.length !== 10) {
          errors.pan_card = 'PAN must be strictly 10 characters';
      }

      // Aadhaar: Strictly 12 digits (assuming '2' was a typo for '12' based on standard)
      const aadhaarClean = formData.aadhaar.replace(/\s/g, '');
      if (!/^\d{12}$/.test(aadhaarClean)) {
          errors.aadhaar = 'Aadhaar must be 12 digits (numeric)';
      }

      // Mobile: Strictly Indian (+91 optional, 6-9 start, 10 digits)
      // Regex: Optional +91 or 91, space/dash optional, then 6-9 followed by 9 digits
      const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
      if (!phoneRegex.test(formData.contact_number)) {
          errors.contact_number = 'Invalid Indian mobile number';
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({ 
        name: '', 
        contact_number: '+91 ', 
        pan_card: '',
        aadhaar: '',
        upi_id: '',
        gender: 'Male', // Default
        date_of_joining: '',
        is_active: true 
    });
    setFormErrors({});
    setIsEditMode(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails

    if (isEditMode && selectedEmployee) {
        updateEmployee({ ...selectedEmployee, ...formData });
    } else {
        const newEmployee = {
            employee_uid: `emp-${Date.now()}`,
            company_uid: 'comp-mock',
            ...formData
        };
        addEmployee(newEmployee);
    }
    setIsAddModalOpen(false);
    resetForm();
    setSelectedEmployee(null);
  };

  const handleEditClick = (employee) => {
      setFormData({
          name: employee.name,
          contact_number: employee.contact_number,
          pan_card: employee.pan_card || '',
          aadhaar: employee.aadhaar || '',
          upi_id: employee.upi_id || '',
          gender: employee.gender || 'Male',
          date_of_joining: employee.date_of_joining ? new Date(employee.date_of_joining).toISOString().split('T')[0] : '', // Format for input date
          is_active: employee.is_active
      });
      setIsEditMode(true);
      setSelectedEmployee(null);
      setIsAddModalOpen(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.contact_number.includes(searchTerm)
  );

  return (
    <DashboardLayout currentView={currentView} onNavigate={onNavigate}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Employees</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Manage team access and contacts.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Employee
        </Button>
      </div>

      {/* Search */}
      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
          <input 
            type="text" 
            placeholder="Search employees..." 
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

      {/* Employee List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
        
        {/* Loading Skeletons */}
        {isLoadingEmployees && (
          <>
             {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} padding="lg">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <Skeleton width="48px" height="48px" borderRadius="50%" />
                        <Skeleton width="60px" height="24px" borderRadius="12px" />
                    </div>
                    <Skeleton width="70%" height="24px" style={{ marginBottom: '8px' }} />
                    <Skeleton width="50%" height="16px" />
                </Card>
             ))}
          </>
        )}

        {/* Real Data */}
        {!isLoadingEmployees && filteredEmployees.map((employee, index) => (
          <div key={employee.employee_uid} className={`animate-in delay-${(index % 3) * 100}`}>
            <Card hoverable padding="lg" onClick={() => setSelectedEmployee(employee)} style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)'
                }}>
                  {employee.name.charAt(0)}
                </div>
                <Badge variant={employee.is_active ? 'success' : 'neutral'}>
                   {employee.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>{employee.name}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
                <Phone size={14} style={{ marginRight: '6px' }} />
                <span>{employee.contact_number}</span>
              </div>
            </Card>
          </div>
        ))}

        {!isLoadingEmployees && filteredEmployees.length === 0 && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-subtle)' }}>
                 No employees found.
             </div>
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={isEditMode ? "Edit Employee" : "Add New Employee"}>
        <form onSubmit={handleSaveEmployee}>
          <Input 
            id="empName" label="Full Name" placeholder="e.g. John Doe" required 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <Input 
            id="empPhone" label="Contact Number" placeholder="+91 98765 43210" required 
            value={formData.contact_number} 
            onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+\s-]/g, ''); // Allow digits, +, space, -
                if (val.length <= 15) setFormData({...formData, contact_number: val});
            }}
            error={formErrors.contact_number}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <Input 
                id="empPan" label="PAN Card" placeholder="ABCDE1234F" 
                value={formData.pan_card} 
                onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Alphanumeric only
                    if (val.length <= 10) setFormData({...formData, pan_card: val});
                }}
                error={formErrors.pan_card}
              />
              <Input 
                id="empAadhaar" label="Aadhaar Number" placeholder="123456789012" 
                value={formData.aadhaar} 
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Digits only
                    if (val.length <= 12) setFormData({...formData, aadhaar: val});
                }}
                error={formErrors.aadhaar}
              />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <Input 
                id="empUpi" label="UPI ID" placeholder="user@bank" 
                value={formData.upi_id} onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
              />
              <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    className="form-input" 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                  </select>
              </div>
          </div>

          <Input 
              id="empDOJ" label="Date of Joining" type="date"
              value={formData.date_of_joining} onChange={(e) => setFormData({...formData, date_of_joining: e.target.value})}
          />
          
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
             <input 
                type="checkbox" 
                id="empActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
             />
             <label htmlFor="empActive" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Active Account</label>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>

      {/* Employee Detail Modal */}
      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Employee Profile">
        {selectedEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--color-primary), #818cf8)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: '700', color: 'white'
              }}>
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{selectedEmployee.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-subtle)', fontSize: '0.9rem' }}>
                    <Phone size={14} />
                    {selectedEmployee.contact_number}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                 <Badge variant={selectedEmployee.is_active ? 'success' : 'neutral'}>{selectedEmployee.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>PAN Card</p>
                    <p style={{ fontWeight: '600' }}>{selectedEmployee.pan_card || 'N/A'}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>Aadhaar</p>
                    <p style={{ fontWeight: '600' }}>{selectedEmployee.aadhaar || 'N/A'}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>UPI ID</p>
                    <p style={{ fontWeight: '600' }}>{selectedEmployee.upi_id || 'N/A'}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>Gender</p>
                    <p style={{ fontWeight: '600' }}>{selectedEmployee.gender || 'N/A'}</p>
                </div>
                 <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>Joining Date</p>
                    <p style={{ fontWeight: '600' }}>{selectedEmployee.date_of_joining ? new Date(selectedEmployee.date_of_joining).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

            {/* Actions */}
            <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth variant="primary" onClick={() => handleEditClick(selectedEmployee)}>Edit Profile</Button>
            </div>

          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
};

export default EmployeesPage;

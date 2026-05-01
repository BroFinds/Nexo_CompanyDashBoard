import React, { useEffect, useState } from 'react';
import DeliwheelsLayout from '../components/DeliwheelsLayout';
import Card from '@shared/components/ui/Card';
import Badge from '@shared/components/ui/Badge';
import Skeleton from '@shared/components/ui/Skeleton';
import Modal from '@shared/components/ui/Modal';
import { Search, Phone, IdCard } from 'lucide-react';
import { useDeliwheels } from '../context/DeliwheelsContext';

const EmployeesPage = () => {
  const { employees, isLoadingEmployees, fetchEmployees } = useDeliwheels();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'on_leave': return 'warning';
      case 'inactive': return 'danger';
      default: return 'neutral';
    }
  };

  const formatStatus = (status) => status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <DeliwheelsLayout headerTitle="Employees" headerSubtitle="Manage drivers and operations staff">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', letterSpacing: '-0.02em' }}>Employees</h2>
          <p style={{ color: 'var(--color-text-subtle)' }}>Drivers, dispatchers, and warehouse staff.</p>
        </div>
      </div>

      <Card padding="md" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }} />
          <input
            type="text" placeholder="Search by name or role..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: 'var(--text-sm)' }}
          />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {isLoadingEmployees && [1,2,3,4,5,6].map(i => (
          <Card key={i} padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Skeleton width="48px" height="48px" borderRadius="50%" />
              <Skeleton width="60px" height="24px" borderRadius="12px" />
            </div>
            <Skeleton width="70%" height="24px" style={{ marginBottom: '8px' }} />
            <Skeleton width="50%" height="16px" />
          </Card>
        ))}

        {!isLoadingEmployees && filteredEmployees.map((emp, index) => (
          <div key={emp.employee_uid} className={`animate-in delay-${(index % 3) * 100}`}>
            <Card hoverable padding="lg" onClick={() => setSelectedEmployee(emp)} style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--color-primary-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)'
                }}>
                  {emp.name.charAt(0)}
                </div>
                <Badge variant={getStatusVariant(emp.status)}>
                  {formatStatus(emp.status)}
                </Badge>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{emp.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', marginBottom: '8px' }}>{emp.role}</p>

              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
                <Phone size={14} style={{ marginRight: '6px' }} />
                <span>{emp.contact}</span>
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

      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Employee Profile">
        {selectedEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: '700', color: 'white'
              }}>
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{selectedEmployee.name}</h3>
                <p style={{ color: 'var(--color-text-subtle)' }}>{selectedEmployee.role}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge variant={getStatusVariant(selectedEmployee.status)}>{formatStatus(selectedEmployee.status)}</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
              {[
                { label: 'Contact', value: selectedEmployee.contact },
                { label: 'License', value: selectedEmployee.license },
                { label: 'Joined', value: selectedEmployee.joined },
                { label: 'Role', value: selectedEmployee.role },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.8rem', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontWeight: '600' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DeliwheelsLayout>
  );
};

export default EmployeesPage;

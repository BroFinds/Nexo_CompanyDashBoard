import React from 'react';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/ui/Card';
import { ArrowRight, Truck, Users, Warehouse, CreditCard } from 'lucide-react';

const DashboardPage = ({ currentView, onNavigate }) => {
  const apps = [
    { 
      id: 'deliwheels', 
      title: 'DeliWheels', 
      desc: 'Logistics & Delivery Operations', 
      status: 'Active',
      icon: Truck,
      color: 'bg-blue-100 text-blue-600' // using inline styles for now
    },
    { 
      id: 'employees', 
      title: 'Employee Management', 
      desc: 'HR & Payroll Systems', 
      status: 'Active',
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      id: 'products', 
      title: 'Products', 
      desc: 'Inventory & Product Catalog', 
      status: 'Active',
      icon: Warehouse,
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      id: 'pos', 
      title: 'POS Billing', 
      desc: 'Retail Point of Sale', 
      status: 'Maintenance',
      icon: CreditCard,
      color: 'bg-emerald-100 text-emerald-600'
    }
  ];

  return (
    <DashboardLayout currentView={currentView} onNavigate={onNavigate}>
      <div className="dashboard-grid">
        {apps.map((app, index) => {
          const Icon = app.icon;
          // Staggered animation delay
          const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300';
          
          return (
            <div key={app.id} className={`animate-in ${delayClass}`}>
              <Card 
                hoverable 
                padding="lg"
                style={{ 
                  cursor: 'pointer', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                {/* Header Row */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'var(--bg-body)', // fallback
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid white'
                  }}>
                    <Icon size={24} />
                  </div>
                  
                  {app.status === 'Active' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-subtle)' }}>ONLINE</span>
                    </div>
                  )}
                  {app.status !== 'Active' && (
                     <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-subtle)', padding: '2px 8px', backgroundColor: 'var(--bg-body)', borderRadius: '12px' }}>{app.status}</span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  {app.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-subtle)', lineHeight: '1.5', flex: 1 }}>
                  {app.desc}
                </p>
                
                {/* Action Footer */}
                <div style={{ 
                  marginTop: 'var(--spacing-lg)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: 'var(--color-primary)'
                }}>
                  Launch App <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

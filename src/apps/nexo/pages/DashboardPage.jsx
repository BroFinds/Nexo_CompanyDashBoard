import React from 'react';
import NexoLayout from '../components/NexoLayout';
import Card from '@shared/components/ui/Card';
import { ArrowRight, Truck, Users, Warehouse, CreditCard, Lock } from 'lucide-react';

const DashboardPage = () => {
  const apps = [
    { 
      id: 'deliwheels', 
      title: 'DeliWheels', 
      desc: 'Logistics & Delivery Operations', 
      status: 'Active',
      icon: Truck,
    },
    { 
      id: 'employees', 
      title: 'Employee Management', 
      desc: 'HR & Payroll Systems', 
      status: 'Locked',
      icon: Users,
      locked: true,
    },
    { 
      id: 'products', 
      title: 'Products', 
      desc: 'Inventory & Product Catalog', 
      status: 'Locked',
      icon: Warehouse,
      locked: true,
    },
    { 
      id: 'pos', 
      title: 'POS Billing', 
      desc: 'Retail Point of Sale', 
      status: 'Locked',
      icon: CreditCard,
      locked: true,
    }
  ];

  const handleLaunchApp = (app) => {
    if (app.locked) return;
    if (app.id === 'deliwheels') {
      window.open('/deliwheels', '_blank');
    }
  };

  return (
    <NexoLayout headerTitle="Dashboard" headerSubtitle="Overview of company operations">
      <div className="dashboard-grid">
        {apps.map((app, index) => {
          const Icon = app.icon;
          const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300';
          
          return (
            <div key={app.id} className={`animate-in ${delayClass}`}>
              <Card 
                hoverable={!app.locked} 
                padding="lg"
                style={{ 
                  cursor: app.locked ? 'not-allowed' : 'pointer', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleLaunchApp(app)}
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
                    backgroundColor: 'var(--bg-body)',
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
                  {app.locked ? 'Locked' : 'Launch App'} <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </div>

                {/* Lock Overlay */}
                {app.locked && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}>
                    <div style={{
                      backgroundColor: 'var(--bg-body, white)',
                      padding: '16px',
                      borderRadius: '50%',
                      boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
                      color: 'var(--color-text-subtle, #6b7280)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Lock size={32} />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </NexoLayout>
  );
};

export default DashboardPage;

import React from 'react';
import NexoLayout from '../components/NexoLayout';
import Card from '@shared/components/ui/Card';
import { ArrowRight, Lock } from 'lucide-react';
import { getSession } from '@/services/api';
import { useEnabledApps } from '@/shared/context/EnabledAppsContext';
import { ALL_APPS } from '../constants/apps';


const DashboardPage = () => {
  const session = getSession();
  const { enabledApps } = useEnabledApps();
  const companyName = session?.companyName || 'company';

  const apps = ALL_APPS.map((app) => ({
    ...app,
    locked: !enabledApps.includes(app.id),
  }));

  const openApp = (app) => {
    if (!app.locked) window.open(app.route, '_blank');
  };

  return (
    <NexoLayout
      headerTitle="Dashboard"
      headerSubtitle={`Overview of ${companyName} operations`}
    >
      <div className="nexo-apps-grid">
        {apps.map((app, index) => {
          const Icon = app.icon;
          const delayClass = index === 0 ? '' : `delay-${Math.min(index, 3) * 100}`;
          return (
            <div key={app.id} className={`animate-in ${delayClass}`}>
              <Card
                hoverable={!app.locked}
                padding="lg"
                role="button"
                tabIndex={app.locked ? -1 : 0}
                aria-disabled={app.locked}
                onClick={() => openApp(app)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openApp(app);
                  }
                }}
                style={{
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                  cursor: app.locked ? 'not-allowed' : 'pointer',
                  opacity: app.locked ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    backgroundColor: 'var(--bg-body)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: app.locked ? 'var(--color-text-subtle)' : 'var(--color-primary)',
                  }}>
                    {app.locked ? <Lock size={20} /> : <Icon size={24} />}
                  </div>
                  {!app.locked && (
                    <ArrowRight size={18} style={{ color: 'var(--color-primary)', marginTop: '4px' }} />
                  )}
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  {app.title}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
                  {app.locked ? 'Contact Nexo to enable' : app.desc}
                </p>
              </Card>
            </div>
          );
        })}
      </div>

      <style>{`
        .nexo-apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--spacing-lg);
        }
      `}</style>
    </NexoLayout>
  );
};

export default DashboardPage;

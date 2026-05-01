import React from 'react';
import { User, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, navItems = [], brand = { name: 'Nexo', letter: 'N' }, backLink }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      {/* Floating Panel Container */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--bg-sidebar)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%'
      }}>
        
        {/* Brand */}
        <div style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            background: 'var(--gradient-primary, linear-gradient(135deg, var(--color-primary), #818cf8))',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>{brand.letter}</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{brand.name}</h2>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 var(--spacing-md)', flex: 1 }}>
          <p style={{ 
             fontSize: '11px', 
             textTransform: 'uppercase', 
             color: 'var(--color-text-subtle)', 
             fontWeight: '700', 
             marginBottom: '10px',
             paddingLeft: '10px'
          }}>Menu</p>
          <ul style={{ listStyle: 'none' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path
                : (location.pathname === item.path || 
                   (item.path !== '/' && location.pathname.startsWith(item.path + '/')));
              
              return (
                <li key={item.id} style={{ marginBottom: '4px' }}>
                  <button 
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 768) onClose();
                    }}
                    style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-subtle)',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all var(--anim-fast)',
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}>
                    <Icon size={18} style={{ marginRight: '12px', color: isActive ? 'var(--color-primary)' : 'currentColor', opacity: isActive ? 1 : 0.7 }} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-body)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Back Link (e.g. Back to Nexo) */}
          {backLink && (
            <button
              onClick={() => window.location.href = backLink.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: '8px',
                border: '1px solid var(--border-subtle)', backgroundColor: 'white',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                color: 'var(--color-text-subtle)', width: '100%',
                transition: 'all var(--anim-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-subtle)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'var(--color-text-subtle)'; }}
            >
              <ArrowLeft size={14} />
              {backLink.label}
            </button>
          )}

          {/* User Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
               <User size={18} className="text-slate-600" />
             </div>
             <div style={{ flex: 1, minWidth: 0 }}>
               <p style={{ fontSize: '0.85rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin User</p>
               <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>Operations</p>
             </div>
             <button
               onClick={() => { localStorage.removeItem('nexo_session'); navigate('/login'); }}
               title="Sign out"
               style={{ border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.5, padding: '4px', borderRadius: '4px', transition: 'all var(--anim-fast)' }}
               onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ef4444'; }}
               onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'inherit'; }}
             >
               <LogOut size={16} />
             </button>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;

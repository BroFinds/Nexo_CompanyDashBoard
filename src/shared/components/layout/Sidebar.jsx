import React, { useEffect, useState } from 'react';
import { User, Settings, LogOut, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSession, logout } from '@/services/api';

const isItemActive = (item, pathname) =>
  item.exact
    ? pathname === item.path
    : pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'));

const NavItem = ({ item, active, onNavigate, nested = false }) => {
  const Icon = item.icon;
  return (
    <li style={{ marginBottom: '4px' }}>
      <button
        onClick={() => onNavigate(item.path)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: nested ? '8px 12px 8px 22px' : '10px 12px',
          borderRadius: '8px',
          backgroundColor: active ? 'var(--color-primary-subtle)' : 'transparent',
          color: active ? 'var(--color-primary)' : 'var(--color-text-subtle)',
          fontSize: '0.9rem',
          fontWeight: active ? '600' : '500',
          transition: 'all var(--anim-fast)',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
        <Icon size={18} style={{ marginRight: '12px', color: active ? 'var(--color-primary)' : 'currentColor', opacity: active ? 1 : 0.7 }} />
        {item.label}
      </button>
    </li>
  );
};

// An item with `children` is a collapsible group; it starts open when one of its pages is active
const NavGroup = ({ item, pathname, onNavigate }) => {
  const childActive = item.children.some((child) => isItemActive(child, pathname));
  const [open, setOpen] = useState(childActive);
  const Icon = item.icon;
  const Chevron = open ? ChevronDown : ChevronRight;

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  return (
    <li style={{ marginBottom: '4px' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: childActive ? 'var(--color-primary)' : 'var(--color-text-subtle)',
          fontSize: '0.9rem',
          fontWeight: childActive ? '600' : '500',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}>
        <Icon size={18} style={{ marginRight: '12px', opacity: childActive ? 1 : 0.7 }} />
        <span style={{ flex: 1 }}>{item.label}</span>
        <Chevron size={16} style={{ opacity: 0.7 }} />
      </button>
      {open && (
        <ul style={{ listStyle: 'none', marginTop: '4px' }}>
          {item.children.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              active={isItemActive(child, pathname)}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ isOpen, onClose, navItems = [], brand = { name: 'Nexo', letter: 'N' }, backLink }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const displayName = session?.userName || session?.username || 'User';

  const go = (path) => {
    navigate(path);
    if (window.innerWidth < 768) onClose();
  };

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
            {navItems.map((item) =>
              item.children ? (
                <NavGroup
                  key={item.id}
                  item={item}
                  pathname={location.pathname}
                  onNavigate={go}
                />
              ) : (
                <NavItem
                  key={item.id}
                  item={item}
                  active={isItemActive(item, location.pathname)}
                  onNavigate={go}
                />
              ),
            )}
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
               <p style={{ fontSize: '0.85rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
               <p style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>Operations</p>
             </div>
             <button
               onClick={() => { void logout(); }}
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

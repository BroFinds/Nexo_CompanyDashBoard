import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.2)' };
      case 'warning':
        return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.2)' };
      case 'danger':
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.2)' };
      case 'neutral':
        return { backgroundColor: 'var(--bg-body)', color: 'var(--color-text-subtle)', boxShadow: 'inset 0 0 0 1px var(--border-subtle)' };
      default:
        return { backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' };
    }
  };

  return (
    <span 
      className={className} 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...getVariantStyle()
      }}
    >
      {children}
    </span>
  );
};

export default Badge;

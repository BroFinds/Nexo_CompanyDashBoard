import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-body)',
      padding: 'var(--spacing-md)'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-enter">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

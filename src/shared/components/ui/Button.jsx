import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseClass = `btn btn-${variant}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  
  return (
    <button 
      className={`${baseClass} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

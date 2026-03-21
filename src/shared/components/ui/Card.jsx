import React from 'react';

const Card = ({ children, className = '', hoverable = false, padding = 'md', ...props }) => {
  const hoverClass = hoverable ? 'card-hover' : '';
  const paddingClass = `card-padding-${padding}`;
  
  return (
    <div className={`card ${hoverClass} ${paddingClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

const Skeleton = ({ width, height, borderRadius = '4px', className = '', style = {} }) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        backgroundColor: 'var(--bg-surface)',
        backgroundImage: 'linear-gradient(90deg, var(--bg-surface) 0%, #f1f5f9 50%, var(--bg-surface) 100%)',
        backgroundSize: '200% 100%',
        ...style
      }}
    />
  );
};

export default Skeleton;

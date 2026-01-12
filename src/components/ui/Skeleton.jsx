import React from 'react';

const Skeleton = ({ width, height, borderRadius = '4px', className = '', style = {} }) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        backgroundColor: 'var(--bg-surface)', // Base color
        backgroundImage: 'linear-gradient(90deg, var(--bg-surface) 0%, #f1f5f9 50%, var(--bg-surface) 100%)', // Shimmer gradient
        backgroundSize: '200% 100%',
        ...style
      }}
    />
  );
};

// Add styles locally or in index.css (I'll append to index.css shortly)
// For now, let's rely on the class I will add.

export default Skeleton;

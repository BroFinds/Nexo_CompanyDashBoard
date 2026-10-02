import React from 'react';

const Input = ({ label, id, type = 'text', error, suffix, ...props }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <div className="input-wrapper" style={{ position: 'relative' }}>
        {props.icon && <div className="input-icon">{props.icon}</div>}
        <input
            id={id}
            type={type}
            className={`form-input ${props.icon ? 'has-icon' : ''}`}
            style={suffix ? { paddingRight: '40px' } : undefined}
            {...props}
        />
        {suffix && (
          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;

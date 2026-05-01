import React from 'react';

const Input = ({ label, id, type = 'text', error, ...props }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <div className="input-wrapper">
        {props.icon && <div className="input-icon">{props.icon}</div>}
        <input
            id={id}
            type={type}
            className={`form-input ${props.icon ? 'has-icon' : ''}`}
            {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;

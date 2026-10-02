import React from "react";

export const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`novo-card novo-card--section ${className}`.trim()}>
    {(title || subtitle || action) && (
      <div className="novo-section-head">
        <div>
          {title ? <h3 className="novo-section-title">{title}</h3> : null}
          {subtitle ? <p className="novo-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    )}
    {children}
  </section>
);

export const StatCard = ({ label, value, detail, icon: Icon }) => (
  <div className="novo-card novo-stat-card">
    <div className="novo-stat-header">
      {Icon ? <Icon size={16} /> : null}
      <span>{label}</span>
    </div>
    <div className="novo-stat-value">{value}</div>
    {detail ? <p>{detail}</p> : null}
  </div>
);

export const EmptyState = ({ title, description, action }) => (
  <div className="novo-empty-state">
    <h4>{title}</h4>
    <p>{description}</p>
    {action ? <div className="novo-actions">{action}</div> : null}
  </div>
);

import React from "react";
import Card from "./Card";

// List-item card: leading icon/avatar, title + subtitle, status badge, optional
// body, and a footer of label/value facts.
const EntityCard = ({ leading, title, titleMono = false, subtitle, badge, meta = [], muted = false, onClick, children }) => (
  <Card
    hoverable
    padding="md"
    onClick={onClick}
    style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", opacity: muted ? 0.75 : 1 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: "0.98rem",
            fontWeight: 700,
            lineHeight: 1.25,
            margin: 0,
            fontFamily: titleMono ? "monospace" : undefined,
            color: muted ? "var(--color-text-subtle)" : "var(--color-text-main)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-subtle)",
              margin: "2px 0 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
    </div>

    {children}

    <div style={{ flex: 1 }} />

    {meta.length > 0 && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${meta.length}, minmax(0, 1fr))`,
          gap: "12px",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "12px",
          paddingTop: "10px",
        }}
      >
        {meta.map((m) => (
          <div key={m.label} style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-text-subtle)",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-text-main)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={typeof m.value === "string" ? m.value : undefined}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

export const EntityIcon = ({ children, background, color, round = false }) => (
  <div
    style={{
      width: "40px",
      height: "40px",
      borderRadius: round ? "50%" : "10px",
      background,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: "0.9rem",
      fontWeight: 700,
    }}
  >
    {children}
  </div>
);

export default EntityCard;

import React from "react";
import Card from "@shared/components/ui/Card";

export const formatINRShort = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

export const EmptyChart = ({
  height = 180,
  message = "No data in selected range",
}) => (
  <div
    style={{
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--color-text-subtle)",
      fontSize: "0.85rem",
      border: "1px dashed var(--color-border, #e5e7eb)",
      borderRadius: 8,
    }}
  >
    {message}
  </div>
);

export const AreaChart = ({
  points,
  height = 200,
  color = "var(--color-primary, #6366f1)",
  formatY = formatINRShort,
}) => {
  if (!points || !points.length) return <EmptyChart height={height} />;
  const max = Math.max(...points.map((p) => p.value), 1);
  const n = points.length;

  const labelStep = n <= 10 ? 1 : n <= 20 ? 2 : n <= 40 ? 4 : Math.ceil(n / 8);
  const maxIdx = points.reduce(
    (best, p, i) => (p.value > points[best].value ? i : best),
    0,
  );
  const isLocalPeak = (i) => {
    if (points[i].value <= 0) return false;
    const left = i > 0 ? points[i - 1].value : -Infinity;
    const right = i < n - 1 ? points[i + 1].value : -Infinity;
    return points[i].value > left && points[i].value > right;
  };

  const yAxisWidth = 52;
  const xAxisHeight = 28;
  const innerHeight = height - xAxisHeight;

  const VW = 1000,
    VH = 100;
  const xCoord = (i) => (n > 1 ? (i / (n - 1)) * VW : VW / 2);
  const yCoord = (v) => VH - (v / max) * VH;
  const coords = points.map((p, i) => ({ x: xCoord(i), y: yCoord(p.value) }));
  const linePath = coords
    .map((c, i) => `${i ? "L" : "M"}${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${coords[n - 1].x.toFixed(2)} ${VH} L${coords[0].x.toFixed(2)} ${VH} Z`;
  const gradId = `areaGrad-${Math.random().toString(36).slice(2, 8)}`;
  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div
      style={{
        position: "relative",
        height,
        paddingLeft: yAxisWidth,
        paddingBottom: xAxisHeight,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: yAxisWidth,
          height: innerHeight,
        }}
      >
        {yTicks.map((f) => (
          <div
            key={f}
            style={{
              position: "absolute",
              right: 8,
              top: `${(1 - f) * 100}%`,
              transform: "translateY(-50%)",
              fontSize: "0.7rem",
              color: "var(--color-text-subtle)",
              fontWeight: 500,
            }}
          >
            {formatY(max * f)}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", height: innerHeight }}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          height={innerHeight}
          preserveAspectRatio="none"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((f) => (
            <line
              key={f}
              x1={0}
              x2={VW}
              y1={VH * (1 - f)}
              y2={VH * (1 - f)}
              stroke="var(--color-border, #e5e7eb)"
              strokeDasharray="2 4"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {points.map((p, i) => {
          const leftPct = n > 1 ? (i / (n - 1)) * 100 : 50;
          const topPct = (1 - p.value / max) * 100;
          const showLabel =
            (i % labelStep === 0 ||
              i === n - 1 ||
              i === maxIdx ||
              isLocalPeak(i)) &&
            p.value > 0;
          return (
            <React.Fragment key={i}>
              <div
                title={`${p.label}: ${formatY(p.value)}`}
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: 8,
                  height: 8,
                  marginLeft: -4,
                  marginTop: -4,
                  background: color,
                  borderRadius: "50%",
                  border: "2px solid var(--color-surface, #fff)",
                  boxSizing: "border-box",
                }}
              />
              {showLabel && (
                <div
                  style={{
                    position: "absolute",
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: "translate(-50%, calc(-100% - 8px))",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    background: "var(--color-surface, white)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  }}
                >
                  {formatY(p.value)}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: yAxisWidth,
          right: 0,
          bottom: 0,
          height: xAxisHeight,
        }}
      >
        {points.map((p, i) => {
          const leftPct = n > 1 ? (i / (n - 1)) * 100 : 50;
          if (!(i % labelStep === 0 || i === n - 1)) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: 6,
                transform: "translateX(-50%)",
                fontSize: "0.7rem",
                color: "var(--color-text-subtle)",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Donut = ({
  segments,
  size = 180,
  thickness = 28,
  centerLabel = "Total",
}) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  if (!total)
    return (
      <div
        style={{
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-subtle)",
          fontSize: "0.85rem",
        }}
      >
        No data
      </div>
    );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--bg-body, #f3f4f6)"
        strokeWidth={thickness}
      />
      {segments.map((seg, i) => {
        const length = (seg.value / total) * c;
        const dasharray = `${length} ${c - length}`;
        const dashoffset = -offset;
        offset += length;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          >
            <title>{`${seg.label}: ${seg.value}`}</title>
          </circle>
        );
      })}
      <text
        x={size / 2}
        y={size / 2 - 4}
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill="var(--color-text, #111)"
      >
        {total.toLocaleString("en-IN")}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 14}
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-text-subtle, #6b7280)"
      >
        {centerLabel}
      </text>
    </svg>
  );
};

export const VBarChart = ({
  bars,
  height = 180,
  formatBar = formatINRShort,
}) => {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height,
        padding: "8px 0",
      }}
    >
      {bars.map((b, i) => {
        const h = Math.max((b.value / max) * (height - 36), 2);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-subtle)",
                fontWeight: 600,
              }}
            >
              {b.value > 0 ? formatBar(b.value) : ""}
            </div>
            <div
              style={{
                width: "100%",
                height: `${h}px`,
                background: b.color || "var(--color-primary, #6366f1)",
                borderRadius: "6px 6px 0 0",
                transition: "height 0.6s ease",
              }}
              title={`${b.label}: ${formatBar(b.value)}`}
            />
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--color-text-subtle)",
                fontWeight: 500,
              }}
            >
              {b.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const KPICard = ({ label, value, icon: Icon, color, bg }) => {
  return (
    <Card padding="lg" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: bg,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} />
        </div>
      </div>
      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--color-text-subtle)",
          fontWeight: 500,
        }}
      >
        {label}
      </p>
    </Card>
  );
};

export const SectionCard = ({
  title,
  subtitle,
  right,
  children,
  padding = "lg",
}) => (
  <Card padding={padding} style={{ height: "100%" }}>
    {(title || right) && (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: subtitle ? 4 : "var(--spacing-md)",
          gap: 12,
        }}
      >
        <div>
          {title && (
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-subtle)",
                margin: "2px 0 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    )}
    {subtitle && <div style={{ height: "var(--spacing-md)" }} />}
    {children}
  </Card>
);

export const RankedList = ({
  items,
  valueKey = "revenue",
  metaKey = "orders",
  metaSuffix = "orders",
  barColor = "var(--color-primary)",
  formatValue = formatINRShort,
}) => {
  if (!items || !items.length)
    return (
      <p style={{ color: "var(--color-text-subtle)", fontSize: "0.85rem" }}>
        No data
      </p>
    );
  const max = items[0][valueKey] || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it, i) => {
        const w = Math.max((it[valueKey] / max) * 100, 4);
        return (
          <div key={it.key || it.name || i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 18,
                    color: "var(--color-text-subtle)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  #{i + 1}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.name}
                </span>
              </span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                {formatValue(it[valueKey])}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "var(--bg-body)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${w}%`,
                    background: barColor,
                    borderRadius: 3,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              {it[metaKey] != null && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-text-subtle)",
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {it[metaKey]} {metaSuffix}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

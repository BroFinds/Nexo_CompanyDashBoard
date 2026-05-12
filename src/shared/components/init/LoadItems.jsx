import React, { useEffect, useState } from "react";

// Generic boot gate: callers compute `ready` from whatever workspace data
// they need hydrated (products, vehicles, etc.) and trigger their own fetches.
// While `ready` is false, an Initializing splash blocks children so they
// never see a partial list.
const LoadItems = ({ ready, children }) => {
  if (!ready) {
    return <InitializingSplash />;
  }
  return children;
};

const STATUS_MESSAGES = ["Loading...."];

const InitializingSplash = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "36px",
        background: "var(--bg-body)",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      <div className="loaditems-stage">
        <svg
          className="loaditems-arc loaditems-arc-1"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(99,102,241,0.12)"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="url(#arcGrad1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="60 520"
          />
          <defs>
            <linearGradient id="arcGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="loaditems-arc loaditems-arc-2"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="74"
            fill="none"
            stroke="rgba(168,85,247,0.10)"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="74"
            fill="none"
            stroke="rgba(168,85,247,0.55)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="32 432"
          />
        </svg>

        <div className="loaditems-card">
          <div className="loaditems-card-head">
            <span className="loaditems-card-dot" />
            <span className="loaditems-card-line loaditems-card-line-1" />
            <span className="loaditems-card-line loaditems-card-line-2" />
          </div>

          <svg
            className="loaditems-chart"
            viewBox="0 0 120 70"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* gridlines */}
            <line
              x1="0"
              y1="20"
              x2="120"
              y2="20"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <line
              x1="0"
              y1="40"
              x2="120"
              y2="40"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            <line
              x1="0"
              y1="60"
              x2="120"
              y2="60"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />

            {/* bars */}
            <g className="loaditems-bargroup">
              <rect
                className="loaditems-bar loaditems-bar-1"
                x="10"
                y="40"
                width="10"
                height="25"
                rx="2"
              />
              <rect
                className="loaditems-bar loaditems-bar-2"
                x="28"
                y="28"
                width="10"
                height="37"
                rx="2"
              />
              <rect
                className="loaditems-bar loaditems-bar-3"
                x="46"
                y="34"
                width="10"
                height="31"
                rx="2"
              />
              <rect
                className="loaditems-bar loaditems-bar-4"
                x="64"
                y="20"
                width="10"
                height="45"
                rx="2"
              />
              <rect
                className="loaditems-bar loaditems-bar-5"
                x="82"
                y="26"
                width="10"
                height="39"
                rx="2"
              />
              <rect
                className="loaditems-bar loaditems-bar-6"
                x="100"
                y="14"
                width="10"
                height="51"
                rx="2"
              />
            </g>

            {/* trend line */}
            <polyline
              className="loaditems-trend"
              points="15,38 33,26 51,30 69,16 87,22 105,10"
              fill="none"
              stroke="url(#trendGrad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* trend points */}
            <circle
              className="loaditems-point loaditems-point-1"
              cx="15"
              cy="38"
              r="1.6"
            />
            <circle
              className="loaditems-point loaditems-point-2"
              cx="33"
              cy="26"
              r="1.6"
            />
            <circle
              className="loaditems-point loaditems-point-3"
              cx="51"
              cy="30"
              r="1.6"
            />
            <circle
              className="loaditems-point loaditems-point-4"
              cx="69"
              cy="16"
              r="1.6"
            />
            <circle
              className="loaditems-point loaditems-point-5"
              cx="87"
              cy="22"
              r="1.6"
            />
            <circle
              className="loaditems-point loaditems-point-6"
              cx="105"
              cy="10"
              r="1.6"
            />

            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          <span className="loaditems-sweep" />
        </div>
      </div>

      <div className="loaditems-progress">
        <span className="loaditems-progress-fill" />
      </div>

      <div className="loaditems-text">
        <p className="loaditems-title">Initializing your workspace</p>
        <div className="loaditems-status">
          <span className="loaditems-status-dot" />
          <span key={msgIdx} className="loaditems-status-text">
            {STATUS_MESSAGES[msgIdx]}
          </span>
        </div>
      </div>

      <style>{`
        .loaditems-stage {
          position: relative;
          width: 240px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loaditems-arc {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .loaditems-arc-1 {
          animation: loaditems-spin 6s linear infinite;
        }
        .loaditems-arc-2 {
          animation: loaditems-spin-rev 4.5s linear infinite;
        }

        .loaditems-card {
          position: relative;
          width: 168px;
          height: 124px;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.95) 0%,
            rgba(248,250,252,0.95) 100%
          );
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 12px;
          padding: 12px 14px 10px;
          box-shadow:
            0 20px 40px -20px rgba(99,102,241,0.35),
            0 4px 10px -4px rgba(15,23,42,0.08),
            0 0 0 1px rgba(255,255,255,0.6) inset;
          overflow: hidden;
          backdrop-filter: blur(8px);
          z-index: 2;
        }

        .loaditems-card-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .loaditems-card-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), #a855f7);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          flex-shrink: 0;
        }
        .loaditems-card-line {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(
            90deg,
            rgba(148,163,184,0.25) 0%,
            rgba(148,163,184,0.45) 50%,
            rgba(148,163,184,0.25) 100%
          );
          background-size: 200% 100%;
          animation: loaditems-shimmer 1.6s ease-in-out infinite;
        }
        .loaditems-card-line-1 { width: 56px; }
        .loaditems-card-line-2 {
          width: 32px;
          opacity: 0.6;
          animation-delay: 0.2s;
        }

        .loaditems-chart {
          width: 100%;
          height: 78px;
          display: block;
        }

        .loaditems-bar {
          fill: url(#trendGrad);
          opacity: 0.85;
          transform-origin: 50% 100%;
          animation: loaditems-bar-grow 2.4s ease-in-out infinite;
        }
        .loaditems-bar-1 { animation-delay: 0.00s; }
        .loaditems-bar-2 { animation-delay: 0.10s; }
        .loaditems-bar-3 { animation-delay: 0.20s; }
        .loaditems-bar-4 { animation-delay: 0.30s; }
        .loaditems-bar-5 { animation-delay: 0.40s; }
        .loaditems-bar-6 { animation-delay: 0.50s; }

        .loaditems-trend {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: loaditems-draw 2.4s ease-in-out infinite;
        }

        .loaditems-point {
          fill: #a855f7;
          opacity: 0;
          animation: loaditems-pop 2.4s ease-in-out infinite;
        }
        .loaditems-point-1 { animation-delay: 0.30s; }
        .loaditems-point-2 { animation-delay: 0.55s; }
        .loaditems-point-3 { animation-delay: 0.80s; }
        .loaditems-point-4 { animation-delay: 1.05s; }
        .loaditems-point-5 { animation-delay: 1.30s; }
        .loaditems-point-6 { animation-delay: 1.55s; }

        .loaditems-sweep {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60%;
          left: -60%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(99,102,241,0.10) 50%,
            transparent 100%
          );
          animation: loaditems-sweep 2.4s ease-in-out infinite;
          pointer-events: none;
        }

        .loaditems-progress {
          width: 220px;
          height: 3px;
          border-radius: 999px;
          background: rgba(99,102,241,0.10);
          overflow: hidden;
          position: relative;
        }
        .loaditems-progress-fill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -40%;
          width: 40%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--color-primary) 30%,
            #a855f7 70%,
            transparent 100%
          );
          animation: loaditems-progress 1.8s ease-in-out infinite;
        }

        .loaditems-text {
          text-align: center;
          min-height: 48px;
        }
        .loaditems-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-main);
          margin: 0 0 8px;
          letter-spacing: 0.1px;
        }
        .loaditems-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
        }
        .loaditems-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 0 0 rgba(99,102,241,0.6);
          animation: loaditems-pulse 1.6s ease-in-out infinite;
        }
        .loaditems-status-text {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--color-text-subtle);
          letter-spacing: 0.2px;
          font-variant-numeric: tabular-nums;
          animation: loaditems-fade 0.4s ease-out;
        }

        @keyframes loaditems-spin     { to { transform: rotate(360deg); } }
        @keyframes loaditems-spin-rev { to { transform: rotate(-360deg); } }

        @keyframes loaditems-bar-grow {
          0%, 100% { transform: scaleY(0.4); opacity: 0.55; }
          40%, 70% { transform: scaleY(1);   opacity: 0.95; }
        }

        @keyframes loaditems-draw {
          0%        { stroke-dashoffset: 140; }
          50%, 100% { stroke-dashoffset: 0; }
        }

        @keyframes loaditems-pop {
          0%, 20%   { opacity: 0; transform: scale(0.4); transform-box: fill-box; transform-origin: center; }
          40%, 90%  { opacity: 1; transform: scale(1);   transform-box: fill-box; transform-origin: center; }
          100%      { opacity: 0; transform: scale(0.4); transform-box: fill-box; transform-origin: center; }
        }

        @keyframes loaditems-sweep {
          0%   { left: -60%; }
          100% { left: 100%; }
        }

        @keyframes loaditems-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes loaditems-progress {
          0%   { left: -40%; }
          100% { left: 100%; }
        }

        @keyframes loaditems-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(99,102,241,0); }
        }

        @keyframes loaditems-fade {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoadItems;

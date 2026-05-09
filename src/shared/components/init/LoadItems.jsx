import React, { useEffect } from 'react';
import { useGlobal } from '@nexo/context/GlobalContext';

// Boots the user's session by ensuring the global product list is fully in
// memory (hydrated from localStorage cache or fetched once after login).
// While the list is still being paginated, an Initializing splash blocks the
// app so children never see a partial list. The gate is `productsHasMore`
// from context — that flag flips to false only when the last page returns.
const LoadItems = ({ children }) => {
  const { productsHasMore, fetchAllProducts } = useGlobal();

  useEffect(() => {
    if (productsHasMore) {
      // fetchAllProducts is in-flight-guarded, so multiple mounts are safe.
      fetchAllProducts();
    }
  }, [productsHasMore, fetchAllProducts]);

  if (productsHasMore) {
    return <InitializingSplash />;
  }
  return children;
};

const InitializingSplash = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '28px',
      background: 'var(--bg-body)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div className="loaditems-stage">
      <span className="loaditems-orbit loaditems-orbit-1" />
      <span className="loaditems-orbit loaditems-orbit-2" />
      <span className="loaditems-orbit loaditems-orbit-3" />

      <span className="loaditems-spark loaditems-spark-1" />
      <span className="loaditems-spark loaditems-spark-2" />
      <span className="loaditems-spark loaditems-spark-3" />
      <span className="loaditems-spark loaditems-spark-4" />

      <div className="loaditems-logo">
        <span className="loaditems-shine" />
        N
      </div>
    </div>

    <div className="loaditems-bars">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>

    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-text-main)',
          marginBottom: '4px',
          letterSpacing: '0.2px',
        }}
      >
        Initializing your workspace
      </p>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-subtle)',
        }}
      >
        Loading products
        <span className="loaditems-dot">.</span>
        <span className="loaditems-dot">.</span>
        <span className="loaditems-dot">.</span>
      </p>
    </div>

    <style>{`
      .loaditems-stage {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loaditems-logo {
        position: relative;
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: linear-gradient(135deg, var(--color-primary), #818cf8 60%, #a855f7);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 28px;
        box-shadow:
          0 10px 30px -8px rgba(99, 102, 241, 0.55),
          0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        animation: loaditems-float 3s ease-in-out infinite;
        overflow: hidden;
        z-index: 2;
      }

      .loaditems-shine {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          120deg,
          transparent 30%,
          rgba(255, 255, 255, 0.45) 50%,
          transparent 70%
        );
        transform: translateX(-100%);
        animation: loaditems-shine 2.4s ease-in-out infinite;
      }

      .loaditems-orbit {
        position: absolute;
        border-radius: 50%;
        border: 1.5px dashed rgba(99, 102, 241, 0.35);
        top: 50%;
        left: 50%;
      }
      .loaditems-orbit-1 {
        width: 96px;
        height: 96px;
        margin: -48px 0 0 -48px;
        animation: loaditems-spin 4s linear infinite;
      }
      .loaditems-orbit-2 {
        width: 118px;
        height: 118px;
        margin: -59px 0 0 -59px;
        border-color: rgba(168, 85, 247, 0.28);
        animation: loaditems-spin-rev 6s linear infinite;
      }
      .loaditems-orbit-3 {
        width: 140px;
        height: 140px;
        margin: -70px 0 0 -70px;
        border-style: solid;
        border-color: transparent;
        border-top-color: var(--color-primary);
        border-right-color: rgba(99, 102, 241, 0.4);
        animation: loaditems-spin 1.4s linear infinite;
      }

      .loaditems-spark {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-primary);
        box-shadow: 0 0 12px 2px rgba(99, 102, 241, 0.6);
        top: 50%;
        left: 50%;
      }
      .loaditems-spark-1 {
        animation: loaditems-orbit-a 2.8s linear infinite;
      }
      .loaditems-spark-2 {
        background: #a855f7;
        box-shadow: 0 0 12px 2px rgba(168, 85, 247, 0.6);
        animation: loaditems-orbit-b 3.6s linear infinite;
      }
      .loaditems-spark-3 {
        width: 6px;
        height: 6px;
        background: #818cf8;
        box-shadow: 0 0 10px 2px rgba(129, 140, 248, 0.6);
        animation: loaditems-orbit-c 2.2s linear infinite;
      }
      .loaditems-spark-4 {
        width: 5px;
        height: 5px;
        background: #c4b5fd;
        animation: loaditems-orbit-d 4.4s linear infinite;
      }

      .loaditems-bars {
        display: flex;
        gap: 6px;
        align-items: flex-end;
        height: 22px;
      }
      .loaditems-bars span {
        display: block;
        width: 5px;
        height: 100%;
        border-radius: 3px;
        background: linear-gradient(180deg, var(--color-primary), #a855f7);
        opacity: 0.85;
        transform-origin: bottom;
        animation: loaditems-bar 1s ease-in-out infinite;
      }
      .loaditems-bars span:nth-child(1) { animation-delay: 0s; }
      .loaditems-bars span:nth-child(2) { animation-delay: 0.12s; }
      .loaditems-bars span:nth-child(3) { animation-delay: 0.24s; }
      .loaditems-bars span:nth-child(4) { animation-delay: 0.36s; }
      .loaditems-bars span:nth-child(5) { animation-delay: 0.48s; }

      .loaditems-dot {
        opacity: 0;
        animation: loaditems-dot 1.4s ease-in-out infinite;
      }
      .loaditems-dot:nth-child(1) { animation-delay: 0s; }
      .loaditems-dot:nth-child(2) { animation-delay: 0.2s; }
      .loaditems-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes loaditems-spin { to { transform: rotate(360deg); } }
      @keyframes loaditems-spin-rev { to { transform: rotate(-360deg); } }

      @keyframes loaditems-float {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-6px) scale(1.04); }
      }

      @keyframes loaditems-shine {
        0% { transform: translateX(-120%); }
        60%, 100% { transform: translateX(120%); }
      }

      @keyframes loaditems-bar {
        0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
        50% { transform: scaleY(1); opacity: 1; }
      }

      @keyframes loaditems-dot {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }

      @keyframes loaditems-orbit-a {
        0%   { transform: rotate(0deg) translateX(48px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(48px) rotate(-360deg); }
      }
      @keyframes loaditems-orbit-b {
        0%   { transform: rotate(120deg) translateX(59px) rotate(-120deg); }
        100% { transform: rotate(480deg) translateX(59px) rotate(-480deg); }
      }
      @keyframes loaditems-orbit-c {
        0%   { transform: rotate(220deg) translateX(70px) rotate(-220deg); }
        100% { transform: rotate(-140deg) translateX(70px) rotate(140deg); }
      }
      @keyframes loaditems-orbit-d {
        0%   { transform: rotate(40deg) translateX(54px) rotate(-40deg); }
        100% { transform: rotate(400deg) translateX(54px) rotate(-400deg); }
      }
    `}</style>
  </div>
);

export default LoadItems;

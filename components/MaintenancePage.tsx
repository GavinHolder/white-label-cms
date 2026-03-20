"use client";

/**
 * Full-screen maintenance mode page.
 * Shown to all public visitors when maintenance_mode is enabled.
 * Admin routes (/admin, /api) bypass this entirely.
 */
export default function MaintenancePage() {
  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Stars background */}
      <div className="mm-stars" aria-hidden="true">
        {stars.map((s) => (
          <span key={s.id} className="mm-star" style={s.style} />
        ))}
      </div>

      {/* Construction scene */}
      <div className="mm-scene" aria-hidden="true">
        {/* Ground */}
        <div className="mm-ground" />

        {/* Dirt pile */}
        <div className="mm-dirt-pile" />

        {/* Worker */}
        <div className="mm-worker">
          {/* Hard hat */}
          <div className="mm-hat" />
          {/* Head */}
          <div className="mm-head">
            <div className="mm-eye mm-eye-left" />
            <div className="mm-eye mm-eye-right" />
          </div>
          {/* Body */}
          <div className="mm-body">
            {/* Vest stripe */}
            <div className="mm-vest-stripe" />
          </div>
          {/* Left arm (shovel arm) */}
          <div className="mm-arm mm-arm-left" />
          {/* Right arm */}
          <div className="mm-arm mm-arm-right" />
          {/* Legs */}
          <div className="mm-leg mm-leg-left" />
          <div className="mm-leg mm-leg-right" />
          {/* Boots */}
          <div className="mm-boot mm-boot-left" />
          <div className="mm-boot mm-boot-right" />
          {/* Shovel */}
          <div className="mm-shovel">
            <div className="mm-shovel-handle" />
            <div className="mm-shovel-blade" />
          </div>
        </div>

        {/* Dirt particles */}
        {particles.map((p) => (
          <div key={p.id} className="mm-particle" style={p.style} />
        ))}

        {/* Cone */}
        <div className="mm-cone" />

        {/* Barrier */}
        <div className="mm-barrier">
          <div className="mm-barrier-stripe mm-barrier-stripe-1" />
          <div className="mm-barrier-stripe mm-barrier-stripe-2" />
        </div>
      </div>

      {/* Text */}
      <div className="mm-text">
        <h1 className="mm-heading">Maintenance Mode</h1>
        <p className="mm-sub">Be back soon&hellip; making things awesome</p>
        <div className="mm-dots" aria-hidden="true">
          <span className="mm-dot" />
          <span className="mm-dot" />
          <span className="mm-dot" />
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f2a1e 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
    zIndex: 9999,
  },
};

const css = `
  /* Stars */
  .mm-stars { position:absolute; inset:0; pointer-events:none; }
  .mm-star  { position:absolute; border-radius:50%; background:#fff; opacity:0.6;
               animation: mm-twinkle 3s ease-in-out infinite alternate; }
  @keyframes mm-twinkle { from { opacity:0.2; transform:scale(0.8); }
                           to   { opacity:0.9; transform:scale(1.2); } }

  /* Scene container */
  .mm-scene {
    position: relative;
    width: 260px;
    height: 180px;
    margin-bottom: 12px;
  }

  /* Ground */
  .mm-ground {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 18px;
    background: linear-gradient(180deg, #78350f 0%, #92400e 100%);
    border-radius: 4px 4px 0 0;
  }

  /* Dirt pile */
  .mm-dirt-pile {
    position: absolute;
    bottom: 16px; left: 140px;
    width: 70px; height: 28px;
    background: radial-gradient(ellipse at 50% 80%, #92400e 0%, #78350f 100%);
    border-radius: 50% 50% 0 0;
  }

  /* Worker — digging animation */
  .mm-worker {
    position: absolute;
    bottom: 16px; left: 50px;
    width: 48px; height: 90px;
    animation: mm-dig 0.55s ease-in-out infinite alternate;
    transform-origin: center bottom;
  }
  @keyframes mm-dig {
    from { transform: rotate(-4deg); }
    to   { transform: rotate(4deg); }
  }

  /* Hard hat */
  .mm-hat {
    position: absolute;
    top: 0; left: 8px;
    width: 32px; height: 16px;
    background: #f97316;
    border-radius: 50% 50% 0 0;
    box-shadow: 0 2px 0 #ea580c;
  }
  .mm-hat::after {
    content: '';
    position: absolute;
    bottom: 0; left: -4px;
    width: 40px; height: 5px;
    background: #f97316;
    border-radius: 2px;
  }

  /* Head */
  .mm-head {
    position: absolute;
    top: 14px; left: 10px;
    width: 28px; height: 28px;
    background: #fde68a;
    border-radius: 50% 50% 45% 45%;
    border: 2px solid #f59e0b;
  }
  .mm-eye {
    position: absolute;
    top: 10px;
    width: 5px; height: 5px;
    background: #1e293b;
    border-radius: 50%;
  }
  .mm-eye-left  { left: 5px; }
  .mm-eye-right { right: 5px; }

  /* Body */
  .mm-body {
    position: absolute;
    top: 40px; left: 8px;
    width: 32px; height: 28px;
    background: #0ea5e9;
    border-radius: 4px 4px 2px 2px;
    border: 1px solid #0284c7;
    overflow: hidden;
  }
  .mm-vest-stripe {
    position: absolute;
    top: 4px; left: 50%;
    transform: translateX(-50%);
    width: 6px; height: 20px;
    background: #fde047;
    border-radius: 2px;
    opacity: 0.9;
  }

  /* Arms */
  .mm-arm {
    position: absolute;
    top: 44px;
    width: 10px; height: 22px;
    background: #0ea5e9;
    border: 1px solid #0284c7;
    border-radius: 5px;
  }
  .mm-arm-left {
    left: 0;
    transform-origin: top center;
    animation: mm-arm-l 0.55s ease-in-out infinite alternate;
  }
  .mm-arm-right {
    right: 0;
    transform-origin: top center;
    animation: mm-arm-r 0.55s ease-in-out infinite alternate;
  }
  @keyframes mm-arm-l {
    from { transform: rotate(-30deg); }
    to   { transform: rotate(30deg); }
  }
  @keyframes mm-arm-r {
    from { transform: rotate(20deg); }
    to   { transform: rotate(-20deg); }
  }

  /* Legs */
  .mm-leg {
    position: absolute;
    top: 66px;
    width: 13px; height: 18px;
    background: #1d4ed8;
    border: 1px solid #1e40af;
    border-radius: 3px;
  }
  .mm-leg-left  { left: 6px; }
  .mm-leg-right { right: 6px; }

  /* Boots */
  .mm-boot {
    position: absolute;
    top: 82px;
    width: 16px; height: 8px;
    background: #1c1917;
    border-radius: 2px 6px 2px 2px;
  }
  .mm-boot-left  { left: 4px; }
  .mm-boot-right { right: 4px; }

  /* Shovel */
  .mm-shovel {
    position: absolute;
    top: 30px; left: -22px;
    transform-origin: bottom right;
    animation: mm-shovel 0.55s ease-in-out infinite alternate;
  }
  @keyframes mm-shovel {
    from { transform: rotate(-15deg); }
    to   { transform: rotate(25deg); }
  }
  .mm-shovel-handle {
    width: 5px; height: 52px;
    background: linear-gradient(180deg, #a3a3a3 0%, #78716c 100%);
    border-radius: 3px;
    margin: 0 auto;
  }
  .mm-shovel-blade {
    width: 20px; height: 14px;
    background: #94a3b8;
    border-radius: 2px 2px 6px 6px;
    margin-left: -8px;
    border: 1px solid #64748b;
  }

  /* Dirt particles */
  .mm-particle {
    position: absolute;
    border-radius: 50%;
    background: #92400e;
    opacity: 0;
    animation: mm-fly 0.55s ease-out infinite;
  }
  @keyframes mm-fly {
    0%   { opacity: 0.8; transform: translate(0,0) scale(1); }
    100% { opacity: 0;   transform: translate(var(--dx), var(--dy)) scale(0.2); }
  }

  /* Traffic cone */
  .mm-cone {
    position: absolute;
    bottom: 16px; left: 200px;
    width: 0; height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 30px solid #f97316;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
  }
  .mm-cone::after {
    content: '';
    position: absolute;
    top: 18px; left: -14px;
    width: 28px; height: 5px;
    background: #fff;
    border-radius: 2px;
  }

  /* Barrier */
  .mm-barrier {
    position: absolute;
    bottom: 16px; left: 0px;
    width: 42px; height: 22px;
    background: #fbbf24;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid #f59e0b;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .mm-barrier-stripe {
    position: absolute;
    top: 0; bottom: 0;
    width: 10px;
    background: #1e293b;
    transform: skewX(-15deg);
  }
  .mm-barrier-stripe-1 { left: 6px; }
  .mm-barrier-stripe-2 { left: 24px; }

  /* Text block */
  .mm-text {
    text-align: center;
    z-index: 1;
    padding: 0 20px;
  }
  .mm-heading {
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    font-weight: 800;
    color: #f97316;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin: 0 0 10px;
    text-shadow: 0 2px 12px rgba(249,115,22,0.45);
  }
  .mm-sub {
    font-size: clamp(0.95rem, 2.5vw, 1.2rem);
    color: #cbd5e1;
    margin: 0 0 18px;
    font-style: italic;
  }

  /* Bouncing dots */
  .mm-dots { display: flex; gap: 8px; justify-content: center; }
  .mm-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #f97316;
    animation: mm-bounce 1.1s ease-in-out infinite;
  }
  .mm-dot:nth-child(1) { animation-delay: 0s; }
  .mm-dot:nth-child(2) { animation-delay: 0.18s; }
  .mm-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes mm-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40%           { transform: translateY(-10px); opacity: 1; }
  }
`;

/* ─── Static data (generated once) ──────────────────────────────────────── */

const stars = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  style: {
    width: `${1 + Math.random() * 2}px`,
    height: `${1 + Math.random() * 2}px`,
    top: `${Math.random() * 85}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
  } as React.CSSProperties,
}));

const particles = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  style: {
    width: `${4 + i * 2}px`,
    height: `${4 + i * 2}px`,
    bottom: "42px",
    left: `${110 + i * 8}px`,
    "--dx": `${-10 + i * 12}px`,
    "--dy": `${-(12 + i * 8)}px`,
    animationDelay: `${i * 0.11}s`,
  } as React.CSSProperties,
}));

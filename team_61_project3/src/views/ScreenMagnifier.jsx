import { useState, useRef, useCallback, useEffect } from "react";

/**
 * ScreenMagnifier
 *
 * Wraps any children with a lens-style magnifier that follows the cursor
 * (desktop) or touch point (touchscreen). Toggle on/off with the built-in
 * switch, or control it externally via the `enabled` / `onToggle` props.
 *
 * Props:
 *   lensSize      {number}  Diameter of the circular lens in px. Default: 160
 *   defaultZoom   {number}  Initial magnification factor. Default: 2.5
 *   minZoom       {number}  Minimum zoom on the slider. Default: 1.5
 *   maxZoom       {number}  Maximum zoom on the slider. Default: 5
 *   enabled       {boolean} Optional controlled mode. Omit to use internal state.
 *   onToggle      {fn}      Called with the new boolean when the switch is clicked.
 *   showToggle    {boolean} Whether to render the built-in toggle UI. Default: true
 *   className     {string}  Extra class on the outer wrapper.
 *   style         {object}  Extra style on the outer wrapper.
 */
export default function ScreenMagnifier({
  children,
  lensSize = 160,
  defaultZoom = 2.5,
  minZoom = 1.5,
  maxZoom = 5,
  enabled,
  onToggle,
  showToggle = true,
  className = "",
  style = {},
}) {
  const [internalEnabled, setInternalEnabled] = useState(false);
  const [zoom, setZoom] = useState(defaultZoom);
  const isControlled = enabled !== undefined;
  const active = isControlled ? enabled : internalEnabled;

  const containerRef = useRef(null);
  const lensRef = useRef(null);
  const cloneRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const handleToggle = () => {
    const next = !active;
    if (!isControlled) setInternalEnabled(next);
    onToggle?.(next);
  };

  const moveLens = useCallback(
    (clientX, clientY) => {
      if (!active || !containerRef.current || !lensRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const half = lensSize / 2;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        lensRef.current.style.opacity = "0";
        return;
      }

      posRef.current = { x, y };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const lens = lensRef.current;
        const clone = cloneRef.current;
        if (!lens || !clone) return;

        lens.style.opacity = "1";
        lens.style.left = `${x - half}px`;
        lens.style.top = `${y - half}px`;

        // Translate the clone so the cursor point lands at the lens center,
        // then scale from the lens top-left origin.
        const tx = -x * zoom + half;
        const ty = -y * zoom + half;
        clone.style.transform = `scale(${zoom}) translate(${tx / zoom}px, ${ty / zoom}px)`;
      });
    },
    [active, lensSize, zoom]
  );

  // Mouse events
  const onMouseMove = useCallback(
    (e) => moveLens(e.clientX, e.clientY),
    [moveLens]
  );
  const onMouseLeave = useCallback(() => {
    if (lensRef.current) lensRef.current.style.opacity = "0";
  }, []);

  // Touch events
  const onTouchMove = useCallback(
    (e) => {
      if (!active) return;
      // Don't call preventDefault here — let the component consumer decide
      const t = e.touches[0];
      moveLens(t.clientX, t.clientY);
    },
    [active, moveLens]
  );
  const onTouchStart = useCallback(
    (e) => {
      const t = e.touches[0];
      moveLens(t.clientX, t.clientY);
    },
    [moveLens]
  );
  const onTouchEnd = useCallback(() => {
    if (lensRef.current) lensRef.current.style.opacity = "0";
  }, []);

  // Hide lens when toggled off
  useEffect(() => {
    if (!active && lensRef.current) lensRef.current.style.opacity = "0";
  }, [active]);

  // Clean up any pending RAF on unmount
  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

  return (
    <div className={className} style={{ ...style }}>
      {showToggle && (
        <ControlPanel
          active={active}
          onToggle={handleToggle}
          zoom={zoom}
          onZoomChange={setZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
        />
      )}

      {/* Magnification target */}
      <div
        ref={containerRef}
        style={{ position: "relative", overflow: "hidden", cursor: active ? "crosshair" : "auto" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Original content — always visible */}
        {children}

        {/* Lens portal */}
        <div
          ref={lensRef}
          aria-hidden="true"
          style={{
            display: active ? "block" : "none",
            opacity: 0,
            position: "absolute",
            width: lensSize,
            height: lensSize,
            borderRadius: "50%",
            border: "2px solid rgba(0,0,0,0.15)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.5)",
            overflow: "hidden",
            pointerEvents: "none",
            transition: "opacity 0.12s ease",
            // Keep lens above other positioned children
            zIndex: 999,
          }}
        >
          {/* Magnified clone of the content */}
          <div
            ref={cloneRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Fixed top-left control panel ---------- */
function ControlPanel({ active, onToggle, zoom, onZoomChange, minZoom, maxZoom }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        userSelect: "none",
        minWidth: 180,
      }}
    >
      {/* Toggle row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          role="switch"
          aria-checked={active}
          onClick={onToggle}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            width: 44,
            height: 24,
            borderRadius: 12,
            border: "none",
            padding: 0,
            cursor: "pointer",
            background: active ? "#1D9E75" : "#ccc",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: active ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.18s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
            {active ? "Disable" : "Enable"} magnifier
          </span>
        </button>
        <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
          Magnifier {active ? "on" : "off"}
        </span>
      </div>

      {/* Zoom slider row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#888", minWidth: 32 }}>Zoom</span>
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={0.5}
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          style={{ flex: 1 }}
          aria-label="Magnification level"
        />
        <span style={{ fontSize: 12, fontWeight: 500, color: "#444", minWidth: 30, textAlign: "right" }}>
          {zoom.toFixed(1)}×
        </span>
      </div>
    </div>
  );
}
import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * ScreenMagnifier — html2canvas edition
 *
 * Install dependency:  npm install html2canvas
 *
 * Props:
 *   lensSize      {number}  Lens diameter in px.                    Default: 160
 *   defaultZoom   {number}  Starting zoom level.                    Default: 2.5
 *   minZoom       {number}  Slider minimum.                         Default: 1.5
 *   maxZoom       {number}  Slider maximum.                         Default: 5
 *   snapshotKey   {any}     Change when page content changes (e.g. pass `view`)
 *                           to trigger a fresh snapshot immediately.
 *   enabled       {boolean} Controlled mode (optional).
 *   onToggle      {fn}      Called with next boolean.
 *   showToggle    {boolean} Show built-in controls.                 Default: true
 *   className / style       Applied to the content wrapper div.
 */
export default function ScreenMagnifier({
  children,
  lensSize = 160,
  defaultZoom = 2.5,
  minZoom = 1.5,
  maxZoom = 5,
  snapshotKey,
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

  const contentRef    = useRef(null);  // real content wrapper
  const lensCanvasRef = useRef(null);  // <canvas> inside the lens
  const lensDivRef    = useRef(null);  // the circular lens div (moved imperatively)
  const snapshotRef   = useRef(null);  // offscreen canvas from html2canvas
  const rafRef        = useRef(null);
  const zoomRef       = useRef(zoom);  // kept in sync so drawLens always sees latest zoom
  const lensSizeRef   = useRef(lensSize);


  // Keep refs in sync with props/state so RAF callbacks always have latest values
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { lensSizeRef.current = lensSize; }, [lensSize]);

  const handleToggle = () => {
    const next = !active;
    if (!isControlled) setInternalEnabled(next);
    onToggle?.(next);
  };

  // ── Snapshot ──────────────────────────────────────────────────────────────
  const takeSnapshot = useCallback(async () => {
    if (!contentRef.current) return;
    try {
      const h2c = (await import("html2canvas")).default;

      // Capture document.body so we get body background + all styles,
      // then crop to the content wrapper's position ourselves.
      const fullCanvas = await h2c(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: window.devicePixelRatio || 1,
        windowWidth:  document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        x: 0,
        y: 0,
        width:  document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      });

      // Crop to just the content wrapper's area so our srcX/srcY math stays correct
      const rect = contentRef.current.getBoundingClientRect();
      const dpr  = window.devicePixelRatio || 1;
      const cropX = (rect.left + window.scrollX) * dpr;
      const cropY = (rect.top  + window.scrollY) * dpr;
      const cropW = rect.width  * dpr;
      const cropH = rect.height * dpr;

      const cropped = document.createElement("canvas");
      cropped.width  = cropW;
      cropped.height = cropH;
      cropped.getContext("2d").drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      snapshotRef.current = cropped;
      console.log("Snapshot ready:", cropped.width, "x", cropped.height);
    } catch (e) {
      console.error("ScreenMagnifier: html2canvas failed", e);
    } finally {
    }
  }, []);

  // Snapshot on toggle-on, snapshotKey change, and every 10 seconds
  useEffect(() => {
    if (!active) return;
    const initial  = setTimeout(takeSnapshot, 120);
    const interval = setInterval(takeSnapshot, 1_000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [active, snapshotKey, takeSnapshot]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  // Everything is done imperatively inside RAF — no setState calls during draw,
  // so React never re-renders between clearRect and drawImage.
  const drawLens = useCallback((clientX, clientY) => {
    if (!contentRef.current) return;

    const rect     = contentRef.current.getBoundingClientRect();
    const lensSize = lensSizeRef.current;
    const half     = lensSize / 2;
    const x        = clientX - rect.left;
    const y        = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      if (lensDivRef.current) lensDivRef.current.style.opacity = "0";
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const lensDiv    = lensDivRef.current;
      const lensCanvas = lensCanvasRef.current;
      const snapshot   = snapshotRef.current;

      if (!lensDiv) return;

      // Move and show the lens imperatively — no setState, no re-render
      lensDiv.style.left    = `${clientX - half}px`;
      lensDiv.style.top     = `${clientY - half}px`;
      lensDiv.style.opacity = "1";

      if (!snapshot || !lensCanvas) return;

      const zoom = zoomRef.current;
      const dpr  = window.devicePixelRatio || 1;
      const size = lensSize * dpr;

      // Only reassign dimensions if they changed — assigning .width/.height
      // always wipes the canvas even if the value is identical
      if (lensCanvas.width !== size || lensCanvas.height !== size) {
        lensCanvas.width  = size;
        lensCanvas.height = size;
      }

      const ctx  = lensCanvas.getContext("2d");
      const srcW = (lensSize / zoom) * dpr;
      const srcH = (lensSize / zoom) * dpr;
      const srcX = Math.max(0, Math.min(x * dpr - srcW / 2, snapshot.width  - srcW));
      const srcY = Math.max(0, Math.min(y * dpr - srcH / 2, snapshot.height - srcH));

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(snapshot, srcX, srcY, srcW, srcH, 0, 0, size, size);
    });
  }, []); // no deps — reads everything from refs

  const hide = useCallback(() => {
    if (lensDivRef.current) lensDivRef.current.style.opacity = "0";
  }, []);

  // Mouse
  const onMouseMove  = useCallback((e) => { if (active) drawLens(e.clientX, e.clientY); }, [active, drawLens]);
  const onMouseLeave = useCallback(() => hide(), [hide]);

  // Touch
  const onTouchMove  = useCallback((e) => { if (!active) return; drawLens(e.touches[0].clientX, e.touches[0].clientY); }, [active, drawLens]);
  const onTouchStart = useCallback((e) => { if (!active) return; drawLens(e.touches[0].clientX, e.touches[0].clientY); }, [active, drawLens]);
  const onTouchEnd   = useCallback(() => hide(), [hide]);

  useEffect(() => { if (!active) hide(); }, [active, hide]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <>
      {/* Real content — single render, never cloned */}
      <div
        ref={contentRef}
        className={className}
        style={{ ...style }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>

      {/* Lens portal — always mounted so refs attach immediately; hidden via display:none when inactive */}
      {createPortal(
        <div
          ref={lensDivRef}
          aria-hidden="true"
          style={{
            display:       active ? "block" : "none",
            position:      "fixed",
            left:          -9999,
            top:           -9999,
            width:         lensSize,
            height:        lensSize,
            borderRadius:  "50%",
            overflow:      "hidden",
            pointerEvents: "none",
            zIndex:        99999,
            opacity:       0,
            transition:    "opacity 0.1s ease",
            border:        "2px solid rgba(0,0,0,0.2)",
            boxShadow:     "0 4px 24px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.35)",
          }}
        >
          <canvas
            ref={lensCanvasRef}
            style={{ width: lensSize, height: lensSize, display: "block" }}
          />
        </div>,
        document.body
      )}

      {/* Controls */}
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
    </>
  );
}

/* ── Fixed top-left control panel (75% scale) ── */
function ControlPanel({ active, onToggle, zoom, onZoomChange, minZoom, maxZoom }) {
  return (
    <div
      style={{
        position:        "fixed",
        top:             16,
        left:            16,
        zIndex:          99999,
        transform:       "scale(0.75)",
        transformOrigin: "top left",
        display:         "flex",
        flexDirection:   "column",
        gap:             10,
        background:      "rgba(255,255,255,0.92)",
        backdropFilter:  "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border:          "1px solid rgba(0,0,0,0.1)",
        borderRadius:    12,
        padding:         "10px 14px",
        boxShadow:       "0 2px 12px rgba(0,0,0,0.12)",
        userSelect:      "none",
        minWidth:        190,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          role="switch"
          aria-checked={active}
          onClick={onToggle}
          style={{
            position:    "relative",
            display:     "inline-flex",
            alignItems:  "center",
            width:       44,
            height:      24,
            borderRadius: 12,
            border:      "none",
            padding:     0,
            cursor:      "pointer",
            background:  active ? "#1D9E75" : "#ccc",
            transition:  "background 0.2s",
            flexShrink:  0,
          }}
        >
          <span style={{
            position:    "absolute",
            top:         3,
            left:        active ? 23 : 3,
            width:       18,
            height:      18,
            borderRadius: "50%",
            background:  "#fff",
            transition:  "left 0.18s",
            boxShadow:   "0 1px 3px rgba(0,0,0,0.2)",
          }} />
          <span style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)" }}>
            {active ? "Disable" : "Enable"} magnifier
          </span>
        </button>
        <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
          Magnifier {active ? "on" : "off"}
        </span>
      </div>

      {active && (
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
      )}


    </div>
  );
}
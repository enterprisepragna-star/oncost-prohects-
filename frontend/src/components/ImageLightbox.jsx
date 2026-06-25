import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

/**
 * Fullscreen image viewer with zoom (buttons + wheel) and click-and-drag panning.
 * Props: { src, alt, caption, onClose }
 */
export default function ImageLightbox({ src, alt = "", caption = "", onClose }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const wrapRef = useRef(null);

  const reset = useCallback(() => { setScale(1); setPos({ x: 0, y: 0 }); }, []);
  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.5, 5)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.5, 1)), []);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    // prevent body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, zoomIn, zoomOut, reset]);

  const onWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn(); else zoomOut();
  };
  const onMouseDown = (e) => {
    if (scale <= 1) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    setPos({ x: d.x + (e.clientX - d.sx), y: d.y + (e.clientY - d.sy) });
  };
  const onMouseUp = () => { dragRef.current = null; };

  // Pinch-to-zoom (basic touch support)
  const pinchRef = useRef(null);
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), startScale: scale };
    } else if (e.touches.length === 1 && scale > 1) {
      dragRef.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, x: pos.x, y: pos.y };
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = Math.max(1, Math.min(5, pinchRef.current.startScale * (dist / pinchRef.current.dist)));
      setScale(next);
    } else if (e.touches.length === 1 && dragRef.current) {
      const d = dragRef.current;
      setPos({ x: d.x + (e.touches[0].clientX - d.sx), y: d.y + (e.touches[0].clientY - d.sy) });
    }
  };
  const onTouchEnd = () => { dragRef.current = null; pinchRef.current = null; };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center select-none"
      onClick={onClose}
      data-testid="image-lightbox"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10" onClick={(e) => e.stopPropagation()}>
        <p className="text-white/80 font-mono text-xs uppercase tracking-wider">{caption}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            data-testid="lightbox-zoom-out"
            aria-label="Zoom out"
          ><ZoomOut size={16} /></button>
          <span className="text-white/70 font-mono text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            data-testid="lightbox-zoom-in"
            aria-label="Zoom in"
          ><ZoomIn size={16} /></button>
          <button
            onClick={reset}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            data-testid="lightbox-reset"
            aria-label="Reset zoom"
          ><Maximize2 size={14} /></button>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center ml-2"
            data-testid="lightbox-close"
            aria-label="Close"
          ><X size={18} /></button>
        </div>
      </div>

      {/* Image stage */}
      <div
        ref={wrapRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: scale > 1 ? (dragRef.current ? "grabbing" : "grab") : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onDoubleClick={() => (scale === 1 ? setScale(2.5) : reset())}
          className="max-w-[92vw] max-h-[80vh] object-contain transition-transform duration-150 ease-out"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transformOrigin: "center center" }}
          data-testid="lightbox-image"
        />
      </div>

      {/* Bottom hint */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-[11px] uppercase tracking-wider font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        Scroll / pinch to zoom · Drag to pan · Double-click to toggle · Esc to close
      </div>
    </div>
  );
}

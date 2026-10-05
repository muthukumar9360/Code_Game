import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to manage draggable horizontal split ratio between Question & Editor
 */
export const useResizableSplit = ({
  initialPercent = 38,
  minPercent = 20,
  maxPercent = 75,
  storageKey = "battlix_split_ratio"
} = {}) => {
  const [leftPercent, setLeftPercent] = useState(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed) && parsed >= minPercent && parsed <= maxPercent) {
            return parsed;
          }
        }
      } catch (err) {
        // ignore localStorage errors
      }
    }
    return initialPercent;
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    // Only trigger on primary left click
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleReset = useCallback(() => {
    setLeftPercent(initialPercent);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, initialPercent.toString());
      } catch (err) {}
    }
  }, [initialPercent, storageKey]);

  useEffect(() => {
    if (!isDragging) return;

    // Apply global cursor and disable text selection while dragging
    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMove = (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      let newPercent = (relativeX / rect.width) * 100;
      if (newPercent < minPercent) newPercent = minPercent;
      if (newPercent > maxPercent) newPercent = maxPercent;
      setLeftPercent(newPercent);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, newPercent.toFixed(2));
        } catch (err) {}
      }
    };

    const onMouseMove = (e) => {
      handleMove(e.clientX);
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, minPercent, maxPercent, storageKey]);

  return {
    leftPercent,
    isDragging,
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleReset,
    setLeftPercent
  };
};

/**
 * Middle Dragger Divider Component
 */
export const SplitDivider = ({
  isDragging,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
  title = "Drag left/right to resize Problem & Editor (Double-click to reset)"
}) => {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDoubleClick={onDoubleClick}
      title={title}
      className={`group relative hidden md:flex items-center justify-center cursor-col-resize select-none transition-colors duration-150 z-30 shrink-0 w-3 -mx-1.5 py-4 ${
        isDragging ? "bg-orange-500/20" : "hover:bg-orange-500/10"
      }`}
    >
      {/* Central guideline */}
      <div
        className={`w-[2px] h-full rounded-full transition-all duration-150 ${
          isDragging
            ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.9)]"
            : "bg-white/10 group-hover:bg-orange-400 group-hover:shadow-[0_0_6px_rgba(249,115,22,0.6)]"
        }`}
      />

      {/* Modern IDE Dragger Pill */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-11 rounded-full flex flex-col items-center justify-center gap-1 border shadow-xl transition-all duration-150 ${
          isDragging
            ? "bg-orange-500 border-orange-300 text-black scale-110 shadow-orange-500/50"
            : "bg-[#0a1118] border-white/20 text-gray-400 group-hover:text-white group-hover:border-orange-500 group-hover:bg-black group-hover:scale-105"
        }`}
      >
        <span className="w-1.5 h-0.5 bg-current rounded-full opacity-80"></span>
        <span className="w-1.5 h-0.5 bg-current rounded-full opacity-80"></span>
        <span className="w-1.5 h-0.5 bg-current rounded-full opacity-80"></span>
      </div>
    </div>
  );
};

export default SplitDivider;

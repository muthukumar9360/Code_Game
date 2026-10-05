import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaShieldAlt, FaExpand, FaExclamationTriangle, FaLock, FaBan } from "react-icons/fa";

/**
 * useSecureProctoring Hook
 * Enforces:
 * 1. Mandatory Fullscreen mode
 * 2. Complete block of Copy, Paste, Cut, Selection, and Context Menu
 * 3. Complete block of Screenshots (PrintScreen, Win+Shift+S, Snipping tools)
 * 4. Zero-tolerance breach detection: any tab switch, window blur, resize/exit fullscreen immediately closes the session.
 */
/**
 * STRICT_FULLSCREEN_LOCKDOWN Flag:
 * Set to false per user request: "temporarily stop the full screen because i need to test the entire platform"
 * When false, the full-screen gateway modal and auto-termination listeners are paused.
 * Setting this to true re-activates the 100% strict lockdown.
 */
export const STRICT_FULLSCREEN_LOCKDOWN = false;

export const useSecureProctoring = ({
  onTerminate,
  enabled = true,
  environmentName = "Coding Environment"
}) => {
  const isLockdownActive = enabled && STRICT_FULLSCREEN_LOCKDOWN;
  const [isFullscreen, setIsFullscreen] = useState(
    isLockdownActive ? Boolean(document.fullscreenElement) : true
  );
  const [hasEnteredFullscreenOnce, setHasEnteredFullscreenOnce] = useState(!isLockdownActive);
  const isTerminatingRef = useRef(false);

  // Request fullscreen wrapper
  const enterFullscreen = useCallback(async () => {
    if (!isLockdownActive) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setHasEnteredFullscreenOnce(true);
      }
    } catch (err) {
      console.warn("Fullscreen permission or activation required:", err);
    }
  }, [isLockdownActive]);

  // Trigger immediate session termination and screen closure
  const triggerViolation = useCallback((reason) => {
    if (!isLockdownActive || isTerminatingRef.current) return;
    isTerminatingRef.current = true;

    // Clear clipboard to avoid any captured data
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("");
      }
    } catch (e) {}

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // Alert user about the strict integrity termination
    alert(
      `⚠️ STRICT INTEGRITY PROTOCOL TRIGGERED\n\n` +
      `Security Breach Detected: ${reason}\n\n` +
      `Policy Violation: Any window change, blur, fullscreen exit, or capture attempt is prohibited. ` +
      `This session has been terminated and the screen has closed.`
    );

    if (onTerminate) {
      onTerminate(reason);
    }
  }, [enabled, onTerminate]);

  useEffect(() => {
    if (!isLockdownActive) return;

    // Attempt automatic fullscreen on mount
    enterFullscreen();

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);

      if (active) {
        setHasEnteredFullscreenOnce(true);
      } else if (hasEnteredFullscreenOnce && !isTerminatingRef.current) {
        // Exiting fullscreen after having entered it is a zero-tolerance breach
        triggerViolation("Exited Full-Screen mode (Esc / Window change detected)");
      }
    };

    // Tab Switch / Minimize detection
    const handleVisibilityChange = () => {
      if (document.hidden && hasEnteredFullscreenOnce && !isTerminatingRef.current) {
        triggerViolation("Tab switched or window minimized during active coding");
      }
    };

    // Window Blur (Switching apps, clicking secondary screen, Snipping tool, Alt-Tab)
    const handleWindowBlur = () => {
      if (hasEnteredFullscreenOnce && !isTerminatingRef.current) {
        triggerViolation("Window lost focus or unauthorized application opened (Blur detected)");
      }
    };

    // Anti-Screenshot & Anti-Inspect & Anti-Shortcut Keydown
    const handleKeyDown = (e) => {
      if (isTerminatingRef.current) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. Screenshot key (PrintScreen)
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (err) {}
        triggerViolation("Screenshot capture attempted (PrintScreen detected)");
        return;
      }

      // 2. Windows Snipping Tool (Win+Shift+S) / Mac (Cmd+Shift+4)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "S" || e.key === "s" || e.key === "4" || e.key === "3")) {
        e.preventDefault();
        triggerViolation("Screen capture tool shortcut triggered");
        return;
      }

      // 3. DevTools / Inspection Keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
      if (
        e.key === "F12" ||
        (cmdOrCtrl && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (cmdOrCtrl && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        triggerViolation("Inspection or Developer Tools shortcut detected");
        return;
      }

      // 4. Save (Ctrl+S), Print (Ctrl+P)
      if (cmdOrCtrl && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        triggerViolation("Save/Print page command blocked");
        return;
      }

      // 5. Copy / Cut (Ctrl+C, Ctrl+X) - Block copy on the page
      if (cmdOrCtrl && (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X")) {
        // Block clipboard copy
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (err) {}
        return;
      }

      // 6. Paste (Ctrl+V) - Zero tolerance pasting
      if (cmdOrCtrl && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        triggerViolation("Clipboard paste shortcut (Ctrl+V) attempted");
        return;
      }
    };

    // Block Copy
    const handleCopy = (e) => {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("");
        }
      } catch (err) {}
    };

    // Block Cut
    const handleCut = (e) => {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("");
        }
      } catch (err) {}
    };

    // Block Paste
    const handlePaste = (e) => {
      e.preventDefault();
      triggerViolation("Clipboard paste event detected");
    };

    // Block Context Menu (Right Click)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [enabled, hasEnteredFullscreenOnce, enterFullscreen, triggerViolation]);

  return {
    isFullscreen,
    hasEnteredFullscreenOnce,
    enterFullscreen,
    triggerViolation
  };
};

/**
 * FullscreenGatewayModal Component
 * Prompts user to click and activate full-screen mode if the browser blocked automatic fullscreen on load.
 */
export const FullscreenGatewayModal = ({ isFullscreen, onEnterFullscreen, environmentName = "Arena" }) => {
  if (!STRICT_FULLSCREEN_LOCKDOWN || isFullscreen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#03070b]/98 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#0a1118] border-2 border-orange-500/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(249,115,22,0.3)] animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-orange-400 text-3xl mx-auto mb-4 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
          <FaShieldAlt />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-3">
          Lockdown Security Active
        </div>

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
          Fullscreen Required
        </h2>

        <p className="text-xs text-gray-300 font-mono leading-relaxed mb-6">
          To maintain strict competitive integrity for <span className="text-orange-400 font-bold">{environmentName}</span>, the workspace must operate in full-screen mode.
        </p>

        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 text-left font-mono text-xs space-y-2 mb-6 text-gray-300">
          <div className="flex items-start gap-2 text-white font-bold">
            <FaLock className="text-orange-400 mt-0.5 shrink-0" />
            <span>Strict Anti-Cheat Regulations:</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-gray-400">
            <FaBan className="text-red-400 mt-0.5 shrink-0" />
            <span>Copy, Paste, and Cut are completely disabled.</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-gray-400">
            <FaBan className="text-red-400 mt-0.5 shrink-0" />
            <span>Screenshots, Snipping Tool, and DevTools are monitored.</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-amber-300 font-bold">
            <FaExclamationTriangle className="text-amber-400 mt-0.5 shrink-0" />
            <span>Any tab switch, window blur, or change will close the screen immediately.</span>
          </div>
        </div>

        <button
          onClick={onEnterFullscreen}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black font-mono text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaExpand /> Enter Fullscreen Environment
        </button>
      </div>
    </div>
  );
};

export default useSecureProctoring;

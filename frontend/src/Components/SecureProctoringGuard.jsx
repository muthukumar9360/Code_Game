import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaShieldAlt, FaExpand, FaExclamationTriangle, FaLock, FaBan, FaRedo, FaClock } from "react-icons/fa";

/**
 * STRICT_FULLSCREEN_LOCKDOWN Flag:
 * Active full-screen lockdown with Skillrack-style 10-second warning countdown.
 */
export const STRICT_FULLSCREEN_LOCKDOWN = true;

export const useSecureProctoring = ({
  onTerminate,
  enabled = true,
  environmentName = "Coding Environment",
  maxWarnings = 3
}) => {
  const isLockdownActive = enabled && STRICT_FULLSCREEN_LOCKDOWN;
  const [isFullscreen, setIsFullscreen] = useState(
    isLockdownActive ? Boolean(document.fullscreenElement) : true
  );
  const [hasEnteredFullscreenOnce, setHasEnteredFullscreenOnce] = useState(!isLockdownActive);
  const [warningActive, setWarningActive] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(10);
  const [warningReason, setWarningReason] = useState("");
  const [warningCount, setWarningCount] = useState(0);

  const isTerminatingRef = useRef(false);
  const countdownTimerRef = useRef(null);
  const keystrokeHistoryRef = useRef([]);

  // Terminate match permanently (called if countdown expires or severe cheat)
  const triggerViolation = useCallback((reason) => {
    if (!isLockdownActive || isTerminatingRef.current) return;
    isTerminatingRef.current = true;

    // Clear any pending countdown
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setWarningActive(false);

    // Clear clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("");
      }
    } catch (e) {}

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (onTerminate) {
      onTerminate(reason);
    }
  }, [isLockdownActive, onTerminate]);

  // Skillrack-style warning modal with 10s countdown
  const startWarningSequence = useCallback((reason) => {
    if (!isLockdownActive || isTerminatingRef.current) return;
    
    setWarningReason(reason);
    setWarningActive(true);
    setWarningCountdown(10);
    setWarningCount(prev => prev + 1);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    let timeLeft = 10;
    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setWarningCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        triggerViolation(
          `Skillrack Security Breach: Fullscreen was not restored within 10 seconds (${reason})`
        );
      }
    }, 1000);
  }, [isLockdownActive, triggerViolation]);

  // Request fullscreen wrapper
  const enterFullscreen = useCallback(async () => {
    if (!isLockdownActive) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setHasEnteredFullscreenOnce(true);

      // If resolving an active warning
      if (warningActive) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setWarningActive(false);
      }
    } catch (err) {
      console.warn("Fullscreen permission or activation required:", err);
    }
  }, [isLockdownActive, warningActive]);

  // Handle Fullscreen state change
  useEffect(() => {
    if (!isLockdownActive) return;

    // Try auto-fullscreen on mount
    enterFullscreen();

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);

      if (active) {
        setHasEnteredFullscreenOnce(true);
        // Clear warning if user re-entered fullscreen
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setWarningActive(false);
      } else if (hasEnteredFullscreenOnce && !isTerminatingRef.current) {
        // Skillrack-style: Show warning modal with 10s timer instead of instant disqualify
        startWarningSequence("Exited Full-Screen mode (Esc or window minimize)");
      }
    };

    // Tab switch or minimize
    const handleVisibilityChange = () => {
      if (document.hidden && hasEnteredFullscreenOnce && !isTerminatingRef.current) {
        startWarningSequence("Tab switched or browser minimized during active contest");
      }
    };

    // Window Blur (clicking outside, secondary monitor, snipping tool)
    const handleWindowBlur = () => {
      if (hasEnteredFullscreenOnce && !isTerminatingRef.current) {
        startWarningSequence("Window lost focus or unauthorized application opened");
      }
    };

    // Anti-Screenshot, Anti-Inspect, Anti-Shortcut & Anti-Autotyper
    const handleKeyDown = (e) => {
      if (isTerminatingRef.current) return;

      // 0. Detect automated script / untrusted event
      if (e.isTrusted === false) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Automated synthetic script event detected");
        return;
      }

      // Autotyper detection: track keystroke frequency
      const now = Date.now();
      keystrokeHistoryRef.current.push(now);
      // Keep only keystrokes in last 400ms
      keystrokeHistoryRef.current = keystrokeHistoryRef.current.filter(t => now - t <= 400);
      if (keystrokeHistoryRef.current.length > 25) {
        // Superhuman typing speed (>60 keys in 400ms = ~150 chars/sec) typical of autotyper bookmarklets
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Autotyper / Automated typing script detected");
        return;
      }

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
        startWarningSequence("Screenshot capture attempted (PrintScreen detected)");
        return;
      }

      // 2. Snipping Tool shortcuts (Win+Shift+S / Cmd+Shift+4)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "S" || e.key === "s" || e.key === "4" || e.key === "3")) {
        e.preventDefault();
        startWarningSequence("Screen capture tool shortcut triggered");
        return;
      }

      // 3. DevTools / Inspection Keys (F12, Ctrl+Shift+I, etc.)
      if (
        e.key === "F12" ||
        (cmdOrCtrl && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (cmdOrCtrl && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        startWarningSequence("Inspection or Developer Tools shortcut detected");
        return;
      }

      // 4. Save / Print shortcuts
      if (cmdOrCtrl && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        return;
      }

      // 5. Copy / Cut (Ctrl+C, Ctrl+X) - Strictly blocked
      if (cmdOrCtrl && (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X")) {
        e.preventDefault();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (err) {}
        return;
      }

      // 6. Paste (Ctrl+V) - Strictly blocked
      if (cmdOrCtrl && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        startWarningSequence("Clipboard paste shortcut (Ctrl+V) is strictly prohibited");
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
      startWarningSequence("Clipboard paste event detected - manual coding required");
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
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [isLockdownActive, hasEnteredFullscreenOnce, enterFullscreen, startWarningSequence, triggerViolation, warningActive]);

  return {
    isFullscreen,
    hasEnteredFullscreenOnce,
    warningActive,
    warningCountdown,
    warningReason,
    warningCount,
    maxWarnings,
    enterFullscreen,
    triggerViolation
  };
};

/**
 * SkillrackWarningModal / FullscreenGatewayModal Component
 * Displays:
 * 1. Initial Fullscreen Gateway (if not in fullscreen initially)
 * 2. Skillrack-style Violation Warning (if user exits fullscreen or blurs window) with 10-second countdown
 */
export const SkillrackSecurityModal = ({
  isFullscreen,
  warningActive,
  warningCountdown = 10,
  warningReason = "",
  warningCount = 1,
  maxWarnings = 3,
  onEnterFullscreen,
  environmentName = "Contest Arena"
}) => {
  if (!STRICT_FULLSCREEN_LOCKDOWN) return null;

  // Case 1: Skillrack Active Violation Warning (10-second countdown)
  if (warningActive) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
        <div className="max-w-lg w-full bg-[#110505] border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.5)]">
          {/* Pulsing Alert Icon */}
          <div className="w-20 h-20 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 text-4xl mx-auto mb-4 animate-bounce">
            <FaExclamationTriangle />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 font-mono text-xs font-black uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            SkillRack Proctoring Violation
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
            Fullscreen Mode Exited!
          </h2>

          <p className="text-xs sm:text-sm text-red-300 font-mono mb-4">
            {warningReason || "You have exited fullscreen or lost active window focus."}
          </p>

          {/* Countdown Clock (Skillrack style) */}
          <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider mb-1">
              <FaClock /> Forfeiture / Auto-Submit In:
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-widest">
              00:{warningCountdown.toString().padStart(2, "0")}
            </div>
            <div className="text-[11px] font-mono text-gray-400 mt-2">
              Warning Notice {warningCount} of {maxWarnings}
            </div>
          </div>

          <p className="text-[11px] text-gray-300 font-mono mb-6 leading-relaxed">
            Click the button below immediately to restore fullscreen mode and prevent automated session termination.
          </p>

          <button
            onClick={onEnterFullscreen}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black font-mono text-sm sm:text-base uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaExpand /> Return to Fullscreen Immediately ({warningCountdown}s)
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Initial Fullscreen Gateway (if user hasn't entered fullscreen yet)
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#03070b]/98 backdrop-blur-xl flex items-center justify-center p-4 select-none">
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
              <span>Autotypers, automated scripts, and bots are prohibited.</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-amber-300 font-bold">
              <FaExclamationTriangle className="text-amber-400 mt-0.5 shrink-0" />
              <span>Exiting fullscreen triggers a 10s Skillrack countdown warning.</span>
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
  }

  return null;
};

// Backwards-compatible alias
export const FullscreenGatewayModal = SkillrackSecurityModal;

export default useSecureProctoring;

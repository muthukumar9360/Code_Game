import React, { useState, useEffect, useRef } from "react";
import { FaKeyboard, FaTachometerAlt, FaFire, FaTimes } from "react-icons/fa";

const TypingSpeedMeter = ({ code = "", isActive = true }) => {
  const [wpm, setWpm] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const startTimeRef = useRef(null);
  const charCountRef = useRef(0);
  const historyRef = useRef([]);

  useEffect(() => {
    if (!code) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    setKeystrokes((prev) => prev + 1);
    charCountRef.current = code.length;

    const now = Date.now();
    historyRef.current.push({ time: now, chars: code.length });
    // Keep window of last 30 seconds for dynamic current WPM
    historyRef.current = historyRef.current.filter((item) => now - item.time <= 30000);

    if (historyRef.current.length >= 2) {
      const first = historyRef.current[0];
      const deltaChars = Math.abs(code.length - first.chars);
      const deltaMinutes = (now - first.time) / 60000;
      if (deltaMinutes > 0.05) {
        const currentWpm = Math.round(deltaChars / 5 / deltaMinutes);
        setWpm(Math.min(currentWpm, 200));
      }
    }
  }, [code]);

  if (!isActive) return null;

  const getTier = (val) => {
    if (val >= 90) return { label: "GODLIKE 🚀", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" };
    if (val >= 60) return { label: "AGILE 🔥", color: "text-orange-400 border-orange-500/40 bg-orange-500/10" };
    if (val >= 35) return { label: "STEADY ⚡", color: "text-blue-400 border-blue-500/40 bg-blue-500/10" };
    return { label: "PACED 🧘", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" };
  };

  const tier = getTier(wpm);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 hover:border-orange-500/40 text-[10px] font-mono font-bold text-gray-300 flex items-center gap-1.5 transition"
        title="Expand Typing Speed Gauge"
      >
        <FaTachometerAlt className="text-orange-400" />
        <span>{wpm} WPM</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-black/70 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-1.5 text-gray-400">
        <FaKeyboard className="text-orange-400" />
        <span className="text-[10px] uppercase font-bold text-gray-400">Rhythm:</span>
      </div>

      <div className="flex items-center gap-1 font-black text-white">
        <span className="text-sm font-bold text-orange-400">{wpm}</span>
        <span className="text-[9px] text-gray-400 uppercase">WPM</span>
      </div>

      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase ${tier.color}`}>
        {tier.label}
      </span>

      <span className="text-[10px] text-gray-500 border-l border-white/10 pl-2">
        {keystrokes} strokes
      </span>

      <button
        onClick={() => setCollapsed(true)}
        className="text-gray-500 hover:text-gray-300 text-[10px] pl-1"
        title="Minimize"
      >
        ✕
      </button>
    </div>
  );
};

export default TypingSpeedMeter;

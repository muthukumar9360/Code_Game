import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck, FaJava } from "react-icons/fa";
import { SiPython, SiJavascript, SiCplusplus, SiC } from "react-icons/si";

export const LANGUAGES = [
  {
    id: "python",
    name: "Python 3",
    version: "v3.11",
    icon: SiPython,
    iconColor: "text-yellow-400",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
  },
  {
    id: "javascript",
    name: "JavaScript",
    version: "Node 20",
    icon: SiJavascript,
    iconColor: "text-amber-300",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30"
  },
  {
    id: "cpp",
    name: "C++ 20",
    version: "GCC 13",
    icon: SiCplusplus,
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30"
  },
  {
    id: "java",
    name: "Java",
    version: "JDK 17",
    icon: FaJava,
    iconColor: "text-red-400",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/30"
  },
  {
    id: "c",
    name: "C Language",
    version: "C17 Std",
    icon: SiC,
    iconColor: "text-cyan-400",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
  }
];

export const LanguageSelector = ({ selectedLanguage = "python", onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang =
    LANGUAGES.find((l) => l.id.toLowerCase() === selectedLanguage.toLowerCase()) ||
    LANGUAGES[0];
  const CurrentIcon = currentLang.icon;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (langId) => {
    if (onChange) onChange(langId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-[#050b10] hover:bg-black/80 border border-white/30 hover:border-white rounded-xl transition duration-150 shadow-md group focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer"
        title="Change Programming Language"
      >
        <span className="p-1 rounded-md bg-white/5 border border-white/20 flex items-center justify-center">
          <CurrentIcon className={`${currentLang.iconColor} text-sm group-hover:scale-110 transition-transform`} />
        </span>
        <span className="text-xs font-bold font-mono tracking-wide text-white">
          {currentLang.name}
        </span>
        <span className="text-[10px] font-mono text-gray-300 hidden sm:inline px-1.5 py-0.5 rounded bg-white/5 border border-white/20">
          {currentLang.version}
        </span>
        <FaChevronDown
          size={10}
          className={`text-gray-400 group-hover:text-orange-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? "rotate-180 text-orange-400" : ""
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a1118]/95 backdrop-blur-2xl border-2 border-white/40 rounded-2xl p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 border-b border-white/20 mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-gray-300">
              Select Language
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="space-y-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.id.toLowerCase() === currentLang.id.toLowerCase();
              const Icon = lang.icon;

              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelect(lang.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition duration-150 font-mono text-xs cursor-pointer ${
                    isSelected
                      ? "bg-orange-500/15 border border-orange-500/40 text-white font-bold"
                      : "hover:bg-white/10 text-gray-300 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon className={`${lang.iconColor} text-sm`} />
                    </span>
                    <div>
                      <div className="text-xs leading-none font-bold text-white">{lang.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{lang.version}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-orange-400 text-xs">
                      <FaCheck size={11} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

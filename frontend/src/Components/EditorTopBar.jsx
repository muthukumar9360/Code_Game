import React from "react";
import LanguageSelector from "./LanguageSelector.jsx";

export const EditorTopBar = ({ language, onLanguageChange, title = "Solution Workspace // Tab=Indent" }) => {
  return (
    <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        {/* Terminal Window Dots */}
        <div className="flex gap-1.5 ml-1">
          <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/70"></div>
          <div className="w-3 h-3 rounded-full bg-orange-500/40 border border-orange-500/70"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/70"></div>
        </div>
        {/* Workspace Title */}
        <span className="text-[11px] font-mono text-gray-300 uppercase tracking-widest hidden sm:inline font-semibold">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector selectedLanguage={language} onChange={onLanguageChange} />
      </div>
    </div>
  );
};

export default EditorTopBar;

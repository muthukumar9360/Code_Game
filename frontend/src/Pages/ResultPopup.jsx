import React from "react";
import { FaTimes, FaTrophy, FaTimesCircle, FaArrowRight } from "react-icons/fa";

const ResultPopup = ({ isWinner, winnerName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#0a1118] border border-white/20 w-full max-w-md p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-white/5"
          title="Close"
        >
          <FaTimes />
        </button>

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
            isWinner ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
          }`}>
            {isWinner ? <FaTrophy size={40} className="animate-bounce" /> : <FaTimesCircle size={40} />}
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
          {isWinner ? "MISSION ACCOMPLISHED" : "MISSION COMPROMISED"}
        </h2>

        {/* MESSAGE */}
        <div className={`py-4 px-6 rounded-2xl mb-6 font-mono text-sm border ${
          isWinner
            ? "bg-green-500/10 text-green-400 border-green-500/30"
            : "bg-red-500/10 text-red-400 border-red-500/30"
        }`}>
          {isWinner ? (
            <div>
              <div className="font-bold text-base mb-1">VICTORY SECURED 🏆</div>
              <div className="text-xs opacity-80">All test verification nodes passed.</div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-base mb-1">DEFEAT ❌</div>
              <div className="text-xs opacity-80">{winnerName ? `${winnerName} completed the objective first.` : "Contest ended."}</div>
            </div>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] transition hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2"
        >
          VIEW MISSION TELEMETRY <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ResultPopup;

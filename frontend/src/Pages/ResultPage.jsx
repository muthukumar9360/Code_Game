import React from "react";

const ResultPopup = ({ isWinner, winnerName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="bg-white w-[550px] p-8 rounded-2xl shadow-2xl text-center animate-scaleIn">

        {/* TITLE */}
        <h2 className="text-3xl font-extrabold text-[#0f2735] mb-4">
          Contest Result
        </h2>

        {/* RESULT MESSAGE */}
        {isWinner ? (
          <div className="bg-green-500 text-white py-4 rounded-xl text-2xl font-bold mb-6">
            🎉 CONGRATULATIONS 🎉 <br />
            YOU WIN 🏆
          </div>
        ) : (
          <div className="bg-red-500 text-white py-4 rounded-xl text-2xl font-bold mb-6">
            ❌ SORRY <br />
            {winnerName} WINS 🥇
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={onClose}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default ResultPopup;

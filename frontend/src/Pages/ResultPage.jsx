import React from "react";

const ResultPage = () => {
  const winner = "Kumar"; // example
  const ranking = [
    { name: "Kumar", time: "12.4s" },
    { name: "Ravi", time: "18.9s" },
    { name: "John", time: "25.1s" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="bg-white bg-opacity-95 w-[650px] p-10 rounded-2xl shadow-2xl text-center">

        {/* TITLE */}
        <h2 className="text-4xl font-extrabold text-[#0f2735] tracking-wide mb-4">
          Contest <span className="text-orange-500">Results</span>
        </h2>

        {/* WINNER ANNOUNCEMENT */}
        <div className="bg-orange-500 text-white py-4 px-6 rounded-xl text-2xl font-bold shadow-lg mb-6">
          🏆 Winner: {winner} 🏆
        </div>

        {/* RANK LIST */}
        <h3 className="text-2xl font-bold text-[#0f2735] mb-3">Rankings</h3>

        <div className="bg-gray-100 p-5 rounded-xl shadow-inner">
          {ranking.map((player, index) => (
            <div
              key={index}
              className="flex justify-between bg-white px-5 py-3 border rounded-xl mb-3 shadow-sm font-semibold text-gray-700"
            >
              <span>
                #{index + 1} — {player.name}
              </span>
              <span>{player.time}</span>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            Play Again
          </button>

          <button
            className="bg-[#0f2735] hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

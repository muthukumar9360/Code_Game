import React, { useState } from "react";

const RoomLobby = () => {
  const roomCode = "BTX392"; // demo — replace with real room code
  const [players, setPlayers] = useState(["Kumar", "Ravi", "John"]); // demo data
  const isAdmin = true; // change to false to test player view

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="bg-white w-[600px] p-10 rounded-2xl shadow-2xl bg-opacity-95">

        {/* TITLE */}
        <h2 className="text-3xl font-extrabold text-center text-[#0f2735] mb-2 tracking-wide">
          Room <span className="text-orange-500">Lobby</span>
        </h2>

        {/* ROOM CODE */}
        <p className="text-center text-lg font-semibold text-gray-700 mb-6">
          Room Code: <span className="text-orange-600">{roomCode}</span>
        </p>

        {/* PLAYERS LIST */}
        <div className="bg-gray-100 p-5 rounded-xl shadow-inner mb-6">
          <h3 className="text-xl font-bold text-[#0f2735] mb-3">
            Players Joined
          </h3>

          <ul className="space-y-2">
            {players.map((p, index) => (
              <li
                key={index}
                className="bg-white border px-4 py-2 rounded-xl text-gray-800 font-semibold shadow-sm"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* ADMIN BUTTON / WAITING MESSAGE */}
        <div className="text-center">
          {isAdmin ? (
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-xl text-lg shadow-lg transition"
            >
              Start Contest
            </button>
          ) : (
            <p className="text-gray-700 font-semibold">
              Waiting for admin to start the contest…
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default RoomLobby;

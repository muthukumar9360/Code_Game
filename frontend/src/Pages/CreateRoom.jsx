import React, { useState } from "react";

const CreateRoom = () => {
  const [username, setUsername] = useState("");

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center 
                 bg-[#0f2735] bg-opacity-80"   // 🔥 CLEAN DARK BG WITH OPACITY
    >
      {/* Animated Title */}
      <h1 className="text-5xl font-extrabold text-white drop-shadow-xl mb-10 tracking-wide animate-pulse">
        Create Your <span className="text-orange-500">Battle Room</span>
      </h1>

      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 w-[450px] p-10 rounded-2xl shadow-2xl">

        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Host a Coding Contest
        </h2>

        <div className="flex flex-col gap-5">

          {/* Input */}
          <div>
            <label className="font-semibold text-white tracking-wide">
              Enter Your Name
            </label>

            <input
              type="text"
              placeholder="Ex: Sathish"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/80 border border-gray-300
                         outline-none focus:ring-4 focus:ring-orange-400 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Create Room Button */}
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3
                       rounded-xl text-lg transition shadow-lg hover:shadow-orange-500/50
                       hover:scale-105 active:scale-95"
          >
            Create Room
          </button>
        </div>

        {/* INFO SECTION */}
        <div className="mt-8 text-white text-sm opacity-90">
          <h3 className="font-bold text-lg mb-2">How It Works?</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Enter your name to become the host</li>
            <li>A unique room ID will be generated</li>
            <li>Share the ID with your friends</li>
            <li>Start the contest when everyone joins</li>
          </ul>
        </div>
      </div>

      <p className="text-white mt-10 text-sm opacity-80">
        Battlix – Compete. Learn. Win.
      </p>
    </div>
  );
};

export default CreateRoom;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter the room code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/battles/join-room/${roomCode.trim().toUpperCase()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to room lobby with room details
        navigate(`/room/${data.battle.roomId}`, {
          state: {
            battle: data.battle,
            isHost: false,
            username: username.trim()
          }
        });
      } else {
        setError(data.error || "Failed to join room");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center
                 bg-[#0f2735] bg-opacity-80"
    >
      {/* Animated Title */}
      <h1 className="text-5xl font-extrabold text-white drop-shadow-xl mb-10 tracking-wide animate-pulse">
        Join a <span className="text-orange-500">Battle Room</span>
      </h1>

      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 w-[450px] p-10 rounded-2xl shadow-2xl">

        {/* Sub Heading */}
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Enter Details to Join
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* Username */}
          <div>
            <label className="font-semibold text-white tracking-wide">
              Enter Your Name
            </label>
            <input
              type="text"
              placeholder="Ex: Muthu"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/80 border border-gray-300
                         outline-none focus:ring-4 focus:ring-orange-400 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Room Code */}
          <div>
            <label className="font-semibold text-white tracking-wide">
              Room Code
            </label>
            <input
              type="text"
              placeholder="Ex: BTX392"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/80 border border-gray-300
                         outline-none focus:ring-4 focus:ring-orange-400 transition-all uppercase"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
          </div>

          {/* Join Room Button */}
          <button
            onClick={handleJoinRoom}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400
                       text-white font-bold py-3 rounded-xl text-lg transition shadow-lg
                       hover:shadow-orange-500/50 hover:scale-105 active:scale-95
                       disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? "Joining Room..." : "⚔️ Join Room"}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-white text-sm opacity-90">
          <h3 className="font-bold text-lg mb-2">Before You Join</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Check the room code given by your host</li>
            <li>Make sure your internet connection is stable</li>
            <li>Once joined, wait for host to start the contest</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <p className="text-white mt-10 text-sm opacity-80">
        Battlix – Compete. Learn. Win.
      </p>
    </div>
  );
};

export default JoinRoom;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const [username, setUsername] = useState("");
  const [battleType, setBattleType] = useState("1vs1");
  const [tier, setTier] = useState("Bronze");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const battleTypes = [
    { value: "1vs1", label: "1 vs 1", description: "Classic head-to-head battle" },
    { value: "2vs2", label: "2 vs 2", description: "Team battle with 2 players each" },
    { value: "4vs4", label: "4 vs 4", description: "Large team battle with 4 players each" }
  ];

  const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError("Please enter your name");
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

      const response = await fetch("http://localhost:5000/api/battles/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          battleType,
          tier,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to room lobby with room details
        navigate(`/room/${data.battle.roomId}`, {
          state: {
            battle: data.battle,
            isHost: true,
            username: username.trim()
          }
        });
      } else {
        setError(data.error || "Failed to create room");
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
        Create Your <span className="text-orange-500">Battle Room</span>
      </h1>

      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 w-[500px] p-10 rounded-2xl shadow-2xl">

        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Host a Coding Contest
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* Username Input */}
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

          {/* Battle Type Selection */}
          <div>
            <label className="font-semibold text-white tracking-wide">
              Battle Type
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {battleTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    battleType === type.value
                      ? "border-orange-500 bg-orange-500/20 text-white"
                      : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="battleType"
                    value={type.value}
                    checked={battleType === type.value}
                    onChange={(e) => setBattleType(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm opacity-80">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <label className="font-semibold text-white tracking-wide">
              Difficulty Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/80 border border-gray-300
                         outline-none focus:ring-4 focus:ring-orange-400 transition-all"
            >
              {tiers.map((tierOption) => (
                <option key={tierOption} value={tierOption}>
                  {tierOption}
                </option>
              ))}
            </select>
          </div>

          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400
                       text-white font-bold py-3 rounded-xl text-lg transition shadow-lg
                       hover:shadow-orange-500/50 hover:scale-105 active:scale-95
                       disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Room..." : "Create Room"}
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

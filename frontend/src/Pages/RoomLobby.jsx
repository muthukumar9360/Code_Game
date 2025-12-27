import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RoomLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { battle, isHost, username } = location.state || {};

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (battle?.participants) {
      setPlayers(battle.participants.map(p => p.user));
    }
  }, [battle]);

  const handleStartBattle = async () => {
    if (!battle?.id) {
      setError("Battle data not available");
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

      const response = await fetch(`http://localhost:5000/api/battles/start/${battle.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to contest page
        navigate(`/contest/${battle.roomId}`, {
          state: {
            battle: data.battle,
            username
          }
        });
      } else {
        setError(data.error || "Failed to start battle");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Room Code: <span className="text-orange-600">{battle?.roomId || 'Loading...'}</span>
        </p>

        {/* PLAYERS LIST */}
        <div className="bg-gray-100 p-5 rounded-xl shadow-inner mb-6">
          <h3 className="text-xl font-bold text-[#0f2735] mb-3">
            Players Joined ({players.length})
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

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* ADMIN BUTTON / WAITING MESSAGE */}
        <div className="text-center">
          {isHost ? (
            <button
              onClick={handleStartBattle}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-xl text-lg shadow-lg transition"
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Contest"}
            </button>
          ) : (
            <p className="text-gray-700 font-semibold">
              Waiting for host to start the contest…
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default RoomLobby;

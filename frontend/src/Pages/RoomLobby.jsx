import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RoomLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { battle: initialBattle, isHost, username } = location.state || {};

  const [battle, setBattle] = useState(initialBattle);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_API_URL;

  // ✅ Update players whenever battle changes
  useEffect(() => {
    if (battle?.participants) {
      setPlayers(battle.participants.map(p => p.user));
    }
  }, [battle]);

  // ✅ Auto-clear error messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ✅ Poll room status every 3s so members know when host starts
  useEffect(() => {
    if (!battle?.roomId) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const res = await fetch(
          `${API}/api/battles/room/${battle.roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch room status:", res.status);
          return;
        }

        const data = await res.json();

        if (data.success && data.battle) {
          setBattle(data.battle);

          // ✅ Auto-redirect when active
          if (data.battle.status === "active") {
            clearInterval(interval);
            navigate(`/contest/${data.battle.roomId}`, {
              state: {
                battle: data.battle,
                username,
              },
            });
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Don't set error state for polling failures to avoid UI disruption
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [battle?.roomId, navigate, username]);

  // ✅ Host starts battle
  const handleStartBattle = async () => {
    // Validation checks
    if (!battle?.id) {
      setError("Battle data not available. Please try again.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/api/battles/start/${battle.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.battle) {
        setBattle(data.battle);

        // ✅ Redirect host immediately
        navigate(`/contest/${data.battle.roomId}`, {
          state: {
            battle: data.battle,
            username,
          },
        });
      } else {
        setError(data.error || data.message || "Failed to start battle");
      }
    } catch (err) {
      console.error("Start battle error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle missing state
  if (!initialBattle) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-center bg-cover"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="bg-white w-[600px] p-10 rounded-2xl shadow-2xl bg-opacity-95 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error: No Battle Data
          </h2>
          <p className="text-gray-700 mb-6">
            Battle information is missing. Please create or join a room first.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

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
          Room Code:{" "}
          <span className="text-orange-600 font-mono text-xl">
            {battle?.roomId || "Loading..."}
          </span>
        </p>

        {/* PLAYERS LIST */}
        <div className="bg-gray-100 p-5 rounded-xl shadow-inner mb-6">
          <h3 className="text-xl font-bold text-[#0f2735] mb-3">
            Players Joined ({players.length})
          </h3>

          {players.length > 0 ? (
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
          ) : (
            <p className="text-gray-500 text-center py-4">
              Waiting for players to join...
            </p>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* HOST BUTTON / WAITING MESSAGE */}
        <div className="text-center">
          {isHost ? (
            <button
              onClick={handleStartBattle}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-xl text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || players.length < 2}
            >
              {loading ? "Starting..." : "Start Contest"}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-700 font-semibold">
                Waiting for host to start the contest…
              </p>
            </div>
          )}
        </div>

        {/* MINIMUM PLAYERS WARNING */}
        {isHost && players.length < 2 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Waiting for at least 2 players to start...
          </p>
        )}

      </div>
    </div>
  );
};

export default RoomLobby;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserSecret, FaKey, FaShieldAlt, FaSatelliteDish, FaInfoCircle, FaEye, FaUserNinja } from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";

const JoinRoom = () => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Uplink Error: Room Code Missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session Expired: Re-authentication Required");
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await fetch(`${API}/api/battles/join-room/${roomCode.trim().toUpperCase()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          password: password.trim() || undefined 
        })
      });

      if (response.status === 401) {
        localStorage.clear();
        setError("Session expired or invalid token. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const data = await response.json();

      if (data.success) {
        if (data.battle?.status === "active") {
          navigate(`/contest/${data.battle.roomId || data.battle.id}`, {
            state: {
              battle: data.battle,
              isHost: Boolean(data.battle?.isHost),
              username: (username || "").trim()
            }
          });
        } else {
          navigate(`/room/${data.battle.roomId}`, {
            state: {
              battle: data.battle,
              isHost: Boolean(data.battle?.isHost),
              username: (username || "").trim()
            }
          });
        }
      } else {
        setError(data.error || "Uplink Failed: Invalid Room Code");
      }
    } catch (err) {
      setError("Critical Error: Transmission Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#050b10] text-white relative font-sans px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16">
      {/* BACKGROUND TECH ACCENTS */}
      <div className="fixed top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* TOP BAR WITH BACK BUTTON */}
      <div className="w-full max-w-[99%] mx-auto flex items-center justify-between mb-6 z-20">
        <BackButton to="/" label="Dashboard" />
        <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">
          JOIN ARENA // UPLINK
        </span>
      </div>

      {/* HEADER */}
      <div className="z-10 text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
          ENTER <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">ARENA</span>
        </h1>
      </div>

      {/* JOIN CARD */}
      <div className="z-10 relative group w-full max-w-xl">
        {/* Neon Border Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-[#0a1118]/90 backdrop-blur-3xl border-2 border-white/40 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-md mb-6 text-xs flex items-center gap-3 animate-shake">
              <FaShieldAlt className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* USERNAME INPUT */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold flex items-center gap-2 mb-3">
                <FaUserSecret /> Combatant Identity
              </label>
              <input
                type="text"
                placeholder="INPUT ALIAS..."
                className="w-full bg-black/50 border border-white/30 rounded-lg px-4 py-4 text-white outline-none focus:border-white transition-all font-mono tracking-widest"
                value={username}
                readOnly
                // onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* ROOM CODE INPUT */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold flex items-center gap-2 mb-3">
                <FaKey /> Access Keycode
              </label>
              <input
                type="text"
                placeholder="EX: BTX-77"
                className="w-full bg-black/50 border border-white/30 rounded-lg px-4 py-4 text-white outline-none focus:border-white transition-all font-mono text-xl tracking-[0.3em] uppercase placeholder:opacity-30"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
            </div>

            {/* OPTIONAL HACKATHON PASSCODE */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold flex items-center gap-2 mb-3">
                <FaShieldAlt /> Hackathon / Tournament Passcode (Optional)
              </label>
              <input
                type="password"
                placeholder="ENTER PASSWORD : "
                className="w-full bg-black/50 border border-white/30 rounded-lg px-4 py-3 text-white outline-none focus:border-white transition-all font-mono text-sm placeholder:text-gray-500 placeholder:opacity-30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 py-4 rounded-lg font-black text-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50 mt-3 border border-white/20"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? "LINKING..." : (
                  <>
                    <FaSatelliteDish className="animate-pulse" />
                    Connect to Room
                  </>
                )}
              </div>
              {/* Hover sweep effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;

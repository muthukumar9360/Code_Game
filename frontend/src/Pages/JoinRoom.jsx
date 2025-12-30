import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserSecret, FaKey, FaShieldAlt, FaSatelliteDish, FaInfoCircle } from "react-icons/fa";

const JoinRoom = () => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    // if (!username.trim()) {
    //   setError("Identification Required: Enter Alias");
    //   return;
    // }
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
        return;
      }

      const response = await fetch(`${API}/api/battles/join-room/${roomCode.trim().toUpperCase()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/room/${data.battle.roomId}`, {
          state: {
            battle: data.battle,
            isHost: false,
            username: username.trim()
          }
        });
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050b10] text-white relative overflow-hidden font-sans">
      
      {/* BACKGROUND TECH ACCENTS */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[130px] rounded-full"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

      {/* HEADER */}
      <div className="z-10 text-center mb-10">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          ENTER <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">ARENA</span>
        </h1>
        <p className="text-gray-500 tracking-[0.4em] text-[10px] mt-2 uppercase">Establish Remote Uplink Connection</p>
      </div>

      {/* JOIN CARD */}
      <div className="z-10 relative group">
        {/* Neon Border Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-[#0a1118]/90 backdrop-blur-3xl border border-white/10 w-[400px] md:w-[480px] p-10 rounded-2xl shadow-2xl">
          
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-md mb-6 text-xs flex items-center gap-3 animate-shake">
              <FaShieldAlt className="shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-8">
            {/* USERNAME INPUT */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-bold flex items-center gap-2 mb-3">
                <FaUserSecret /> Combatant Identity
              </label>
              <input
                type="text"
                placeholder="INPUT ALIAS..."
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all font-mono tracking-widest"
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
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono text-xl tracking-[0.3em] uppercase placeholder:opacity-30"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 py-4 rounded-lg font-black text-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50"
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

          {/* SYSTEM REQUIREMENTS */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-blue-400 mb-4">
              <FaInfoCircle size={12}/>
              <span className="text-[10px] font-black uppercase tracking-widest">Connection Protocol</span>
            </div>
            <ul className="space-y-2">
              {[
                "Verify access key with room host",
                "Ensure low-latency network state",
                "Ready compiler for deployment"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-tight">
                  <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FOOTER ACCENT */}
      <footer className="mt-12 text-[10px] text-gray-700 uppercase tracking-[0.6em] flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gray-900"></span>
        Secure_Uplink_Established
        <span className="w-8 h-[1px] bg-gray-900"></span>
      </footer>
    </div>
  );
};

export default JoinRoom;
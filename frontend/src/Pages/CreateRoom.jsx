import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTerminal, FaShieldAlt, FaRocket, FaInfoCircle } from "react-icons/fa";

const CreateRoom = () => {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [battleType, setBattleType] = useState("1vs1");
  const [tier, setTier] = useState("Bronze");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  

  const API = import.meta.env.VITE_API_URL;
  const battleTypes = [
    { value: "1vs1", label: "DUEL", description: "1 vs 1 / Head-to-Head" },
    { value: "2vs2", label: "SQUAD", description: "2 vs 2 / Tactical Team" },
    { value: "4vs4", label: "WARZONE", description: "4 vs 4 / Full Scale Battle" }
  ];

  const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

  const handleCreateRoom = async () => {
    // if (!username.trim()) {
    //   setError("Authorization Failed: Name Required");
    //   return;
    // }
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("System Error: No Session Token Found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API}/api/battles/create-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ battleType, tier }),
      });

      const data = await response.json();
      if (data.success) {
        navigate(`/room/${data.battle.roomId}`, {
          state: { battle: data.battle, isHost: true, username: username.trim() }
        });
      } else {
        setError(data.error || "Failed to initialize battle server");
      }
    } catch (err) {
      setError("Critical Error: Connection Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050b10] text-white relative overflow-hidden font-sans">
      
      {/* GLOBAL BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

      {/* HEADER SECTION */}
      <div className="z-10 text-center mb-8">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          INITIALIZE <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">BATTLE</span>
        </h1>
        <p className="text-gray-500 tracking-[0.3em] text-xs mt-2 uppercase">Establish Secure Coding Environment</p>
      </div>

      {/* MAIN CONSOLE (CARD) */}
      <div className="z-10 relative group">
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-[#0a1118]/90 backdrop-blur-2xl border border-white/10 w-[450px] md:w-[550px] p-8 rounded-2xl shadow-2xl">
          
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded mb-6 text-sm flex items-center gap-3">
              <FaShieldAlt /> {error}
            </div>
          )}

          <div className="space-y-6">
            {/* USERNAME FIELD */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-orange-500 font-bold flex items-center gap-2 mb-2">
                <FaTerminal /> Operator Alias
              </label>
              <input
                type="text"
                placeholder="INPUT NAME..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono"
                value={username}
                readOnly
                // onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* BATTLE TYPE SELECTION */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-3 block">Engagement Mode</label>
              <div className="grid grid-cols-1 gap-3">
                {battleTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setBattleType(type.value)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      battleType === type.value
                        ? "bg-orange-500/10 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-black italic tracking-tighter">{type.label}</div>
                      <div className="text-[10px] uppercase opacity-60 tracking-wider">{type.description}</div>
                    </div>
                    {battleType === type.value && <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* TIER SELECTION */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-2 block">System Difficulty</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-orange-500/50 transition-all text-sm appearance-none cursor-pointer"
              >
                {tiers.map((t) => (
                  <option key={t} value={t} className="bg-[#0a1118] text-white">{t.toUpperCase()} LEVEL</option>
                ))}
              </select>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="group relative w-full overflow-hidden bg-orange-500 py-4 rounded-lg font-black text-black tracking-widest uppercase hover:bg-orange-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "ESTABLISHING..." : <><FaRocket className="text-sm" /> DEPLOY ROOM</>}
              </div>
              {/* Button light sweep effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </button>
          </div>

          {/* QUICK INTEL SECTION */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-orange-500 mb-3">
              <FaInfoCircle size={12}/>
              <span className="text-[10px] font-black uppercase tracking-widest">Protocol Instructions</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-500 uppercase tracking-tighter font-medium">
                <div className="flex gap-2 items-start"><span className="text-orange-500">01</span><span>Host generates unique uplink ID</span></div>
                <div className="flex gap-2 items-start"><span className="text-orange-500">02</span><span>Distribute ID to squad members</span></div>
                <div className="flex gap-2 items-start"><span className="text-orange-500">03</span><span>Await connection of all operators</span></div>
                <div className="flex gap-2 items-start"><span className="text-orange-500">04</span><span>Synchronize to start engagement</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACCENT */}
      <div className="mt-12 text-[10px] text-gray-600 uppercase tracking-[0.5em] flex items-center gap-4">
        <span className="w-12 h-[1px] bg-gray-800"></span>
        Battlix OS v2.0.4 // Ready to Serve
        <span className="w-12 h-[1px] bg-gray-800"></span>
      </div>
    </div>
  );
};

export default CreateRoom;
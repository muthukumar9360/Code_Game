import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaCode,
  FaTrophy,
  FaUsers,
  FaBolt,
  FaDownload
} from "react-icons/fa";
import { io } from "socket.io-client";
import RankedMatchModal from "../Components/RankedMatchModal.jsx";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [rankedModalOpen, setRankedModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [userData, setUserData] = useState(null);

  const user = localStorage.getItem("username");
  const API = import.meta.env.VITE_API_URL;
  const socketRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (userId && token) {
      axios.get(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUserData(res.data))
      .catch(() => {});
    }
  }, [API]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socketRef.current = io(API, {
        auth: { token },
        transports: ["websocket", "polling"]
      });
    }

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [API]);

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b10] text-white relative overflow-hidden select-none font-sans">
      {/* FUTURISTIC BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="w-full py-4 flex justify-between items-center px-4 sm:px-6 md:px-8 backdrop-blur-md border-b border-white sticky top-0 z-50">
        <h1 className="text-3xl font-black tracking-tighter italic">
          BATT<span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">LIX</span>
        </h1>

        <div className="flex flex-wrap gap-3 sm:gap-6 items-center font-medium">
          {[
            { label: "Practise", path: "/problems" },
            { label: "Daily Challenge", path: "/daily-blitz" },
            { label: "Leaderboard", path: "/leaderboard" }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="relative transition-all duration-300 text-xs sm:text-sm hover:text-orange-400 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-orange-500 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all font-mono"
            >
              {item.label}
            </button>
          ))}

          {/* PWA INSTALL BUTTON (IF AVAILABLE) */}
          {installPrompt && (
            <button
              onClick={handleInstallPwa}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl text-xs font-mono font-bold transition hover:scale-105 active:scale-95"
              title="Install Battlix to your home screen"
            >
              <FaDownload size={10} /> Install App
            </button>
          )}

          {/* USER ICON */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full border-2 border-transparent hover:border-orange-500 transition-all duration-300"
            >
              <FaUserCircle size={28} className="text-gray-300" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-[#0f172a] border border-white/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
                {!user ? (
                  <>
                    <button onClick={() => navigate("/login")} className="w-full text-left px-4 py-3 hover:bg-white/5 transition text-xs">Login</button>
                    <button onClick={() => navigate("/signup")} className="w-full text-left px-4 py-3 hover:bg-white/5 transition text-xs">Sign Up</button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-white/20 bg-white/5">
                      <span className="text-[10px] text-gray-400 block font-mono">Logged in as</span>
                      <span className="font-bold text-orange-400 text-sm">{user}</span>
                    </div>
                    <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-3 hover:bg-white/5 transition text-xs">My Profile</button>
                    <button onClick={logout} className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 transition text-xs font-bold">Logout</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-col items-center justify-center grow text-center px-4 sm:px-6 z-10 py-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img src="/logo.jpg" alt="Logo" className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mb-3 relative border-2 border-white/40 shadow-2xl" />
        </div>

        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-4 tracking-tight uppercase">
          CODE. BATTLE. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
            CONQUER.
          </span>
        </h2>

        <p className="text-white text-sm sm:text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
          The Ultimate Arena for Elite Developers. Engage in Real-time Coding duels, Climb the Global Leaderboard, and Prove your Technical Supremacy.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap justify-center">
            {/* 1V1 RANKED LADDER BUTTON */}
            <button 
              onClick={() => setRankedModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 border border-white/40"
            >
             RANKED MATCH
            </button>

            <button 
              onClick={() => navigate("/create-room")}
              className="px-8 py-4 bg-white/10 border-2 border-white/40 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <FaCode /> Create Battle
            </button>

            <button 
              onClick={() => navigate("/join-room")}
              className="px-8 py-4 bg-white/5 border-2 border-white/40 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Join Arena
            </button>

            <button 
              onClick={() => navigate("/problems")}
              className="px-8 py-4 bg-orange-500/15 border-2 border-white/40 hover:bg-orange-500/25 text-orange-400 font-bold text-xs uppercase tracking-wider rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Practice Archive
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-gradient-to-r from-orange-600 to-orange-400 border border-white/40 rounded-full font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-orange-500/60 transition-all text-sm uppercase tracking-widest"
          >
            INITIALIZE SESSION
          </button>
        )}

        {/* STATS BARS */}
        <div className="grid grid-cols-3 gap-8 sm:gap-12 mt-10 text-white">
          <div className="flex flex-col items-center">
            <FaUsers size={22} className="mb-1 text-orange-500"/>
            <span className="text-[10px] uppercase font-mono tracking-widest text-white">Global Ladder</span>
          </div>
          <div className="flex flex-col items-center">
            <FaTrophy size={22} className="mb-1 text-orange-500"/>
            <span className="text-[10px] uppercase font-mono tracking-widest text-white">Tournaments</span>
          </div>
          <div className="flex flex-col items-center">
            <FaCode size={22} className="mb-1 text-orange-500"/>
            <span className="text-[10px] uppercase font-mono tracking-widest text-white">100+ Challenges</span>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full pb-2 pt-2 px-4 sm:px-6 md:px-8 flex justify-between items-center border-y border-white text-[10px] uppercase tracking-[0.2em] text-white font-mono">
        <span>© {new Date().getFullYear()} BATTLLIX</span>
        <div className="flex gap-4">
          <span className="hover:text-white cursor-pointer transition">Status: Online</span>
        </div>
      </footer>

      {/* 1V1 LIVE RANKED MATCHMAKING MODAL */}
      <RankedMatchModal
        socket={socketRef.current}
        isOpen={rankedModalOpen}
        onClose={() => setRankedModalOpen(false)}
        currentUsername={user || "Combatant"}
        rankedBattleXp={userData?.rankedBattleXp || 0}
      />
    </div>
  );
};

export default Home;
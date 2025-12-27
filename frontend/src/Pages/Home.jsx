import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaCode, FaTrophy, FaUsers } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    navigate(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b10] text-white relative overflow-hidden">
      
      {/* FUTURISTIC BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

      {/* NAVBAR */}
      <nav className="w-full py-5 flex justify-between items-center px-10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-3xl font-black tracking-tighter italic">
          BATT<span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">LIX</span>
        </h1>

        <div className="flex gap-8 items-center font-medium">
          {["Home", "Problems", "About"].map((item) => (
            <button
              key={item}
              onClick={() => navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`)}
              className="relative transition-all duration-300 hover:text-orange-400 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-orange-500 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all"
            >
              {item}
            </button>
          ))}

          {/* USER ICON */}
          <div className="relative">
            <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-full border-2 border-transparent hover:border-orange-500 transition-all duration-300"
            >
              <FaUserCircle size={32} className="text-gray-300" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {!user ? (
                  <>
                    <button onClick={() => navigate("/login")} className="w-full text-left px-4 py-3 hover:bg-white/5 transition">Login</button>
                    <button onClick={() => navigate("/signup")} className="w-full text-left px-4 py-3 hover:bg-white/5 transition">Sign Up</button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <span className="text-xs text-gray-400 block">Logged in as</span>
                        <span className="font-bold text-orange-400">{user}</span>
                    </div>
                    <button onClick={() => navigate("/profile")} className="w-full text-left px-4 py-3 hover:bg-white/5 transition">Profile</button>
                    <button onClick={logout} className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 transition">Logout</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-col items-center justify-center grow text-center px-6 z-10">
        <div className="relative group">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img src="/logo.jpg" alt="Logo" className="w-32 h-32 rounded-3xl mb-8 relative border border-white/10 shadow-2xl" />
        </div>

        <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
          CODE. BATTLE. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
            CONQUER.
          </span>
        </h2>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          The ultimate arena for elite developers. Engage in real-time coding duels, 
          climb the global leaderboard, and prove your technical supremacy.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={() => navigate("/create-room")}
              className="group relative px-8 py-4 bg-orange-500 text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FaCode /> CREATE BATTLE
              </span>
            </button>

            <button 
              onClick={() => navigate("/join-room")}
              className="px-8 py-4 bg-white/5 border border-white/20 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95"
            >
              JOIN ARENA
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-orange-500/60 transition-all"
          >
            INITIALIZE SESSION
          </button>
        )}

        {/* STATS BARS / TECH ACCENTS */}
        <div className="grid grid-cols-3 gap-12 mt-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center"><FaUsers size={24} className="mb-2 text-orange-500"/><span className="text-xs uppercase tracking-widest">Live Users</span></div>
            <div className="flex flex-col items-center"><FaTrophy size={24} className="mb-2 text-orange-500"/><span className="text-xs uppercase tracking-widest">Tournaments</span></div>
            <div className="flex flex-col items-center"><FaCode size={24} className="mb-2 text-orange-500"/><span className="text-xs uppercase tracking-widest">Challenges</span></div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 px-10 flex justify-between items-center border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-gray-500">
        <span>© {new Date().getFullYear()} BATTLLIX // GLOBAL_SYSTEMS</span>
        <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition">Status: Online</span>
            <span className="hover:text-white cursor-pointer transition">Server: Asia_01</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaShieldAlt, FaTerminal, FaServer, FaLock, FaCheckCircle, FaUserCheck } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import BackButton from "../Components/BackButton.jsx";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid Admin Credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUsername", data.admin?.username || username.trim());
      const decode = jwtDecode(data.token);
      localStorage.setItem("Role", decode.role || "admin");

      navigate("/admin/home");
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError("An error occurred during admin authorization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start bg-[#050b10] text-white p-4 sm:p-8 font-sans relative">
      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* TOP HEADER BAR */}
      <div className="w-full flex justify-between items-center mb-8 z-20 pb-4 border-b border-white/10">
        <BackButton to="/" label="Exit to Battlix Home" />
      </div>

      {/* FULL-WIDTH OPERATOR CONSOLE CONTAINER */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center items-center z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0a1118]/90 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          
          {/* LEFT SYSTEM HERO / OPERATOR CLEARANCE INFO (LG: 7 COLS) */}
          <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-10">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-mono uppercase tracking-widest px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4 shadow-sm">
                <FaShieldAlt /> Authorized Personnel Only
              </div>

              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight italic text-white mb-4">
                BATT<span className="text-orange-500">LIX</span> <span className="text-amber-500">ADMIN</span>
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                Full administrative gateway for the Battlix Competitive Ecosystem.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="bg-black/50 border border-white/10 p-3.5 rounded-2xl flex items-start gap-3">
                  <FaServer className="text-orange-400 mt-1 shrink-0 text-lg" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Problem Engineering</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Edit problem testcases, hints, topics, and descriptions live.</p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 p-3.5 rounded-2xl flex items-start gap-3">
                  <FaLock className="text-amber-500 mt-1 shrink-0 text-lg" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Arena Control</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Monitor multi-question contests, extend times, and oversee rooms.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 text-gray-300">
                <FaCheckCircle className="text-emerald-400" />
                <span>Database Verification: <strong className="text-emerald-400">Armed & Encrypted</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FaUserCheck className="text-emerald-400" />
                <span>Access Protocol: <strong className="text-orange-400">Zero-Trust Role Verification</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT LOGIN FORM (LG: 5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-mono uppercase tracking-widest mb-1">
                <FaTerminal /> Terminal Access
              </div>
              <h2 className="text-2xl font-black uppercase text-white">Operator Sign-In</h2>
              <p className="text-gray-400 text-xs">Enter your administrative credentials to continue</p>
            </div>

            {error && (
              <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-500 text-xs mb-5 flex items-center gap-2.5 animate-shake">
                <FaShieldAlt className="shrink-0 text-sm" />
                <span>{error}</span>
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleAdminLogin}>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1.5 font-mono">
                  Administrator Username
                </label>
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none font-mono text-sm transition"
                  required
                  autoFocus
                />
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1.5 font-mono">
                  Administrator Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-orange-500 rounded-xl px-4 py-3 text-white outline-none font-mono text-sm pr-12 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-gray-400 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-amber-400 text-white font-black font-mono text-sm uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Authorizing Operator..." : "Authorize Admin Access →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

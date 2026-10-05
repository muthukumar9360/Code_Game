import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaShieldAlt, FaTerminal } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import BackButton from "../Components/BackButton.jsx";

const AdminLogin = () => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
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
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid Admin Credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUsername", username);
      const decode = jwtDecode(data.token);
      localStorage.setItem("Role", decode.role);

      navigate("/admin/home");
    } catch (err) {
      console.error("Admin Login Error:", err);
      setError("An error occurred during admin authorization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050b10] text-white p-4 font-sans relative">
      {/* GLOWS */}
      <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-600/15 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/15 blur-[130px] rounded-full pointer-events-none"></div>

      {/* TOP BAR WITH BACK BUTTON */}
      <div className="w-full max-w-[420px] flex justify-start mb-6 z-20">
        <BackButton to="/" label="Exit to Home" />
      </div>

      <div className="w-full max-w-[420px] bg-[#0a1118]/90 border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-orange-400 text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-2">
            <FaTerminal /> Operator Core
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tight">
            ADMIN <span className="text-orange-500">TERMINAL</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1">Authenticate to access system operations</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs mb-4 flex items-center gap-2">
            <FaShieldAlt /> {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleAdminLogin}>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">
              Admin Username
            </label>
            <input
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 font-mono text-sm"
              required
            />
          </div>

          <div className="relative">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">
              Admin Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="e.g. admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 font-mono text-sm pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-8 text-gray-400 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="text-[10px] text-gray-500 font-mono bg-white/5 p-2.5 rounded-lg border border-white/5">
            Default credentials: <strong className="text-orange-400">admin</strong> / <strong className="text-orange-400">admin</strong>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-orange-500 hover:bg-orange-400 text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs transition active:scale-95 shadow-lg disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

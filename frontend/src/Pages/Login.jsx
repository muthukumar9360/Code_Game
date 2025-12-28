import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/api/users/login`, { name, password });

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("Role", "user");
        navigate("/");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b10] relative overflow-hidden text-white">

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

      {/* MAIN CARD */}
      <div className="relative z-10 flex w-[950px] h-[550px] rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl">

        {/* LEFT SIDE IMAGE */}
        <div className="w-1/2 relative">
          <img
            src="/logo.jpg"
            alt="Battlix Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-1/2 flex flex-col justify-center px-12 bg-[#050b10]">

          <h2 className="text-4xl font-black text-center mb-8 tracking-tight">
            LOGIN
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              SESSION
            </span>
          </h2>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

            {/* USERNAME */}
            <div>
              <label className="text-sm text-gray-400 font-semibold">
                Username or Email
              </label>
              <input
                type="text"
                value={name}
                placeholder="Enter username"
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none
                focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="text-sm text-gray-400 font-semibold">
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none
                focus:ring-2 focus:ring-orange-500 transition pr-12"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[44px] text-gray-400 cursor-pointer text-xl hover:text-orange-400 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="mt-4 px-6 py-4 bg-orange-500 text-black font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            >
              INITIALIZE SESSION
            </button>
          </form>

          {/* SIGNUP LINK */}
          <p className="text-gray-400 text-sm mt-8 text-center">
            New to Battlix?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-orange-400 font-bold cursor-pointer hover:underline"
            >
              Create Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

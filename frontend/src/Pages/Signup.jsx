import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`${API}/api/users/signup`, {
        fullname,
        username,
        email,
        password,
      });

      localStorage.setItem("username", response.data.user.username);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("Role", "user");

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b10] relative overflow-hidden text-white">

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

      {/* MAIN CARD */}
      <div className="relative z-10 flex w-[950px] h-[700px] rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl">

        {/* LEFT SIDE IMAGE */}
        <div className="w-1/2 relative">
          <img
            src="/logo.jpg"
            alt="Battlix Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-1/2 flex flex-col justify-center px-12 bg-[#050b10] mt-10">

          <h2 className="text-4xl font-black text-center mb-8 tracking-tight">
            CREATE
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              ACCOUNT
            </span>
          </h2>

          <form className="flex flex-col gap-5" onSubmit={handleSignup}>

            {/* FULL NAME */}
            <div>
              <label className="text-sm text-gray-400 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={fullname}
                placeholder="Enter full name"
                onChange={(e) => setFullname(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none
                focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            {/* USERNAME */}
            <div>
              <label className="text-sm text-gray-400 font-semibold">
                Username
              </label>
              <input
                type="text"
                value={username}
                placeholder="Choose username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none
                focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-400 font-semibold">
                Email
              </label>
              <input
                type="email"
                value={email}
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
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

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <label className="text-sm text-gray-400 font-semibold">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Re-enter password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none
                focus:ring-2 focus:ring-orange-500 transition pr-12"
              />

              <span
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-[44px] text-gray-400 cursor-pointer text-xl hover:text-orange-400 transition"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              className="mt-4 px-6 py-4 bg-orange-500 text-black font-bold rounded-full
              hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            >
              CREATE ACCOUNT
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="text-gray-400 text-sm mt-8 text-center">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-orange-400 font-bold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

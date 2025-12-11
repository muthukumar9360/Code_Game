import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`${API}`);
    try {
      const response = await axios.post(`${API}/login`, { name, password });
      console.log("API callled");
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else {
        alert("Login failed. Please check your credentials.");
      }
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[950px] h-[550px] shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Side - Full Cover Image */}
        <div className="w-1/2">
          <img
            src="/logo.jpg" // replace with your image
            alt="Battlix Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Clean White Login Form */}
        <div className="w-1/2 flex flex-col justify-center px-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
            Login
          </h2>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="font-semibold text-gray-700">
                Username or Email
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="relative">
              <label className="font-semibold text-gray-700">Password</label>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                          focus:ring-2 focus:ring-orange-400 pr-12"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[43px] text-gray-600 cursor-pointer text-xl"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-600 font-bold py-3 rounded-xl transition-all duration-300"
            >
              Login
            </button>
          </form>

          <p className="text-gray-600 text-sm mt-6 text-center">
            New to Battlix?{" "}
            <span
              className="text-orange-500 font-bold cursor-pointer"
              onClick={() => navigate("/signup")}
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

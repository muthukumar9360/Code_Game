import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

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
      const response = await axios.post(`${API}/signup`, {
        fullname,
        username,
        email,
        password,
      });

      // Store user data
      localStorage.setItem("username", response.data.user.username);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("token", response.data.token);

      navigate("/"); // go home
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[950px] h-[700px] shadow-2xl rounded-2xl overflow-hidden">
        {/* Left Side - Image */}
        <div className="w-1/2">
          <img
            src="/logo.jpg"
            alt="Battlix Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-1/2 flex flex-col justify-center px-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-wide">
            Create Account
          </h2>

          <form className="flex flex-col gap-6">
            {/* Full Name */}
            <div>
              <label className="font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Username */}
            <div>
              <label className="font-semibold text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-semibold text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="relative">
              <label className="font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
               focus:ring-2 focus:ring-orange-400 pr-12"
              />

              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[43px] text-gray-600 cursor-pointer text-xl"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-600 font-bold py-3 rounded-xl transition-all duration-300"
              onClick={handleSignup}
            >
              Sign Up
            </button>
          </form>

          <p className="text-gray-600 text-sm mt-6 text-center">
            Already have an account?{" "}
            <span
              className="text-orange-500 font-bold cursor-pointer"
              onClick={() => navigate("/login")}
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

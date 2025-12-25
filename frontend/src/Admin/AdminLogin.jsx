import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {FaEye,FaEyeSlash} from "react-icons/fa";
import {jwtDecode} from "jwt-decode";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const API=import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try{
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if(!res.ok){
        alert(data.message || "Admin Login Failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUsername", username);
      const decode=jwtDecode(data.token);
      console.log(decode.role);
      localStorage.setItem("Role", decode.role);

      console.log(data.token);
      alert("Admin Login Successful");
      navigate("/Admin/home");
    }
    catch(err){
      console.error("Admin Login Error:", err);
      alert("An error occurred during admin login");
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[400px] bg-white p-8 rounded-xl shadow-xl">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Admin Login
        </h2>

        <form className="flex flex-col gap-5" onSubmit={handleAdminLogin}>

          <div>
            <label className="font-semibold text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <label className="font-semibold text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 pr-12"
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
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;

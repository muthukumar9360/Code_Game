import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const AdminHome = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const adminToken = localStorage.getItem("adminToken");
  const adminUsername = localStorage.getItem("adminUsername");

  // 🔒 Admin Route Protection
  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    try {
      const decoded = jwtDecode(adminToken);
      if (decoded.role !== "admin") {
        navigate("/admin/login");
      }
    } catch (err) {
      navigate("/admin/login");
    }
  }, [adminToken, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("Role");
    navigate("/admin/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* NAVBAR */}
      <nav className="w-full py-5 flex justify-between items-center px-10 bg-[#0f2735] bg-opacity-80 shadow-md">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          BATT<span className="text-orange-500">LIX</span>
          <span className="text-sm ml-2 text-orange-400">(Admin)</span>
        </h1>

        <div className="flex gap-8 items-center text-white font-semibold text-lg">
          <button onClick={() => navigate("/admin/home")} className="hover:text-orange-400 transition">
            Home
          </button>
          <button onClick={() => navigate("/admin/problems")} className="hover:text-orange-400 transition">
            Problems
          </button>
          <button onClick={() => navigate("/admin/users")} className="hover:text-orange-400 transition">
            Users
          </button>

          {/* ADMIN ICON DROPDOWN */}
          <div className="relative">
            <FaUserCircle
              size={38}
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer hover:text-orange-400 transition"
            />

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-[#0f2735] rounded-xl shadow-lg overflow-hidden z-50">
                <p className="px-4 py-3 font-semibold border-b">
                  {adminUsername}
                </p>

                <button
                  onClick={() => navigate("/admin/createprogram")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-medium"
                >
                  Create Problem
                </button>

                <button
                  onClick={() => navigate("/admin/problems")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-medium"
                >
                  Manage Problems
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-medium text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CENTER CONTENT */}
      <div className="flex flex-col items-center justify-center grow text-center px-4">
        <img
          src="/logo.jpg"
          alt="Battlix Logo"
          className="w-40 mb-5 drop-shadow-xl"
        />

        <h2 className="text-5xl font-extrabold text-[#0f2735] mb-3 tracking-wide">
          Welcome Admin
        </h2>

        <p className="text-lg text-gray-700 font-semibold mb-10 max-w-[600px]">
          Manage coding problems, users, and platform settings.
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <button
            onClick={() => navigate("/admin/createprogram")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
          >
            Create Problem
          </button>

          <button
            onClick={() => navigate("/admin/problems")}
            className="bg-[#0f2735] hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
          >
            View Problems
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 bg-[#0f2735] text-white text-sm font-medium">
        © {new Date().getFullYear()} Battlix Admin Panel.
      </footer>
    </div>
  );
};

export default AdminHome;

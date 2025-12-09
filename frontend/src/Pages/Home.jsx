import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      className="min-h-screen flex flex-col bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }} 
    >

      {/* NAVBAR */}
      <nav className="w-full py-5 flex justify-between items-center px-10 bg-[#0f2735] bg-opacity-80 shadow-md">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          BATT<span className="text-orange-500">LIX</span>
        </h1>

        <div className="flex gap-8 items-center text-white font-semibold text-lg">
          <a href="#" className="hover:text-orange-400 transition">Home</a>
          <a href="#" className="hover:text-orange-400 transition">About</a>
          <a href="#" className="hover:text-orange-400 transition">Contact</a>

          {/* USER ICON BUTTON WITH DROPDOWN */}
          <div className="relative">
            <FaUserCircle
              size={38}
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer hover:text-orange-400 transition"
            />

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-[#0f2735] rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 font-medium"
                >
                  Sign Up
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
          Welcome to <span className="text-orange-500">Battlix</span>
        </h2>

        <p className="text-lg text-gray-700 font-semibold mb-10 max-w-[600px]">
          Compete with coders around the world. Create rooms, join battles, and earn points and rank.
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => navigate("/create-room")}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
          >
            Create Room
          </button>

          <button
            onClick={() => navigate("/join-room")}
            className="bg-[#0f2735] hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition"
          >
            Join Room
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 bg-[#0f2735] text-white text-sm font-medium">
        © {new Date().getFullYear()} Battlix. All Rights Reserved.
      </footer>

    </div>
  );
};

export default Home;

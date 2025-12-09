import React, { useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SplashScreen = ({ onFinish }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-gray-100 flex flex-col">
      {/* NAVBAR */}
      <nav className="w-full py-5 flex justify-between items-center px-10 bg-[#0f2735] bg-opacity-80 shadow-md">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          BATT<span className="text-orange-500">LIX</span>
        </h1>

        <div className="flex gap-8 items-center text-white font-semibold text-lg">
          <a href="#" className="hover:text-orange-400 transition">
            Home
          </a>
          <a href="#" className="hover:text-orange-400 transition">
            About
          </a>
          <a href="#" className="hover:text-orange-400 transition">
            Contact
          </a>

          <FaUserCircle
            size={38}
            onClick={() => navigate("/login")}
            className="cursor-pointer hover:text-orange-400 transition"
          />
        </div>
      </nav>

      {/* CENTER CONTENT VIDEO */}
      <div className="flex flex-col items-center relative">
        <div className="relative w-[90%] h-[50%] rounded-2xl overflow-hidden mt-10">
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/coding.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Loading text below video */}
        <div className="mt-6 flex flex-col items-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-blue-500 mt-3 font-bold text-lg tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

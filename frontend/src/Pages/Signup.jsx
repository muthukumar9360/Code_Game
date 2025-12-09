import React from "react";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[950px] h-[600px] shadow-2xl rounded-2xl overflow-hidden">

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
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-semibold text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                           focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-600 font-bold py-3 rounded-xl transition-all duration-300"
            >
              Sign Up
            </button>
          </form>

          <p className="text-gray-600 text-sm mt-6 text-center">
            Already have an account?{" "}
            <span className="text-orange-500 font-bold cursor-pointer">
              Login
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";

const ContestPage = () => {
  const [code, setCode] = useState("");

  return (
    <div
      className="min-h-screen flex flex-col bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >

      {/* TOP BAR */}
      <div className="w-full py-5 px-10 bg-[#0f2735] bg-opacity-80 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white">
          BATT<span className="text-orange-500">LIX</span> Contest
        </h1>

        {/* TIMER */}
        <div className="bg-orange-500 text-white font-bold text-xl px-5 py-2 rounded-xl shadow-lg">
          09:58
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex p-6 gap-6">

        {/* LEFT SIDE – PROBLEM STATEMENT */}
        <div className="w-1/2 bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl overflow-auto">
          <h2 className="text-2xl font-bold text-[#0f2735] mb-4">
            Problem: <span className="text-orange-500">Reverse a String</span>
          </h2>

          <p className="text-gray-700 font-medium leading-relaxed mb-4">
            You are given a string <b>S</b>. Write a program to reverse the string without using built-in reverse functions.
          </p>

          <div className="bg-gray-100 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-[#0f2735]">Example Input:</h3>
            <pre className="text-gray-800">hello</pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <h3 className="font-bold text-[#0f2735]">Example Output:</h3>
            <pre className="text-gray-800">olleh</pre>
          </div>
        </div>

        {/* RIGHT SIDE – CODE EDITOR */}
        <div className="w-1/2 bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl flex flex-col">
          <h2 className="text-2xl font-bold text-[#0f2735] mb-4">
            Your Code
          </h2>

          {/* Simple text-area editor */}
          <textarea
            className="flex grow w-full p-4 border rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="// Type your solution here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          ></textarea>

          {/* SUBMIT BUTTON */}
          <button
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition"
          >
            Submit Code
          </button>
        </div>

      </div>
    </div>
  );
};

export default ContestPage;

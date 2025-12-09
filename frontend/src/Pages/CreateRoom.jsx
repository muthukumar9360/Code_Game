import React, { useState } from "react";

const CreateRoom = () => {
  const [username, setUsername] = useState("");

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="bg-white w-[450px] p-10 rounded-2xl shadow-2xl bg-opacity-95">

        <h2 className="text-3xl font-extrabold text-center text-[#0f2735] mb-6 tracking-wide">
          Create <span className="text-orange-500">Room</span>
        </h2>

        <div className="flex flex-col gap-5">

          <div>
            <label className="font-semibold text-gray-700">Enter Your Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full mt-1 px-4 py-3 border rounded-xl outline-none
                         focus:ring-2 focus:ring-orange-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-lg"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;

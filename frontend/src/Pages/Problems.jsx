import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API}/api/problems`);
      setProblems(res.data.data);
    } catch (err) {
      alert("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-xl font-bold">Loading Problems...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-[#0f2735] mb-8">
        Practice Problems
      </h1>

      <div className="grid gap-5">
        {problems.map((p) => (
          <div
            key={p._id}
            className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#0f2735]">
                {p.title}
              </h2>
              <p className="text-gray-500 text-sm">Slug: {p.slug}</p>

              <div className="flex gap-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    p.difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : p.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {p.difficulty}
                </span>

                {p.topics.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate(`/problems/${p.slug}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl"
            >
              Solve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Problems;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API}/api/problems/admin/allproblems`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",

        },
      });
      setProblems(res.data.data);
    } catch (error) {
      alert("Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-xl font-bold">Loading Problems...</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#0f2735]">
          Admin – Problems
        </h1>

        <button
          onClick={() => navigate("/admin/createprogram")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          <FaPlus /> Create Problem
        </button>
      </div>

      {/* Problem List */}
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
              <p className="text-gray-600 mt-1">
                Slug: {p.slug}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
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

            {/* Action buttons (future use) */}
            <div className="flex gap-3">
              <button
                className="px-4 py-2 border rounded-lg font-semibold"
                onClick={() => navigate(`/admin/problems/edit/${p.slug}`)}
              >
                Edit
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProblems;

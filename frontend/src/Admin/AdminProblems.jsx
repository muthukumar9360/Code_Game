import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaArrowLeft, FaCode, FaSearch, FaBrain } from "react-icons/fa";

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    fetchProblems();
  }, [adminToken, navigate]);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API}/api/problems/admin/allproblems`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });
      setProblems(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch admin problems:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete problem "${title}"?`)) return;

    try {
      await axios.delete(`${API}/api/problems/admin/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setProblems(problems.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete problem: " + (err.response?.data?.error || err.message));
    }
  };

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-4 py-4 font-sans relative overflow-hidden">
      {/* GLOWS */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[99%] mx-auto relative z-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/home")}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase transition"
            >
              <FaArrowLeft /> Dashboard
            </button>
            <span className="text-gray-600">|</span>
            <h1 className="text-2xl font-black italic tracking-tight">
              BATT<span className="text-orange-500">LIX</span> <span className="text-xs text-orange-400 font-mono">(ADMIN REPOSITORY)</span>
            </h1>
          </div>

          <button
            onClick={() => navigate("/admin/createprogram")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <FaPlus /> Create Problem
          </button>
        </div>

        {/* SEARCH AND TITLE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">
              PROBLEM <span className="text-orange-500">DATABASE</span>
            </h2>
            <p className="text-gray-400 text-xs font-mono mt-1">
              Active Challenges: {problems.length} Problems
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1118] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 font-mono transition"
            />
          </div>
        </div>

        {/* PROBLEM CARDS */}
        {loading ? (
          <div className="p-16 text-center text-orange-400 font-mono animate-pulse">
            LOADING_CHALLENGE_CATALOG...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-500 font-mono bg-[#0a1118]/50 rounded-2xl border border-white/5">
            No problems match your query.
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="bg-[#0a1118]/80 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-orange-500/30 transition shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 shrink-0 mt-1 sm:mt-0">
                    <FaCode />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{p.title}</h3>
                    <div className="text-xs font-mono text-gray-500 mb-2">
                      Slug: /{p.slug} | Testcases: {p.testcases?.length || 0}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          p.difficulty === "easy"
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : p.difficulty === "medium"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                      {(p.topics || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono flex items-center gap-1"
                        >
                          <FaBrain size={9} className="text-blue-400" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => handleDeleteProblem(p._id, p.title)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition active:scale-95"
                    title="Delete Problem"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProblems;

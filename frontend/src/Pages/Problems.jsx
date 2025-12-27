import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTerminal, FaCode, FaBrain, FaChevronRight } from "react-icons/fa";

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
      console.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-orange-500 font-mono tracking-widest animate-pulse">
          FETCHING_DATA_PACKETS...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b10] text-white p-6 md:p-12 relative overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <FaTerminal size={20} />
            <span className="font-mono text-sm tracking-widest uppercase">System // Database</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">
            PRACTICE <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">MODULES</span>
          </h1>
        </header>

        {/* LIST CONTAINER */}
        <div className="space-y-4">
          {problems.map((p) => (
            <div
              key={p._id}
              className="group bg-[#0a1118]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center transition-all duration-300 hover:border-orange-500/50 hover:bg-[#0f172a]/90 hover:shadow-[0_0_25px_rgba(249,115,22,0.1)]"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                {/* ICON INDICATOR */}
                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/5 items-center justify-center border border-white/10 group-hover:border-orange-500/50 group-hover:text-orange-500 transition-all">
                  <FaCode size={20} />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight group-hover:text-orange-400 transition-colors">
                    {p.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {/* DIFFICULTY BADGE */}
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        p.difficulty === "easy"
                          ? "bg-green-500/10 border-green-500/40 text-green-400"
                          : p.difficulty === "medium"
                          ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                          : "bg-red-500/10 border-red-500/40 text-red-400"
                      }`}
                    >
                      {p.difficulty}
                    </span>

                    {/* TOPICS */}
                    {p.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1"
                      >
                        <FaBrain size={10} className="text-blue-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => navigate(`/problems/${p.slug}`)}
                className="mt-6 md:mt-0 w-full md:w-auto bg-white text-black font-black px-8 py-3 rounded-lg flex items-center justify-center gap-2 group-hover:bg-orange-500 group-hover:text-white transition-all active:scale-95"
              >
                SOLVE <FaChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {problems.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <p className="text-gray-500 font-mono italic">NO MISSIONS DETECTED IN THIS SECTOR.</p>
          </div>
        )}
      </div>

      {/* FOOTER ACCENT */}
      <footer className="mt-20 text-center py-10 border-t border-white/5 opacity-40">
        <p className="text-[10px] tracking-[0.5em] uppercase">Battlix Neural Network // Active</p>
      </footer>
    </div>
  );
};

export default Problems;
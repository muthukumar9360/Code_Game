import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaArrowLeft,
  FaCode,
  FaSearch,
  FaBrain,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProblem, setEditingProblem] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // Form fields for editing
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("easy");
  const [editDescription, setEditDescription] = useState("");
  const [editTopics, setEditTopics] = useState("");
  const [editConstraints, setEditConstraints] = useState("");
  const [editExamples, setEditExamples] = useState([]);
  const [editTestcases, setEditTestcases] = useState([]);
  const [editHint1, setEditHint1] = useState("");
  const [editHint2, setEditHint2] = useState("");
  const [editHint3, setEditHint3] = useState("");

  const API = import.meta.env.VITE_API_URL;
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    fetchProblems();
  }, [adminToken, navigate]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

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
      showToast(`Problem "${title}" deleted successfully.`);
    } catch (err) {
      alert("Failed to delete problem: " + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenEdit = (prob) => {
    setEditingProblem(prob);
    setEditTitle(prob.title || "");
    setEditSlug(prob.slug || "");
    setEditDifficulty((prob.difficulty || "easy").toLowerCase());
    setEditDescription(prob.description || "");
    setEditTopics(Array.isArray(prob.topics) ? prob.topics.join(", ") : "");
    setEditConstraints(Array.isArray(prob.constraints) ? prob.constraints.join("\n") : "");

    // Examples
    const exList = (prob.examples || []).map(ex => ({
      input: ex.input || "",
      output: ex.output || "",
      explanation: ex.explanation || ""
    }));
    setEditExamples(exList.length > 0 ? exList : [{ input: "", output: "", explanation: "" }]);

    // Testcases
    const tcList = (prob.testcases || []).map(tc => ({
      input: tc.input || "",
      output: tc.output || "",
      hidden: Boolean(tc.hidden)
    }));
    setEditTestcases(tcList.length > 0 ? tcList : [{ input: "", output: "", hidden: false }]);

    // Hints
    setEditHint1(prob.hints?.hint1 || "");
    setEditHint2(prob.hints?.hint2 || "");
    setEditHint3(prob.hints?.hint3 || "");
  };

  const handleSaveProblemEdit = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;

    setSavingEdit(true);
    try {
      const parsedTopics = editTopics
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const parsedConstraints = editConstraints
        .split("\n")
        .map(c => c.trim())
        .filter(Boolean);

      const payload = {
        title: editTitle.trim(),
        slug: editSlug.trim(),
        difficulty: editDifficulty,
        description: editDescription.trim(),
        topics: parsedTopics,
        constraints: parsedConstraints,
        examples: editExamples.filter(ex => ex.input.trim() || ex.output.trim()),
        testcases: editTestcases.filter(tc => tc.input !== "" || tc.output !== ""),
        hints: {
          hint1: editHint1.trim(),
          hint2: editHint2.trim(),
          hint3: editHint3.trim()
        }
      };

      const res = await axios.put(
        `${API}/api/problems/admin/${editingProblem._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (res.data?.success) {
        showToast(`✅ Problem "${editTitle}" updated successfully across all sections!`);
        // Update in local state
        setProblems(prev =>
          prev.map(p => (p._id === editingProblem._id ? res.data.data : p))
        );
        setEditingProblem(null);
      }
    } catch (err) {
      console.error("Save problem edit error:", err);
      alert("Failed to update problem: " + (err.response?.data?.error || err.message));
    } finally {
      setSavingEdit(false);
    }
  };

  // Example array helpers
  const handleAddExample = () => {
    setEditExamples([...editExamples, { input: "", output: "", explanation: "" }]);
  };

  const handleRemoveExample = (idx) => {
    setEditExamples(editExamples.filter((_, i) => i !== idx));
  };

  const handleExampleChange = (idx, field, val) => {
    const updated = [...editExamples];
    updated[idx][field] = val;
    setEditExamples(updated);
  };

  // Testcase array helpers
  const handleAddTestcase = () => {
    setEditTestcases([...editTestcases, { input: "", output: "", hidden: false }]);
  };

  const handleRemoveTestcase = (idx) => {
    setEditTestcases(editTestcases.filter((_, i) => i !== idx));
  };

  const handleTestcaseChange = (idx, field, val) => {
    const updated = [...editTestcases];
    updated[idx][field] = val;
    setEditTestcases(updated);
  };

  const filtered = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-6 py-6 font-sans relative overflow-x-hidden">
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black font-black font-mono text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <FaCheckCircle /> {notification}
        </div>
      )}

      <div className="w-full max-w-[99%] mx-auto relative z-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/home")}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase transition cursor-pointer"
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
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <FaPlus /> Create New Problem
          </button>
        </div>

        {/* SEARCH AND TITLE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">
              PROBLEM <span className="text-orange-500">MANAGEMENT</span>
            </h2>
            <p className="text-gray-400 text-xs font-mono mt-1">
              Live Challenges Catalog: {problems.length} Problems Registered
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1118] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-orange-500 font-mono transition"
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
          <div className="grid gap-3">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="bg-[#0a1118]/80 border border-white/10 hover:border-orange-500/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition shadow-lg backdrop-blur-md"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 mt-1 sm:mt-0 text-base">
                    <FaCode />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{p.title}</h3>
                    <div className="text-xs font-mono text-gray-400 mb-2">
                      Slug: <span className="text-orange-400 font-bold">/{p.slug}</span> | Tests: {p.testcases?.length || 0} | Examples: {p.examples?.length || 0}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
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
                          className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono flex items-center gap-1"
                        >
                          <FaBrain size={9} className="text-blue-400" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACTION CONTROLS: EDIT AND DELETE */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/40 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold font-mono cursor-pointer"
                    title="Edit all sections of this problem"
                  >
                    <FaEdit /> Edit Problem
                  </button>

                  <button
                    onClick={() => handleDeleteProblem(p._id, p.title)}
                    className="p-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition active:scale-95 cursor-pointer"
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

      {/* FULL EDIT PROBLEM MODAL (EDIT ALL SECTIONS) */}
      {editingProblem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-[#0a1118] border-2 border-orange-500/50 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center pb-4 border-b border-white/15 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
                  <FaEdit size={18} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    Edit Problem Specifications
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {editingProblem._id} // Full Admin Section Control
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingProblem(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <form onSubmit={handleSaveProblemEdit} className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-6">
              {/* ROW 1: TITLE, SLUG, DIFFICULTY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                    Slug (URL identifier) *
                  </label>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                    Difficulty Tier *
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 font-mono capitalize"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* ROW 2: TOPICS & CONSTRAINTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                    Topics (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arrays, Two Pointers, Dynamic Programming"
                    value={editTopics}
                    onChange={(e) => setEditTopics(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                    Constraints (One per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 1 <= n <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
                    value={editConstraints}
                    onChange={(e) => setEditConstraints(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* ROW 3: DESCRIPTION */}
              <div>
                <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1">
                  Problem Description *
                </label>
                <textarea
                  rows={6}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 font-mono leading-relaxed"
                />
              </div>

              {/* SECTION: EXAMPLES */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-orange-400">
                    Public Verification Examples ({editExamples.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-mono font-bold hover:bg-orange-500/30 cursor-pointer"
                  >
                    + Add Example
                  </button>
                </div>

                <div className="space-y-3">
                  {editExamples.map((ex, idx) => (
                    <div key={idx} className="bg-black/50 border border-white/10 p-3 rounded-xl relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                          Example #{idx + 1}
                        </span>
                        {editExamples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(idx)}
                            className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <div>
                          <span className="text-[10px] text-gray-500 font-mono block">Input:</span>
                          <input
                            type="text"
                            value={ex.input}
                            onChange={(e) => handleExampleChange(idx, "input", e.target.value)}
                            className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 font-mono block">Output:</span>
                          <input
                            type="text"
                            value={ex.output}
                            onChange={(e) => handleExampleChange(idx, "output", e.target.value)}
                            className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">Explanation (optional):</span>
                        <input
                          type="text"
                          value={ex.explanation}
                          onChange={(e) => handleExampleChange(idx, "explanation", e.target.value)}
                          className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: TESTCASES */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-orange-400">
                    Judge Testcases ({editTestcases.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddTestcase}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-mono font-bold hover:bg-orange-500/30 cursor-pointer"
                  >
                    + Add Testcase
                  </button>
                </div>

                <div className="space-y-3">
                  {editTestcases.map((tc, idx) => (
                    <div key={idx} className="bg-black/50 border border-white/10 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                          Testcase #{idx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-[11px] text-gray-300 font-mono cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.hidden}
                              onChange={(e) => handleTestcaseChange(idx, "hidden", e.target.checked)}
                              className="accent-orange-500 cursor-pointer"
                            />
                            Hidden (Private)
                          </label>
                          {editTestcases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTestcase(idx)}
                              className="text-red-400 hover:text-red-300 text-xs cursor-pointer ml-2"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-gray-500 font-mono block">Standard Input:</span>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) => handleTestcaseChange(idx, "input", e.target.value)}
                            className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 font-mono block">Expected Output:</span>
                          <textarea
                            rows={2}
                            value={tc.output}
                            onChange={(e) => handleTestcaseChange(idx, "output", e.target.value)}
                            className="w-full bg-black/70 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: HINTS */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-orange-400 mb-2">
                  Algorithmic Hints
                </h4>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono block mb-1">Hint 1:</span>
                  <input
                    type="text"
                    value={editHint1}
                    onChange={(e) => setEditHint1(e.target.value)}
                    placeholder="Initial nudge or data structure suggestion"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono block mb-1">Hint 2:</span>
                  <input
                    type="text"
                    value={editHint2}
                    onChange={(e) => setEditHint2(e.target.value)}
                    placeholder="Intermediate algorithmic pattern"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono block mb-1">Hint 3:</span>
                  <input
                    type="text"
                    value={editHint3}
                    onChange={(e) => setEditHint3(e.target.value)}
                    placeholder="Near-solution or edge-case hint"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProblem(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <FaSave /> {savingEdit ? "Saving Changes..." : "Save Problem Specifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblems;

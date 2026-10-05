import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCode,
  FaTerminal,
  FaPlus,
  FaTrash,
  FaSave,
  FaLightbulb,
  FaBuilding,
  FaLayerGroup,
  FaCheckCircle,
  FaShieldAlt
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";

const CreateProgram = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    slug: "",
    title: "",
    difficulty: "easy",
    description: "",
    examples: [{ input: "", output: "", explanation: "" }],
    constraints: [""],
    topics: ["Arrays & Hashing"],
    companies: ["Google"],
    hints: { h1: "", h2: "", h3: "" },
    testcases: [
      { input: "", output: "", hidden: false },
      { input: "", output: "", hidden: true }
    ],
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const TOPIC_PRESETS = [
    "Arrays & Hashing",
    "Two Pointers",
    "Sliding Window",
    "Stack & Queue",
    "Binary Search",
    "Linked Lists",
    "Trees & BST",
    "Graphs & BFS/DFS",
    "Dynamic Programming",
    "Greedy Algorithms"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateSlugFromTitle = () => {
    if (form.title) {
      const generated = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm({ ...form, slug: generated });
    }
  };

  const handleNestedChange = (section, index, field, value) => {
    const updated = [...form[section]];
    updated[index][field] = value;
    setForm({ ...form, [section]: updated });
  };

  const handleSimpleArrayChange = (section, index, value) => {
    const updated = [...form[section]];
    updated[index] = value;
    setForm({ ...form, [section]: updated });
  };

  const addField = (section, template) => {
    setForm({ ...form, [section]: [...form[section], template] });
  };

  const removeField = (section, index) => {
    if (form[section].length > 1) {
      const updated = form[section].filter((_, i) => i !== index);
      setForm({ ...form, [section]: updated });
    }
  };

  const handleHintChange = (key, value) => {
    setForm({ ...form, hints: { ...form.hints, [key]: value } });
  };

  const submitProblem = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.slug.trim() || !form.title.trim() || !form.description.trim()) {
      setErrorMsg("Slug, title, and description are strictly required.");
      return;
    }

    if (form.testcases.some((tc) => !tc.input.trim() || !tc.output.trim())) {
      setErrorMsg("Every testcase must have non-empty input and output.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`${API}/api/problems/createProblem`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccessMsg(`Problem "${form.title}" added to database successfully!`);
      // Reset form
      setForm({
        slug: "",
        title: "",
        difficulty: "easy",
        description: "",
        examples: [{ input: "", output: "", explanation: "" }],
        constraints: [""],
        topics: ["Arrays & Hashing"],
        companies: ["Google"],
        hints: { h1: "", h2: "", h3: "" },
        testcases: [
          { input: "", output: "", hidden: false },
          { input: "", output: "", hidden: true }
        ],
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to create problem in database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-4 py-4 font-sans relative">
      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[99%] mx-auto relative z-10 space-y-6">
        {/* TOP BAR WITH BACK BUTTON */}
        <div className="flex items-center justify-between mb-4">
          <BackButton to="/admin/home" label="Admin Dashboard" />
          <span className="text-xs uppercase tracking-widest text-orange-400 font-mono">
            ADMIN // PROBLEM_CREATOR_NODE
          </span>
        </div>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-tight uppercase italic">
            CREATE <span className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">CODING CHALLENGE</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
            Author and publish new problems directly into MongoDB arena registry
          </p>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <FaShieldAlt /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-green-500/15 border border-green-500/40 rounded-xl text-green-300 text-xs flex items-center gap-2">
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-[#0a1118]/90 border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6 backdrop-blur-md">
          {/* TITLE & SLUG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                Problem Title
              </label>
              <input
                name="title"
                placeholder="e.g. Valid Parentheses"
                value={form.title}
                onChange={handleChange}
                onBlur={generateSlugFromTitle}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">
                  Problem Slug (Unique)
                </label>
                <button
                  type="button"
                  onClick={generateSlugFromTitle}
                  className="text-[10px] text-gray-400 hover:text-orange-400 underline"
                >
                  Auto-generate
                </button>
              </div>
              <input
                name="slug"
                placeholder="e.g. valid-parentheses"
                value={form.slug}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-orange-300 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* DIFFICULTY & PRESET CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                Primary Category
              </label>
              <select
                onChange={(e) => {
                  if (!form.topics.includes(e.target.value)) {
                    setForm({ ...form, topics: [...form.topics, e.target.value] });
                  }
                }}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500"
              >
                <option value="">-- Add Preset Topic --</option>
                {TOPIC_PRESETS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="State the algorithmic problem, input constraints, and desired output requirements..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs md:text-sm text-white outline-none focus:border-orange-500 leading-relaxed font-sans"
            ></textarea>
          </div>

          {/* EXAMPLES */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-orange-400 font-bold">
                Examples & Test Cases
              </label>
              <button
                type="button"
                onClick={() => addField("examples", { input: "", output: "", explanation: "" })}
                className="flex items-center gap-1 text-[11px] px-3 py-1 bg-white/5 hover:bg-white/10 text-orange-400 border border-orange-500/20 rounded-lg transition"
              >
                <FaPlus size={10} /> Add Example
              </button>
            </div>

            {form.examples.map((ex, idx) => (
              <div key={idx} className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">Example #{idx + 1}</span>
                  {form.examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("examples", idx)}
                      className="text-gray-500 hover:text-red-400 text-xs"
                    >
                      <FaTrash size={10} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                  <input
                    placeholder="Input: e.g. nums = [2,7,11,15], target = 9"
                    value={ex.input}
                    onChange={(e) => handleNestedChange("examples", idx, "input", e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-lg p-2 text-white outline-none"
                  />
                  <input
                    placeholder="Output: e.g. [0,1]"
                    value={ex.output}
                    onChange={(e) => handleNestedChange("examples", idx, "output", e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-lg p-2 text-white outline-none"
                  />
                </div>
                <input
                  placeholder="Explanation (Optional)"
                  value={ex.explanation}
                  onChange={(e) => handleNestedChange("examples", idx, "explanation", e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-gray-300 outline-none"
                />
              </div>
            ))}
          </div>

          {/* CONSTRAINTS */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-orange-400 font-bold">
                Constraints
              </label>
              <button
                type="button"
                onClick={() => addField("constraints", "")}
                className="flex items-center gap-1 text-[11px] px-3 py-1 bg-white/5 hover:bg-white/10 text-orange-400 border border-orange-500/20 rounded-lg transition"
              >
                <FaPlus size={10} /> Add Constraint
              </button>
            </div>

            {form.constraints.map((c, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={c}
                  placeholder="e.g. 1 <= nums.length <= 10^5"
                  onChange={(e) => handleSimpleArrayChange("constraints", idx, e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                />
                {form.constraints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField("constraints", idx)}
                    className="p-2.5 text-gray-500 hover:text-red-400 rounded-xl bg-white/5"
                  >
                    <FaTrash size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* TOPICS & COMPANIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="text-xs uppercase tracking-widest text-orange-400 font-bold block mb-2 flex items-center gap-1.5">
                <FaLayerGroup /> Topics & Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-1.5"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, topics: form.topics.filter((_, i) => i !== idx) })}
                      className="text-gray-500 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-orange-400 font-bold block mb-2 flex items-center gap-1.5">
                <FaBuilding /> Target Companies
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.companies.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs font-bold text-orange-400 flex items-center gap-1.5"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, companies: form.companies.filter((_, i) => i !== idx) })}
                      className="text-orange-400/50 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* OFFLINE DATABASE HINTS */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="text-xs uppercase tracking-widest text-orange-400 font-bold flex items-center gap-1.5">
              <FaLightbulb /> Offline Database Hints (H1, H2, H3)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                placeholder="Hint 1: General intuition"
                value={form.hints.h1}
                onChange={(e) => handleHintChange("h1", e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
              />
              <input
                placeholder="Hint 2: Data structure / trick"
                value={form.hints.h2}
                onChange={(e) => handleHintChange("h2", e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
              />
              <input
                placeholder="Hint 3: Edge cases / complexity"
                value={form.hints.h3}
                onChange={(e) => handleHintChange("h3", e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* TESTCASES */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-orange-400 font-bold">
                Verification Testcases (Judge0 In/Out)
              </label>
              <button
                type="button"
                onClick={() => addField("testcases", { input: "", output: "", hidden: true })}
                className="flex items-center gap-1 text-[11px] px-3 py-1 bg-white/5 hover:bg-white/10 text-orange-400 border border-orange-500/20 rounded-lg transition"
              >
                <FaPlus size={10} /> Add Testcase
              </button>
            </div>

            {form.testcases.map((tc, idx) => (
              <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-400 font-bold">Testcase #{idx + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 text-xs">
                      <input
                        type="checkbox"
                        checked={tc.hidden}
                        onChange={(e) => handleNestedChange("testcases", idx, "hidden", e.target.checked)}
                        className="rounded text-orange-500"
                      />
                      <span>Hidden from user</span>
                    </label>
                    {form.testcases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField("testcases", idx)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <FaTrash size={10} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                  <textarea
                    placeholder="Input (stdin)"
                    value={tc.input}
                    onChange={(e) => handleNestedChange("testcases", idx, "input", e.target.value)}
                    rows={2}
                    className="bg-black/60 border border-white/10 rounded-lg p-2 text-white outline-none"
                  ></textarea>
                  <textarea
                    placeholder="Expected Output (stdout)"
                    value={tc.output}
                    onChange={(e) => handleNestedChange("testcases", idx, "output", e.target.value)}
                    rows={2}
                    className="bg-black/60 border border-white/10 rounded-lg p-2 text-green-300 outline-none"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={submitProblem}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {submitting ? "PUBLISHING TO DATABASE..." : "PUBLISH TO ARENA DATABASE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProgram;

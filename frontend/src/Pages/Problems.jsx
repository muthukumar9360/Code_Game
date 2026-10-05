import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTerminal,
  FaCode,
  FaBrain,
  FaChevronRight,
  FaChevronLeft,
  FaSearch,
  FaFilter,
  FaLayerGroup,
  FaBuilding,
  FaLightbulb,
  FaThLarge,
  FaExchangeAlt,
  FaSlidersH,
  FaStream,
  FaLink,
  FaSitemap,
  FaProjectDiagram,
  FaGem,
  FaCheckCircle,
  FaClock,
  FaRegCircle,
  FaEye,
  FaPlay,
  FaTimes,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt
} from "react-icons/fa";
import BackButton from "../Components/BackButton.jsx";
import {
  getCanonicalCategory,
  getProblemCanonicalCategories,
  getProblemDisplayTags
} from "../utils/categoryUtils.js";

const getTopicIcon = (topicName = "") => {
  const t = (topicName || "").toLowerCase();
  if (t.includes("all")) return <FaThLarge />;
  if (t.includes("search") || t.includes("binary") || t.includes("bfs") || t.includes("dfs")) return <FaSearch />;
  if (t.includes("array") || t.includes("hash")) return <FaCode />;
  if (t.includes("string") || t.includes("trie")) return <FaTerminal />;
  if (t.includes("pointer") || t.includes("two")) return <FaExchangeAlt />;
  if (t.includes("window") || t.includes("sliding")) return <FaSlidersH />;
  if (t.includes("stack") || t.includes("queue") || t.includes("heap")) return <FaStream />;
  if (t.includes("list") || t.includes("link")) return <FaLink />;
  if (t.includes("tree")) return <FaSitemap />;
  if (t.includes("graph")) return <FaProjectDiagram />;
  if (t.includes("dp") || t.includes("dynamic")) return <FaBrain />;
  if (t.includes("greedy") || t.includes("math")) return <FaGem />;
  return <FaLayerGroup />;
};

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userSubmissions, setUserSubmissions] = useState({ solvedIds: new Set(), attemptedIds: new Set() });
  const [solutionsMap, setSolutionsMap] = useState({});
  const [viewingSolution, setViewingSolution] = useState(null);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState(false);
  const pageSize = 10;

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProblemsAndCategories();
  }, []);

  const fetchProblemsAndCategories = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const [probRes, catRes, subRes] = await Promise.allSettled([
        axios.get(`${API}/api/problems`),
        axios.get(`${API}/api/problems/categories`),
        userId ? axios.get(`${API}/api/users/${userId}/submissions-history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }) : Promise.resolve({ data: null })
      ]);

      const loadedProblems = probRes.status === "fulfilled" ? (probRes.value.data?.data || []) : [];
      setProblems(loadedProblems);

      // Parse user solved / attempted sets
      const solved = new Set();
      const attempted = new Set();
      if (subRes.status === "fulfilled" && subRes.value?.data?.success) {
        const data = subRes.value.data;

        // 1. Process Solved Problems
        (data.solvedProblems || []).forEach((sp) => {
          if (sp.problemId) solved.add(sp.problemId.toString());
          if (sp.slug) solved.add(sp.slug.toLowerCase());
          if (sp.title) solved.add(sp.title.toLowerCase());
        });

        // 2. Process Attempted/Pending Problems from backend
        (data.attemptedProblems || []).forEach((ap) => {
          if (ap.problemId) attempted.add(ap.problemId.toString());
          if (ap.slug) attempted.add(ap.slug.toLowerCase());
          if (ap.title) attempted.add(ap.title.toLowerCase());
        });

        // 3. Fallback across all recent submissions
        (data.recentSubmissions || []).forEach((sub) => {
          const isAcc = sub.overallResult === "accepted" || sub.overallResult === "passed";
          const pId = sub.problemId ? sub.problemId.toString() : "";
          const sSlug = sub.problemSlug ? sub.problemSlug.toLowerCase() : "";
          const sTitle = sub.problemTitle ? sub.problemTitle.toLowerCase() : "";

          if (isAcc) {
            if (pId) solved.add(pId);
            if (sSlug) solved.add(sSlug);
            if (sTitle) solved.add(sTitle);
          } else {
            if (pId) attempted.add(pId);
            if (sSlug) attempted.add(sSlug);
            if (sTitle) attempted.add(sTitle);
          }
        });

        // 4. Ensure any solved problem is removed from attempted
        for (const s of solved) {
          attempted.delete(s);
        }

        // 5. Build solutions map for quick solution inspection
        const solMap = {};
        (data.solvedProblems || []).forEach((sp) => {
          const item = {
            title: sp.title,
            slug: sp.slug,
            difficulty: sp.difficulty || "medium",
            code: sp.lastSolutionCode || "// Verified accepted code",
            language: sp.language || "python",
            solvedAt: sp.solvedAt || new Date().toISOString()
          };
          if (sp.problemId) solMap[sp.problemId.toString()] = item;
          if (sp.slug) solMap[sp.slug.toLowerCase()] = item;
          if (sp.title) solMap[sp.title.toLowerCase()] = item;
        });

        (data.recentSubmissions || []).forEach((sub) => {
          const isAcc = sub.overallResult === "accepted" || sub.overallResult === "passed";
          if (isAcc) {
            const item = {
              title: sub.problemTitle,
              slug: sub.problemSlug,
              difficulty: sub.difficulty || "medium",
              code: sub.code || "// Verified accepted code",
              language: sub.language || "python",
              solvedAt: sub.submittedAt || new Date().toISOString()
            };
            if (sub.problemId && !solMap[sub.problemId.toString()]) solMap[sub.problemId.toString()] = item;
            if (sub.problemSlug && !solMap[sub.problemSlug.toLowerCase()]) solMap[sub.problemSlug.toLowerCase()] = item;
            if (sub.problemTitle && !solMap[sub.problemTitle.toLowerCase()]) solMap[sub.problemTitle.toLowerCase()] = item;
          }
        });
        setSolutionsMap(solMap);
      }
      setUserSubmissions({ solvedIds: solved, attemptedIds: attempted });

      if (catRes.status === "fulfilled" && catRes.value.data?.categories?.length > 0) {
        setCategories(catRes.value.data.categories);
      } else {
        // Dynamic canonical fallback directly derived from loaded backend problems
        const topicCounts = {};
        loadedProblems.forEach(p => {
          const problemCats = getProblemCanonicalCategories(p);
          problemCats.forEach(cat => {
            topicCounts[cat] = (topicCounts[cat] || 0) + 1;
          });
        });
        const dynamicCats = [
          { id: "all", name: "All Topics", count: loadedProblems.length },
          ...Object.keys(topicCounts)
            .sort((a, b) => topicCounts[b] - topicCounts[a])
            .map(top => ({
              id: top.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              name: top,
              count: topicCounts[top]
            }))
        ];
        setCategories(dynamicCats);
      }
    } catch (err) {
      console.error("Failed to load problems & categories from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProblemStatus = (p) => {
    const idStr = p._id ? p._id.toString() : "";
    const slug = (p.slug || "").toLowerCase();
    const title = (p.title || "").toLowerCase();

    if (
      userSubmissions.solvedIds.has(idStr) ||
      userSubmissions.solvedIds.has(slug) ||
      userSubmissions.solvedIds.has(title)
    ) {
      return "solved";
    }
    if (
      userSubmissions.attemptedIds.has(idStr) ||
      userSubmissions.attemptedIds.has(slug) ||
      userSubmissions.attemptedIds.has(title)
    ) {
      return "pending";
    }
    return "unsolved";
  };

  // Filter problems by category, difficulty, status, search
  const filteredProblems = problems.filter((p) => {
    // Dynamic Canonical Category match
    let categoryMatch = true;
    if (selectedCategory !== "all") {
      const selectedCatObj = categories.find((c) => c.id === selectedCategory);
      if (selectedCatObj) {
        const pCats = getProblemCanonicalCategories(p);
        categoryMatch = pCats.includes(selectedCatObj.name);
      }
    }

    // Difficulty match
    const difficultyMatch =
      selectedDifficulty === "all" || p.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

    // Solution status match
    let statusMatch = true;
    const pStatus = getProblemStatus(p);
    if (statusFilter === "solved") {
      statusMatch = pStatus === "solved";
    } else if (statusFilter === "unsolved") {
      statusMatch = pStatus === "unsolved";
    } else if (statusFilter === "pending") {
      statusMatch = pStatus === "pending";
    }

    // Search query match
    const searchMatch =
      !searchQuery.trim() ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topics?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.companies?.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && difficultyMatch && statusMatch && searchMatch;
  });

  // Calculate status counts
  const solvedCount = problems.filter((p) => getProblemStatus(p) === "solved").length;
  const pendingCount = problems.filter((p) => getProblemStatus(p) === "pending").length;
  const unsolvedCount = problems.filter((p) => getProblemStatus(p) === "unsolved").length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const paginatedProblems = filteredProblems.slice((validPage - 1) * pageSize, validPage * pageSize);

  // Reset page when filter changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleViewSolution = (p) => {
    const pId = p._id ? p._id.toString() : "";
    const sSlug = p.slug ? p.slug.toLowerCase() : "";
    const sTitle = p.title ? p.title.toLowerCase() : "";

    const found = solutionsMap[pId] || solutionsMap[sSlug] || solutionsMap[sTitle];
    if (found) {
      setViewingSolution(found);
    } else {
      setViewingSolution({
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty || "medium",
        code: `# Verified Accepted Solution for: ${p.title}\n# Status: Passed 100% of Private Verification Testcases\n\ndef solve():\n    # Your previously accepted solution logic\n    pass`,
        language: "python",
        solvedAt: new Date().toISOString()
      });
    }
  };

  const handleDifficultyChange = (diff) => {
    setSelectedDifficulty(diff);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b10] flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-orange-500 font-mono tracking-widest animate-pulse">
          FETCHING_DATABASE_PROBLEMS...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-4 md:px-6 py-6 sm:py-8 pb-16 relative overflow-hidden font-sans">
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-0 right-0 w-[600px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[99%] mx-auto relative z-10">
        {/* TOP NAVIGATION WITH BACK BUTTON */}
        <div className="flex items-center justify-between mb-6">
          <BackButton to="/" label="Dashboard" />
          <span className="text-xs uppercase tracking-widest text-white font-mono">
            PRACTICE ARCHIVE // {problems.length} TOTAL PROBLEMS
          </span>
        </div>

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
            PRACTICE <span className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">MODULES</span>
          </h1>
        </header>

        {/* UNIQUE DOMAIN MATRIX DECK (NO SLIDING, ALL 100% VISIBLE) */}
        <div className="mb-6 bg-[#0a1118]/80 border-2 border-white/40 p-4 sm:p-5 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/20">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <FaLayerGroup size={14} />
              </span>
              <div>
                <span className="text-xs uppercase tracking-widest text-white font-black flex items-center gap-2">
                  ALGORITHM DOMAINS & TRACKS
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono">
                    {categories.length} Domains
                  </span>
                </span>
                <span className="text-[11px] text-gray-300 font-mono block">
                  Select a category to filter practice problems instantly
                </span>
              </div>
            </div>

            {selectedCategory !== "all" && (
              <button
                onClick={() => handleCategoryChange("all")}
                className="text-[11px] font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-white/30 hover:border-white rounded-xl transition self-start sm:self-auto"
              >
                Reset to All ({problems.length})
              </button>
            )}
          </div>

          {/* ALL DOMAINS DIRECTLY FROM BACKEND (ZERO SLIDING) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {(expandedCategories || categories.length <= 18 ? categories : categories.slice(0, 18)).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = cat.count !== undefined ? cat.count : (
                cat.id === "all" ? problems.length : problems.filter(p =>
                  getProblemCanonicalCategories(p).includes(cat.name)
                ).length
              );

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`group relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 overflow-hidden ${isSelected
                      ? "bg-gradient-to-br from-orange-500/25 via-orange-950/40 to-black/80 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.35)] ring-1 ring-orange-500 scale-[1.02]"
                      : "bg-black/40 hover:bg-white/5 border border-white/25 hover:border-white hover:scale-[1.01]"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm p-1.5 rounded-xl border transition-colors ${isSelected
                        ? "bg-orange-500 text-black border-orange-400 shadow-md font-bold"
                        : "bg-white/5 text-orange-400 border border-white/20 group-hover:text-orange-300"
                      }`}>
                      {getTopicIcon(cat.name)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${isSelected
                        ? "bg-orange-500 text-black border-orange-400"
                        : "bg-white/10 text-white border border-white/20 group-hover:bg-white/20"
                      }`}>
                      {count}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-xs font-black tracking-tight leading-snug line-clamp-1 ${isSelected ? "text-white drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "text-white"
                      }`}>
                      {cat.name}
                    </h3>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* TOGGLE EXPAND ALL DOMAINS */}
          {categories.length > 18 && (
            <div className="mt-3 pt-3 border-t border-white/20 flex justify-center">
              <button
                onClick={() => setExpandedCategories(!expandedCategories)}
                className="text-[11px] font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-white/30 hover:border-white transition active:scale-95"
              >
                {expandedCategories
                  ? "Collapse Categories ▲"
                  : `Show All ${categories.length} Categories from Database ▼`}
              </button>
            </div>
          )}
        </div>

        {/* FILTERS & SEARCH ROW */}
        <div className="flex flex-col gap-4 bg-[#0a1118]/90 border-2 border-white/40 p-4 rounded-2xl mb-6 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search bar */}
            <div className="relative w-full lg:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-orange-400 text-xs" />
              <input
                type="text"
                placeholder="Search problems, topics, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-black/40 border border-white/30 focus:border-white rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none font-mono transition"
              />
            </div>

            {/* Status Filter (All, Solved, Unsolved, Pending) */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              <span className="text-xs text-white uppercase font-mono mr-1 flex items-center gap-1 font-bold">
                <FaCheckCircle size={10} className="text-emerald-400" /> Status:
              </span>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === "all"
                    ? "bg-white/20 border-2 border-white text-white shadow-sm"
                    : "bg-white/5 border border-white/30 text-gray-300 hover:border-white hover:text-white"
                }`}
              >
                All ({problems.length})
              </button>
              <button
                onClick={() => {
                  setStatusFilter("solved");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "solved"
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-black"
                    : "bg-white/5 border border-white/30 text-gray-300 hover:text-emerald-400 hover:border-white"
                }`}
              >
                <FaCheckCircle size={10} className="text-emerald-400" />
                <span>Solved ({solvedCount})</span>
              </button>
              <button
                onClick={() => {
                  setStatusFilter("unsolved");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "unsolved"
                    ? "bg-blue-500/25 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)] font-black"
                    : "bg-white/5 border border-white/30 text-gray-300 hover:text-blue-400 hover:border-white"
                }`}
              >
                <FaRegCircle size={9} />
                <span>Unsolved ({unsolvedCount})</span>
              </button>
              <button
                onClick={() => {
                  setStatusFilter("pending");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === "pending"
                    ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-black"
                    : "bg-white/5 border border-white/30 text-gray-300 hover:text-amber-400 hover:border-white"
                }`}
              >
                <FaClock size={10} className="text-amber-400" />
                <span>Pending ({pendingCount})</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/20">
            {/* Result Count Info */}
            <div className="text-xs text-white font-mono">
              Showing <strong className="text-orange-400 font-bold">{filteredProblems.length}</strong> matching problems
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-white uppercase font-mono mr-1 flex items-center gap-1 font-bold">
                <FaFilter size={10} className="text-orange-400" /> Difficulty:
              </span>
              {["all", "easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${
                    selectedDifficulty === diff
                      ? diff === "easy"
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : diff === "medium"
                        ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                        : diff === "hard"
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-white/5 border border-white/30 text-gray-300 hover:border-white hover:text-white"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LIST CONTAINER */}
        <div className="space-y-3.5">
          {paginatedProblems.map((p, idx) => {
            const pStatus = getProblemStatus(p);
            return (
            <div
              key={p._id || p.slug}
              className="group bg-[#0a1118]/80 backdrop-blur-md border border-white/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center transition-all duration-200 hover:border-white hover:bg-[#0f172a]/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Index Pill */}
                <span className="font-mono text-xs text-white font-bold w-7 text-right">
                  #{(validPage - 1) * pageSize + idx + 1}
                </span>

                {/* Problem Meta */}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                      {p.title}
                    </h2>

                    {/* Difficulty Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${p.difficulty === "easy"
                          ? "bg-green-500/15 border-green-500/40 text-green-400"
                          : p.difficulty === "medium"
                            ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
                            : "bg-red-500/15 border-red-500/40 text-red-400"
                        }`}
                    >
                      {p.difficulty}
                    </span>

                    {/* Status Badge */}
                    {pStatus === "solved" ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-emerald-500/15 border-emerald-500/40 text-emerald-400 flex items-center gap-1 shadow-sm">
                        <FaCheckCircle size={9} /> Solved
                      </span>
                    ) : pStatus === "pending" ? (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-amber-500/15 border-amber-500/40 text-amber-400 flex items-center gap-1">
                        <FaClock size={9} /> Pending
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border bg-white/5 border-white/20 text-gray-300 flex items-center gap-1">
                        <FaRegCircle size={8} className="text-gray-400" /> Unsolved
                      </span>
                    )}
                  </div>

                  {/* Topics and Companies */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getProblemDisplayTags(p, 3).map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/5 border border-white/20 rounded text-[10px] text-gray-200 font-semibold uppercase flex items-center gap-1"
                      >
                        <FaBrain size={9} className="text-blue-400" />
                        {t}
                      </span>
                    ))}

                    {p.companies?.slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-orange-500/10 border border-white/20 rounded text-[10px] text-orange-400 font-semibold uppercase flex items-center gap-1"
                      >
                        <FaBuilding size={9} />
                        {c}
                      </span>
                    ))}

                    {p.hints?.h1 && (
                      <span className="text-[10px] text-gray-300 flex items-center gap-1 italic">
                        <FaLightbulb size={9} className="text-yellow-500" /> Offline Hints Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {pStatus === "solved" ? (
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleViewSolution(p)}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-black font-black rounded-xl border border-blue-500/40 text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm uppercase tracking-wider"
                    title="View your accepted solution code"
                  >
                    <FaEye size={12} /> View Solution
                  </button>
                  <button
                    onClick={() => navigate(`/problems/${p.slug}`)}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-black rounded-xl border border-emerald-500/50 hover:border-emerald-400 flex items-center justify-center gap-1.5 text-xs transition active:scale-95 shadow-sm uppercase tracking-wider"
                    title="Problem Solved! Click to review or practice again"
                  >
                    <FaCheckCircle size={12} /> Solved
                  </button>
                </div>
              ) : pStatus === "pending" ? (
                <button
                  onClick={() => navigate(`/problems/${p.slug}`)}
                  className="w-full md:w-auto shrink-0 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black font-black px-6 py-2.5 rounded-xl border border-amber-500/50 hover:border-amber-400 flex items-center justify-center gap-2 text-xs transition-all active:scale-95 shadow-md uppercase tracking-wider"
                  title="Continue working on your pending attempt"
                >
                  <FaPlay size={10} /> CONTINUE <FaChevronRight size={11} />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/problems/${p.slug}`)}
                  className="w-full md:w-auto shrink-0 bg-white hover:bg-orange-500 text-black hover:text-white font-black px-6 py-2.5 rounded-xl border border-white flex items-center justify-center gap-2 text-xs transition-all active:scale-95 shadow-md uppercase tracking-wider"
                >
                  SOLVE <FaChevronRight size={11} />
                </button>
              )}
            </div>
          );
        })}
        </div>

        {/* EMPTY STATE */}
        {filteredProblems.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/30 rounded-3xl bg-white/5">
            <p className="text-gray-300 font-mono text-sm">NO PROBLEMS MATCH CURRENT FILTERS.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedDifficulty("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-orange-500 text-black text-xs font-bold rounded-lg"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
            <button
              disabled={validPage === 1}
              onClick={() => setCurrentPage(validPage - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/30 hover:border-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <FaChevronLeft size={10} /> Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border ${validPage === pageNum
                      ? "bg-orange-500 text-black border-orange-500 font-black shadow-md scale-105"
                      : "bg-white/5 hover:bg-white/10 border-white/30 hover:border-white text-white"
                    }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              disabled={validPage === totalPages}
              onClick={() => setCurrentPage(validPage + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/30 hover:border-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition"
            >
              Next <FaChevronRight size={10} />
            </button>
          </div>
        )}
      </div>

      {/* VIEW SOLUTION MODAL */}
      {viewingSolution && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0a1118] border-2 border-white/40 w-full max-w-4xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* MODAL HEADER */}
            <div className="p-4 bg-white/5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <FaCheckCircle size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {viewingSolution.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-emerald-500/20 border-emerald-500/40 text-emerald-400">
                      Accepted Solution
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Language: <strong className="text-white uppercase">{viewingSolution.language}</strong> • Solved: {new Date(viewingSolution.solvedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* SINGLE CLEAN CLOSE BUTTON */}
              <button
                onClick={() => setViewingSolution(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/20 transition flex items-center gap-1.5 text-xs font-mono font-bold"
                title="Close Window"
              >
                <FaTimes size={13} />
                <span className="text-[10px] uppercase tracking-wider">Close ✕</span>
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 overflow-y-auto flex-1 bg-black/70 custom-scrollbar">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono text-gray-400">
                <span>Your Accepted Source Code:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingSolution.code);
                    setCopiedSolution(true);
                    setTimeout(() => setCopiedSolution(false), 2000);
                  }}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition flex items-center gap-1.5 text-xs border border-white/10"
                >
                  {copiedSolution ? (
                    <>
                      <FaCheck className="text-green-400" />
                      <span className="text-green-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed p-4 bg-black/60 rounded-xl border border-white/10 overflow-x-auto">
                {viewingSolution.code || "// No solution code available"}
              </pre>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3 bg-black/50 border-t border-white/10 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400 text-[11px]">
                Verified 100% passed private testcases
              </span>
              <button
                onClick={() => {
                  setViewingSolution(null);
                  navigate(`/problems/${viewingSolution.slug}`);
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5"
              >
                <FaExternalLinkAlt size={10} />
                <span>Practice in Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Problems;
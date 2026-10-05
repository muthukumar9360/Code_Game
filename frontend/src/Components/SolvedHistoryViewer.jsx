import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCode,
  FaCalendarAlt,
  FaSearch,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaTimes,
  FaHistory,
  FaFilter,
  FaBrain,
  FaMedal,
  FaTrophy,
  FaBolt,
  FaGamepad
} from "react-icons/fa";

const SolvedHistoryViewer = ({
  solvedProblems = [],
  recentSubmissions = [],
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'solved' | 'competitive'
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'accepted' | 'failed'
  const [sourceFilter, setSourceFilter] = useState("all"); // 'all' | 'practice' | 'competitive' | 'daily'
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getLanguageColor = (lang) => {
    const l = (lang || "").toLowerCase();
    if (l.includes("python")) return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    if (l.includes("javascript")) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    if (l.includes("cpp") || l.includes("c++")) return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    if (l.includes("java")) return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    if (l.includes("c")) return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    return "bg-white/10 text-gray-300 border-white/20";
  };

  const getDifficultyBadge = (difficulty) => {
    const diff = (difficulty || "medium").toLowerCase();
    if (diff === "easy") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/30">
          Easy
        </span>
      );
    }
    if (diff === "hard") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
          Hard
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
        Medium
      </span>
    );
  };

  // Base list depending on activeTab
  const getBaseItems = () => {
    if (activeTab === "solved") {
      return solvedProblems;
    }
    if (activeTab === "competitive") {
      return recentSubmissions.filter((s) => s.isBattle || s.source === "competitive");
    }
    return recentSubmissions;
  };

  const baseItems = getBaseItems();

  // Multi-facet filter
  const filteredItems = baseItems.filter((item) => {
    const title = (item.title || item.problemTitle || "").toLowerCase();
    const lang = (item.language || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      title.includes(query) ||
      lang.includes(query) ||
      (item.battleRoomId || "").toLowerCase().includes(query);

    const matchesDiff =
      difficultyFilter === "all" ||
      (item.difficulty || "medium").toLowerCase() === difficultyFilter.toLowerCase();

    const isAccepted =
      (item.overallResult || "").toLowerCase() === "accepted" ||
      (item.overallResult || "").toLowerCase() === "passed";

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "accepted" && isAccepted) ||
      (statusFilter === "failed" && !isAccepted);

    const isBattle = Boolean(item.isBattle || item.source === "competitive");
    const isDaily = Boolean(item.isDailyChallenge || item.source === "daily");
    const isPractice = !isBattle && !isDaily;

    const matchesSource =
      sourceFilter === "all" ||
      (sourceFilter === "practice" && isPractice) ||
      (sourceFilter === "competitive" && isBattle) ||
      (sourceFilter === "daily" && isDaily);

    return matchesSearch && matchesDiff && matchesStatus && matchesSource;
  });

  const competitiveCount = recentSubmissions.filter((s) => s.isBattle || s.source === "competitive").length;

  return (
    <div className="bg-[#0a1118] border-2 border-white/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/20 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-400 font-bold mb-1">
            <FaHistory />
            <span>Submission Registry & Code Inspector</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Submission History & Code Archive
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Inspect all practice directives, competitive match attempts, and solved algorithms with full source code history
          </p>
        </div>

        {/* TAB TOGGLES */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-black/60 border border-white/30 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <FaHistory size={12} />
            <span>All Submissions ({recentSubmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("solved")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "solved"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <FaCheckCircle size={12} />
            <span>Solved Problems ({solvedProblems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("competitive")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "competitive"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <FaGamepad size={12} />
            <span>Competitive Arena ({competitiveCount})</span>
          </button>
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
        {/* SEARCH */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search by problem title, language, or room ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/30 rounded-xl text-xs text-white placeholder-gray-400 outline-none focus:border-white transition font-mono"
          />
        </div>

        {/* FACET FILTERS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SOURCE SELECTOR */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-300 shrink-0">Type:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-black/60 border border-white/30 rounded-xl text-xs font-mono text-white outline-none focus:border-white transition"
            >
              <option value="all">All Sources</option>
              <option value="practice">Solo Practice</option>
              <option value="competitive">Competitive Battles</option>
              <option value="daily">Daily Blitz</option>
            </select>
          </div>

          {/* STATUS SELECTOR */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-300 shrink-0">Verdict:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-black/60 border border-white/30 rounded-xl text-xs font-mono text-white outline-none focus:border-white transition"
            >
              <option value="all">All Verdicts</option>
              <option value="accepted">Accepted / Solved</option>
              <option value="failed">Wrong / Attempted</option>
            </select>
          </div>

          {/* DIFFICULTY SELECTOR */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-300 shrink-0">Diff:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-black/60 border border-white/30 rounded-xl text-xs font-mono text-white outline-none focus:border-white transition"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-mono text-xs">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading your submission telemetry...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-mono text-xs border border-white/10 rounded-2xl bg-black/20">
          <FaBrain className="mx-auto text-3xl text-gray-600 mb-2" />
          No submissions matching criteria found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const title = item.title || item.problemTitle || "Challenge Problem";
            const slug = item.slug || item.problemSlug;
            const isAccepted =
              (item.overallResult || "").toLowerCase() === "accepted" ||
              (item.overallResult || "").toLowerCase() === "passed";
            const codeToView = item.lastSolutionCode || item.code || "";
            const submittedAt = item.solvedAt || item.submittedAt;
            const lang = item.language || "python";

            const isBattle = Boolean(item.isBattle || item.source === "competitive");
            const isDaily = Boolean(item.isDailyChallenge || item.source === "daily");

            return (
              <div
                key={item.id || item.submissionId || idx}
                className="p-4 rounded-2xl bg-black/40 border border-white/30 hover:border-white transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* LEFT INFO */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="pt-0.5 sm:pt-0">
                    {isAccepted ? (
                      <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-sm" title="Accepted Solution">
                        <FaCheckCircle size={14} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm" title="Attempted (Failed Testcases)">
                        <FaTimesCircle size={14} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {slug ? (
                        <Link
                          to={`/problems/${slug}`}
                          className="font-black text-sm text-white hover:text-orange-400 transition truncate flex items-center gap-1.5"
                          title="Open problem in code workspace"
                        >
                          <span>{title}</span>
                          <FaExternalLinkAlt size={10} className="opacity-0 group-hover:opacity-100 transition text-orange-400" />
                        </Link>
                      ) : (
                        <span className="font-black text-sm text-white truncate">
                          {title}
                        </span>
                      )}

                      {getDifficultyBadge(item.difficulty)}

                      {/* SOURCE BADGE */}
                      {isBattle && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <FaGamepad size={9} />
                          {item.isRanked ? "Ranked 1v1 Battle" : "Contest Arena"}
                          {item.battleRoomId ? ` [${item.battleRoomId}]` : ""}
                        </span>
                      )}

                      {isDaily && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                          <FaBolt size={9} /> Daily Blitz
                        </span>
                      )}

                      {!isBattle && !isDaily && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          Solo Practice
                        </span>
                      )}

                      {/* VERDICT BADGE */}
                      {isAccepted ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Passed 100%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/30">
                          {item.totalTests > 0 ? `Passed ${item.testsPassed || 0}/${item.totalTests}` : "Wrong Answer"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-400">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold ${getLanguageColor(lang)}`}>
                        {lang}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} />
                        {formatTimestamp(submittedAt)}
                      </span>
                      {item.topics && item.topics.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-gray-500 truncate max-w-[200px]">
                            {item.topics.slice(0, 2).join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0 shrink-0">
                  <button
                    onClick={() =>
                      setSelectedSolution({
                        title,
                        slug,
                        difficulty: item.difficulty || "medium",
                        language: lang,
                        code: codeToView,
                        submittedAt,
                        isAccepted,
                        isBattle,
                        battleRoomId: item.battleRoomId,
                        testsPassed: item.testsPassed,
                        totalTests: item.totalTests
                      })
                    }
                    className="px-4 py-2 bg-white/5 hover:bg-orange-500/20 text-gray-200 hover:text-orange-400 border border-white/20 hover:border-orange-500/40 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 shadow-sm"
                  >
                    <FaCode size={12} />
                    <span>Inspect Code</span>
                  </button>

                  {slug && (
                    <Link
                      to={`/problems/${slug}`}
                      className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5"
                      title="Practice again in code editor"
                    >
                      <FaExternalLinkAlt size={11} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SOLUTION CODE MODAL WITH SINGLE CLEAN CLOSE BUTTON */}
      {selectedSolution && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0a1118] border-2 border-white/40 w-full max-w-4xl max-h-[92vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* MODAL HEADER */}
            <div className="p-4 bg-white/5 border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl border border-white/30">
                  <FaCode size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {selectedSolution.title}
                    </h3>
                    {getDifficultyBadge(selectedSolution.difficulty)}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        selectedSolution.isAccepted
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {selectedSolution.isAccepted ? "Accepted Solution" : "Submission Attempt"}
                    </span>
                    {selectedSolution.isBattle && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Competitive Match {selectedSolution.battleRoomId ? `(${selectedSolution.battleRoomId})` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Language: <strong className="text-white uppercase">{selectedSolution.language}</strong> • Submitted: {new Date(selectedSolution.submittedAt).toLocaleString()}
                    {selectedSolution.totalTests > 0 && ` • Tests: ${selectedSolution.testsPassed || 0}/${selectedSolution.totalTests}`}
                  </p>
                </div>
              </div>

              {/* SINGLE CLOSE BUTTON (AVOID DUPLICATES) */}
              <button
                onClick={() => setSelectedSolution(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/20 transition flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
                title="Close Window"
              >
                <FaTimes size={13} />
                <span className="text-[10px] uppercase tracking-wider">Close ✕</span>
              </button>
            </div>

            {/* CODE VIEWER BODY */}
            <div className="p-4 overflow-y-auto flex-1 bg-black/70 custom-scrollbar">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs font-mono text-gray-400">
                <span>Submitted Code Implementation:</span>
                <button
                  onClick={() => handleCopyCode(selectedSolution.code)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition flex items-center gap-1.5 text-xs border border-white/10"
                >
                  {copied ? (
                    <>
                      <FaCheck className="text-green-400" />
                      <span className="text-green-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      <span>Copy Source</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed p-4 bg-black/60 rounded-xl border border-white/10 overflow-x-auto">
                {selectedSolution.code || "// No source code recorded for this submission."}
              </pre>
            </div>

            {/* MODAL FOOTER - ACTION BAR WITHOUT DUPLICATE CLOSE BUTTON */}
            <div className="p-3 bg-black/50 border-t border-white/10 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400 text-[11px]">
                Preserved solution snapshot from user submission history
              </span>
              <div className="flex items-center gap-2">
                {selectedSolution.slug && (
                  <Link
                    to={`/problems/${selectedSolution.slug}`}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <FaExternalLinkAlt size={10} />
                    <span>Practice in Editor</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolvedHistoryViewer;

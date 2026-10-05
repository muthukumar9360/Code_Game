import React, { useState, useMemo } from "react";
import {
  FaCode,
  FaCheck,
  FaCopy,
  FaTrophy,
  FaUserNinja,
  FaCheckCircle,
  FaTimesCircle,
  FaTerminal
} from "react-icons/fa";

const CodeDiffViewer = ({
  participants = [],
  problems = [],
  currentUserId,
  currentUsername
}) => {
  const activeParticipants = useMemo(() => {
    return participants || [];
  }, [participants]);

  const problemsList = useMemo(() => {
    if (Array.isArray(problems) && problems.length > 0) return problems;
    return [{ title: "Challenge Problem", _id: "single_problem" }];
  }, [problems]);

  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const safeProblemIndex = Math.min(activeProblemIndex, Math.max(0, problemsList.length - 1));
  const currentProblem = problemsList[safeProblemIndex] || problemsList[0];

  const safeUserIndex = Math.min(selectedUserIndex, Math.max(0, activeParticipants.length - 1));
  const selectedParticipant = activeParticipants[safeUserIndex] || activeParticipants[0];

  // Resolve solution for the selected participant on the selected question
  const currentSubmission = useMemo(() => {
    if (!selectedParticipant) return null;

    if (Array.isArray(selectedParticipant.submissions) && selectedParticipant.submissions.length > 0) {
      const match = selectedParticipant.submissions.find(
        (s, idx) =>
          (currentProblem?._id && s.problemId && s.problemId.toString() === currentProblem._id.toString()) ||
          idx === safeProblemIndex
      );
      if (match && match.code && match.code.trim()) return match;
    }

    const fallbackCode = selectedParticipant.code || selectedParticipant.lastCode || "";
    const fallbackLang = selectedParticipant.language || selectedParticipant.lastLanguage || "python";

    return {
      code: fallbackCode,
      language: fallbackLang,
      passedCount: selectedParticipant.bestScore || 0,
      totalTests: null,
      isSolved: selectedParticipant.result === "win"
    };
  }, [selectedParticipant, currentProblem, safeProblemIndex]);

  const codeText = currentSubmission?.code || "";
  const codeLines = codeText ? codeText.split("\n") : [];

  const handleCopy = () => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeParticipants || activeParticipants.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0a1118]/90 backdrop-blur-2xl border-2 border-white/40 rounded-3xl p-5 sm:p-7 shadow-2xl mb-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-white/20">
        <div>
          <div className="flex items-center gap-2">
            <FaTerminal className="text-orange-500 text-lg" />
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Post-Match Solution Inspector
            </h2>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Browse and learn from every participant's implementation across all arena challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/5 border border-white/20 rounded-full text-[10px] font-mono uppercase text-gray-300">
            {activeParticipants.length} Combatant{activeParticipants.length > 1 ? "s" : ""}
          </span>
          {problemsList.length > 1 && (
            <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] font-mono uppercase text-orange-400 font-bold">
              {problemsList.length} Questions
            </span>
          )}
        </div>
      </div>

      {/* QUESTION SELECTOR TABS (IF MULTIPLE QUESTIONS PRESENT) */}
      {problemsList.length > 1 && (
        <div className="mb-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold mb-2">
            Select Challenge Question:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {problemsList.map((prob, idx) => {
              const isActive = idx === safeProblemIndex;
              return (
                <button
                  key={prob._id || idx}
                  onClick={() => setActiveProblemIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 border cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-white shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                      : "bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/40"
                  }`}
                >
                  <span className="opacity-80">Q{idx + 1}:</span>
                  <span className="truncate max-w-[200px]">{prob.title || `Problem ${idx + 1}`}</span>
                  {prob.difficulty && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                      isActive ? "bg-black/30 text-black" : "bg-white/10 text-gray-300"
                    }`}>
                      {prob.difficulty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COMBATANT SELECTOR ROW (ALL PARTICIPANTS VIEWABLE) */}
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold mb-2">
          Select Combatant to Inspect:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {activeParticipants.map((p, idx) => {
            const isSelected = idx === safeUserIndex;
            const isCurrent = (p.userId && p.userId.toString() === currentUserId) || p.username === currentUsername;
            const isVictor = p.result === "win";

            // Find specific sub info for problem
            const sub = (Array.isArray(p.submissions) && p.submissions[safeProblemIndex]) || null;
            const hasSubmitted = Boolean(sub?.code || (!sub && p.code) || p.code || p.lastCode);
            const passed = sub?.passedCount !== undefined ? sub.passedCount : p.bestScore;

            return (
              <button
                key={idx}
                onClick={() => setSelectedUserIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-orange-500/15 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-400"
                    : "bg-[#050b12] border-white/20 hover:border-white/40 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                    isVictor
                      ? "bg-yellow-500 text-black border-yellow-400 shadow-md"
                      : "bg-white/10 text-gray-300 border-white/20"
                  }`}>
                    {isVictor ? <FaTrophy size={11} /> : <FaUserNinja size={11} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white truncate">
                        {p.username || `Player ${idx + 1}`}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0 border border-orange-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1 mt-0.5">
                      {hasSubmitted ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <FaCheckCircle size={9} /> {passed} Passed
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center gap-1">
                          <FaTimesCircle size={9} /> No Submission
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isVictor && (
                  <span className="text-[9px] text-yellow-400 font-mono font-bold uppercase bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/30 shrink-0">
                    Victor
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* INSPECTED SOLUTION CODE CONTAINER */}
      <div className="bg-[#050b10] border-2 border-white/30 rounded-2xl overflow-hidden shadow-2xl">
        {/* SUBMISSION CODE BAR */}
        <div className="px-4 py-3 bg-[#0c1622] border-b border-white/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <FaCode className="text-orange-400 text-sm" />
              <span className="font-mono text-xs font-bold text-white">
                {selectedParticipant?.username || "Combatant"}'s Solution
              </span>
            </div>

            <span className="text-gray-500">|</span>

            <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-[10px] font-black uppercase tracking-wider border border-white/20">
              {currentSubmission?.language || selectedParticipant?.language || "javascript"}
            </span>

            {currentSubmission?.passedCount !== undefined && (
              <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                currentSubmission.isSolved || currentSubmission.passedCount > 0
                  ? "bg-green-500/15 text-green-300 border-green-500/30"
                  : "bg-gray-500/15 text-gray-400 border-white/10"
              }`}>
                <FaCheckCircle size={9} />
                {currentSubmission.totalTests
                  ? `${currentSubmission.passedCount}/${currentSubmission.totalTests} Verified`
                  : `${currentSubmission.passedCount} Testcases Passed`}
              </span>
            )}
          </div>

          {/* COPY CODE BUTTON */}
          <button
            onClick={handleCopy}
            disabled={!codeText}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-gray-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-white/30 hover:border-white cursor-pointer"
          >
            {copied ? (
              <>
                <FaCheck className="text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <FaCopy />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* CODE CONTENT WITH LINE NUMBERS */}
        <div className="p-4 sm:p-5 font-mono text-xs text-gray-200 overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar select-text bg-[#03070b]">
          {codeText ? (
            <div className="table w-full">
              {codeLines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-white/5 transition-colors">
                  <span className="table-cell pr-4 sm:pr-6 text-right select-none text-gray-500 font-mono text-[11px] w-12 border-r border-white/10">
                    {idx + 1}
                  </span>
                  <span className="table-cell pl-4 font-mono whitespace-pre leading-relaxed text-gray-100">
                    {line || " "}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500 font-mono space-y-2">
              <FaCode className="text-3xl text-gray-600 mb-1" />
              <p className="text-sm font-bold text-gray-400">
                No solution submitted for this challenge by {selectedParticipant?.username || "this combatant"}.
              </p>
              <p className="text-xs text-gray-600">
                Check other challenge tabs or select another combatant from the list above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeDiffViewer;

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaShieldAlt,
  FaFileDownload,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaUsers,
  FaPercentage,
  FaAward
} from "react-icons/fa";

const HackathonReportModal = ({ battleId, isOpen, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!isOpen || !battleId) return;

    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/battles/${battleId}/hackathon-report`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && res.data.report) {
          setReport(res.data.report);
        } else {
          setError("Failed to generate hackathon report.");
        }
      } catch (err) {
        console.error("Hackathon report error:", err);
        setError(err.response?.data?.error || "Error generating report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, battleId, API]);

  if (!isOpen) return null;

  const downloadCsvFile = () => {
    if (!report?.csvData) return;
    const blob = new Blob([report.csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hackathon_report_${report.roomId || battleId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0a1118]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
              <FaShieldAlt size={18} />
            </span>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                Hackathon & Tournament Integrity Report
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Plagiarism similarity analysis and official gradebook export.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-widest animate-pulse">
              Computing AST Similarity Matrix...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-400">
            <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : report ? (
          <div className="overflow-y-auto space-y-5 text-xs font-mono pr-1">
            {/* OVERVIEW METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase block">Total Participants</span>
                <span className="text-lg font-black text-white">{report.totalParticipants}</span>
              </div>
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase block">Tournament Problem</span>
                <span className="text-xs font-bold text-orange-400 truncate block">{report.problemTitle || "Challenge"}</span>
              </div>
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl">
                <span className="text-[10px] text-gray-400 uppercase block">Plagiarism Flags</span>
                <span className={`text-lg font-black ${report.flaggedPairs?.length > 0 ? "text-red-400" : "text-green-400"}`}>
                  {report.flaggedPairs?.length || 0}
                </span>
              </div>
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl flex items-center justify-center">
                <button
                  onClick={downloadCsvFile}
                  className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition"
                >
                  <FaFileDownload /> Export CSV
                </button>
              </div>
            </div>

            {/* PLAGIARISM SUSPICION ALERTS */}
            {report.flaggedPairs?.length > 0 ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <FaExclamationTriangle />
                  <span>Plagiarism Alerts Detected (Similarity &ge; 75%)</span>
                </div>
                <div className="space-y-1.5">
                  {report.flaggedPairs.map((fp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-black/60 rounded-xl border border-red-500/20 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{fp.user1}</span>
                        <span className="text-gray-500">↔</span>
                        <span className="font-bold text-white">{fp.user2}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-bold">{fp.similarity}% Token Match</span>
                        <span className="text-[9px] px-2 py-0.5 rounded uppercase font-bold bg-red-500 text-black">
                          {fp.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-2 text-green-300">
                <FaCheckCircle className="text-green-400 text-base" />
                <span>Code Integrity Verified: Zero suspicious submission cross-matches detected.</span>
              </div>
            )}

            {/* PARTICIPANT STANDINGS TABLE */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-3">
                Official Submission Scoreboard
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {report.participants.map((p, idx) => (
                  <div
                    key={p.username}
                    className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-gray-500 font-bold">#{idx + 1}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{p.username}</span>
                          {p.isFlagged && (
                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">
                              Flagged
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          Score: {p.bestScore} Passed • {p.result?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-orange-400">{p.bestScore} Passed</div>
                      <span className="text-[10px] text-gray-500 uppercase">{p.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HackathonReportModal;
